'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/game-store';
import { useMultiplayerStore } from '@/stores/multiplayer-store';
import { GameBoard } from '@/components/game/game-board';
import { MultiplayerGameBoard } from '@/components/game/multiplayer-game-board';
import { Player } from '@/lib/engine/types';
import { getPlayerId } from '@/lib/player-identity';

type PlayerConfig = { name: string; isHuman: boolean; personality?: Player['personality'] };

export default function GamePage() {
  const router = useRouter();
  const { gameState: localGameState, startGame } = useGameStore();
  const { gameState: mpGameState, roomCode } = useMultiplayerStore();
  const [initialized, setInitialized] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);

  useEffect(() => {
    // Check if this is a multiplayer session
    const savedRoomCode =
      typeof window !== 'undefined' ? localStorage.getItem('coup_room_code') : null;

    if (savedRoomCode && mpGameState) {
      // Multiplayer game - already have state from store
      setIsMultiplayer(true);
      setInitialized(true);
      return;
    }

    if (savedRoomCode && !mpGameState) {
      // Multiplayer room code exists but no game state yet - go back to waiting room
      router.replace(`/lobby/${savedRoomCode}`);
      return;
    }

    // Local vs AI game
    if (localGameState) {
      setInitialized(true);
      return;
    }

    const raw = typeof window !== 'undefined' ? localStorage.getItem('coup-game-config') : null;
    if (!raw) {
      router.replace('/setup');
      return;
    }

    try {
      const configs: PlayerConfig[] = JSON.parse(raw);
      if (!Array.isArray(configs) || configs.length < 2) {
        router.replace('/setup');
        return;
      }
      startGame(configs);
      setInitialized(true);
    } catch {
      router.replace('/setup');
    }
  }, [localGameState, mpGameState, roomCode, startGame, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-gray-600 text-sm">กำลังโหลดเกม...</div>
      </div>
    );
  }

  if (isMultiplayer && mpGameState) {
    const myPlayerId = getPlayerId();
    return <MultiplayerGameBoard myPlayerId={myPlayerId} />;
  }

  if (!localGameState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-gray-600 text-sm">กำลังโหลดเกม...</div>
      </div>
    );
  }

  return <GameBoard />;
}
