'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Copy, Check, ChevronLeft, Users, Crown, Wifi, WifiOff } from 'lucide-react';
import { useMultiplayerStore } from '@/stores/multiplayer-store';
import { getPlayerId, getPlayerName } from '@/lib/player-identity';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaitingRoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const {
    roomCode,
    roomPlayers,
    myPlayerId,
    isHost,
    connectionStatus,
    gameState,
    toggleReady,
    startGame,
    joinRoom,
    leaveRoom,
    error,
  } = useMultiplayerStore();

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Auto-reconnect if store lost state (e.g. page refresh)
  useEffect(() => {
    if (!roomCode) {
      const savedName = getPlayerName();
      joinRoom(code, savedName || 'Player').catch(() => {
        router.replace('/lobby');
      });
    }
  }, [code, roomCode, joinRoom, router]);

  // Navigate to game when game starts
  useEffect(() => {
    if (gameState) {
      // Store room code so game page knows it's multiplayer
      localStorage.setItem('coup_room_code', code);
      router.push('/game');
    }
  }, [gameState, code, router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/lobby');
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      await startGame();
    } catch {
      setIsStarting(false);
    }
  };

  const myPlayer = roomPlayers.find(p => p.player_id === myPlayerId) ||
    roomPlayers.find(p => p.player_id === getPlayerId());
  const allReady = roomPlayers.length >= 2 && roomPlayers.every(p => p.is_ready);
  const canStart = isHost && allReady;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1220 0%, #0a0a0f 60%)' }}
    >
      <div className="w-full max-w-md">
        <button
          onClick={handleLeave}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          ออกจากห้อง
        </button>

        {/* Room code */}
        <div className="text-center mb-8">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500/50 mb-2">
            รหัสห้อง
          </div>
          <div className="flex items-center justify-center gap-3">
            <span
              className="font-mono text-4xl font-bold tracking-[0.2em]"
              style={{ color: '#d4a847', textShadow: '0 0 30px rgba(212,168,71,0.4)' }}
            >
              {code}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม</p>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {connectionStatus === 'connected' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 text-xs">เชื่อมต่อแล้ว</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 text-xs">
                {connectionStatus === 'connecting' ? 'กำลังเชื่อมต่อ...' : 'ขาดการเชื่อมต่อ'}
              </span>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-900/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Players list */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              ผู้เล่น ({roomPlayers.length})
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {roomPlayers.map(player => {
                const isMe = player.player_id === myPlayerId || player.player_id === getPlayerId();
                const isRoomHost = player.seat_index === 0;
                return (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isMe
                        ? 'border-blue-500/40 bg-blue-900/10'
                        : 'border-white/8 bg-gray-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isRoomHost && (
                        <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      )}
                      {!isRoomHost && <div className="w-3.5" />}
                      <span className={`text-sm font-semibold ${isMe ? 'text-blue-300' : 'text-white'}`}>
                        {player.player_name}
                        {isMe && <span className="text-blue-500 text-xs ml-1">(คุณ)</span>}
                      </span>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      player.is_ready
                        ? 'border-green-500/50 bg-green-900/20 text-green-400'
                        : 'border-gray-600 bg-gray-800/40 text-gray-500'
                    }`}>
                      {player.is_ready ? 'พร้อม' : 'ยังไม่พร้อม'}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {roomPlayers.length === 0 && (
              <div className="text-center text-gray-600 text-sm py-4">
                รอผู้เล่น...
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {/* Ready toggle */}
          {myPlayer && (
            <button
              onClick={toggleReady}
              className={`w-full py-3 rounded-xl font-bold text-sm border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                myPlayer.is_ready
                  ? 'border-green-500/40 bg-green-900/20 text-green-400 hover:bg-green-800/30'
                  : 'border-yellow-500/40 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-800/30'
              }`}
            >
              {myPlayer.is_ready ? 'ยกเลิกพร้อม' : 'พร้อมเล่น'}
            </button>
          )}

          {/* Start game (host only) */}
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart || isStarting}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: canStart
                  ? 'linear-gradient(135deg, #d4a847 0%, #8b6e2a 100%)'
                  : 'linear-gradient(135deg, #4a4030 0%, #2a2018 100%)',
                color: '#0a0a0f',
                boxShadow: canStart ? '0 4px 20px rgba(212,168,71,0.25)' : 'none',
              }}
            >
              {isStarting
                ? 'กำลังเริ่ม...'
                : canStart
                  ? `เริ่มเกม (${roomPlayers.length} ผู้เล่น)`
                  : roomPlayers.length < 2
                    ? 'ต้องการผู้เล่นอย่างน้อย 2 คน'
                    : 'รอผู้เล่นทุกคนกด พร้อมเล่น'}
            </button>
          )}

          {!isHost && (
            <div className="text-center text-gray-600 text-xs py-1">
              รอเจ้าของห้องเริ่มเกม...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
