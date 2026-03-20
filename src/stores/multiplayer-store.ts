'use client';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { GameState, ActionType, CharacterName } from '@/lib/engine/types';
import {
  initGame, declareAction, challengeAction, declareBlock,
  challengeBlock, passBlock, loseInfluence, completeExchange, resolveAction, passChallenge,
} from '@/lib/engine/game-engine';
import { getPlayerId, generateRoomCode } from '@/lib/player-identity';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RoomPlayer {
  player_id: string;
  player_name: string;
  seat_index: number;
  is_ready: boolean;
}

export interface GameMove {
  type: 'action' | 'challenge' | 'pass_challenge' | 'block' | 'pass_block' | 'challenge_block' | 'lose_influence' | 'exchange_complete';
  playerId: string;
  actionType?: ActionType;
  targetId?: string;
  character?: CharacterName;
  cardId?: string;
  keptCardIds?: string[];
}

interface MultiplayerStore {
  // Connection
  roomCode: string | null;
  roomId: string | null;
  roomPlayers: RoomPlayer[];
  myPlayerId: string;
  myPlayerName: string;
  isHost: boolean;
  channel: RealtimeChannel | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: string | null;

  // Game
  gameState: GameState | null;

  // Actions
  createRoom: (playerName: string, maxPlayers: number) => Promise<string>;
  joinRoom: (code: string, playerName: string) => Promise<void>;
  leaveRoom: () => void;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;

  // In-game moves
  sendMove: (move: GameMove) => void;

  // Internal
  subscribeToRoom: (roomId: string, code: string) => Promise<void>;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  roomCode: null,
  roomId: null,
  roomPlayers: [],
  myPlayerId: '',
  myPlayerName: '',
  isHost: false,
  channel: null,
  connectionStatus: 'disconnected',
  error: null,
  gameState: null,

  createRoom: async (playerName, maxPlayers) => {
    const playerId = getPlayerId();
    const code = generateRoomCode();

    set({ connectionStatus: 'connecting', error: null, myPlayerId: playerId, myPlayerName: playerName });

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({ code, host_player_id: playerId, max_players: maxPlayers })
      .select()
      .single();

    if (roomError || !room) {
      set({ error: roomError?.message ?? 'Failed to create room', connectionStatus: 'disconnected' });
      throw roomError ?? new Error('Failed to create room');
    }

    await supabase.from('room_players').insert({
      room_id: room.id,
      player_id: playerId,
      player_name: playerName,
      seat_index: 0,
      is_ready: false,
    });

    set({ roomCode: code, roomId: room.id, isHost: true });
    await get().subscribeToRoom(room.id, code);
    return code;
  },

  joinRoom: async (code, playerName) => {
    const playerId = getPlayerId();
    set({ connectionStatus: 'connecting', error: null, myPlayerId: playerId, myPlayerName: playerName });

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*, room_players(*)')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !room) {
      set({ error: 'Room not found', connectionStatus: 'disconnected' });
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      set({ error: 'Game already started', connectionStatus: 'disconnected' });
      throw new Error('Game already started');
    }

    const existingPlayers = (room.room_players as RoomPlayer[]) || [];

    // If already in the room, just reconnect
    const alreadyJoined = existingPlayers.find(p => p.player_id === playerId);
    if (!alreadyJoined) {
      if (existingPlayers.length >= room.max_players) {
        set({ error: 'Room is full', connectionStatus: 'disconnected' });
        throw new Error('Room is full');
      }

      const seatIndex = existingPlayers.length;
      await supabase.from('room_players').insert({
        room_id: room.id,
        player_id: playerId,
        player_name: playerName,
        seat_index: seatIndex,
        is_ready: false,
      });
    }

    const isHost = room.host_player_id === playerId;
    set({ roomCode: code.toUpperCase(), roomId: room.id, isHost });
    await get().subscribeToRoom(room.id, code.toUpperCase());
  },

  subscribeToRoom: async (roomId: string, code: string) => {
    // Subscribe to room players changes via postgres_changes
    supabase
      .channel(`room-db-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId)
            .order('seat_index')
            .then(({ data }) => {
              if (data) set({ roomPlayers: data as RoomPlayer[] });
            });
        }
      )
      .subscribe();

    // Realtime broadcast channel for game state
    const gameChannel = supabase.channel(`game-${code}`, {
      config: { broadcast: { self: true } },
    });

    gameChannel
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        set({ gameState: payload.state as GameState });
      })
      .on('broadcast', { event: 'player_move' }, ({ payload }) => {
        const { isHost, gameState } = get();
        if (!isHost || !gameState) return;
        const move = payload as GameMove;
        processMove(gameState, move, set, get);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ connectionStatus: 'connected' });
        }
      });

    // Load initial players
    const { data: players } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('seat_index');

    if (players) set({ roomPlayers: players as RoomPlayer[] });
    set({ channel: gameChannel });
  },

  leaveRoom: () => {
    const { channel, roomId, myPlayerId } = get();
    if (channel) supabase.removeChannel(channel);
    if (roomId && myPlayerId) {
      supabase.from('room_players').delete().eq('room_id', roomId).eq('player_id', myPlayerId);
    }
    set({
      roomCode: null,
      roomId: null,
      roomPlayers: [],
      isHost: false,
      channel: null,
      gameState: null,
      connectionStatus: 'disconnected',
      error: null,
    });
  },

  toggleReady: async () => {
    const { roomId, myPlayerId, roomPlayers } = get();
    const me = roomPlayers.find(p => p.player_id === myPlayerId);
    if (!me || !roomId) return;
    await supabase
      .from('room_players')
      .update({ is_ready: !me.is_ready })
      .eq('room_id', roomId)
      .eq('player_id', myPlayerId);
  },

  startGame: async () => {
    const { roomId, roomPlayers, channel } = get();
    if (!roomId || !channel) return;

    await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId);

    // All players are human in multiplayer
    const configs = roomPlayers
      .sort((a, b) => a.seat_index - b.seat_index)
      .map(p => ({ name: p.player_name, isHuman: true }));

    const state = initGame(configs);

    channel.send({ type: 'broadcast', event: 'game_state', payload: { state } });
    set({ gameState: state });
  },

  sendMove: (move) => {
    const { channel, isHost, gameState } = get();
    if (!channel) return;

    if (isHost && gameState) {
      processMove(gameState, move, set, get);
      return;
    }

    channel.send({ type: 'broadcast', event: 'player_move', payload: move });
  },
}));

function processMove(
  state: GameState,
  move: GameMove,
  set: (s: Partial<MultiplayerStore>) => void,
  get: () => MultiplayerStore
) {
  let newState: GameState = state;

  switch (move.type) {
    case 'action':
      newState = declareAction(state, move.actionType!, move.targetId);
      break;
    case 'challenge':
      newState = challengeAction(state, move.playerId);
      break;
    case 'pass_challenge':
      newState = passChallenge(state, move.playerId);
      break;
    case 'block':
      newState = declareBlock(state, move.playerId, move.character!);
      break;
    case 'pass_block':
      newState = passBlock(state);
      break;
    case 'challenge_block':
      newState = challengeBlock(state, move.playerId);
      break;
    case 'lose_influence':
      newState = loseInfluence(state, move.cardId!);
      break;
    case 'exchange_complete':
      newState = completeExchange(state, move.keptCardIds!);
      break;
  }

  // Auto-resolve if RESOLVE phase (no human input needed)
  if (newState.phase === 'RESOLVE') {
    newState = resolveAction(newState);
  }

  const { channel } = get();
  if (channel) {
    channel.send({ type: 'broadcast', event: 'game_state', payload: { state: newState } });
  }
  set({ gameState: newState });
}
