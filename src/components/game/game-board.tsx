'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-store';
import { useUIStore } from '@/stores/ui-store';
import { getAvailableActions, requiresTarget } from '@/lib/engine/actions';
import { getBlockableCharacters } from '@/lib/engine/blocks';
import { getLivingPlayers, getCurrentPlayer } from '@/lib/engine/game-engine';
import { ActionType } from '@/lib/engine/types';

import { PlayerArea } from './player-area';
import { ActionPanel } from './action-panel';
import { TargetSelector } from './target-selector';
import { ChallengeDialog } from './challenge-dialog';
import { RevealDialog } from './reveal-dialog';
import { ExchangeDialog } from './exchange-dialog';
import { GameLog } from './game-log';
import { GameOverScreen } from './game-over-screen';
import { TurnIndicator } from './turn-indicator';
import { ScrollText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GameBoard() {
  const {
    gameState, isAIThinking,
    humanDeclareAction, humanChallenge, humanPassChallenge,
    humanBlock, humanPassBlock, humanChallengeBlock,
    humanLoseInfluence, humanCompleteExchange,
  } = useGameStore();

  const { showGameLog, setShowGameLog } = useUIStore();
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);

  if (!gameState) return null;

  const { phase, pendingAction, pendingBlock, loseInfluenceContext, exchangeCards, log, turnNumber } = gameState;
  const humanPlayer = gameState.players.find(p => p.isHuman)!;
  const currentPlayer = getCurrentPlayer(gameState);
  const isHumanTurn = currentPlayer.id === humanPlayer.id;
  const livingPlayers = getLivingPlayers(gameState);
  const aiPlayers = gameState.players.filter(p => !p.isHuman);
  const winner = gameState.winner ? gameState.players.find(p => p.id === gameState.winner) : null;

  const humanMustRespond =
    phase === 'ACTION_DECLARED' && !humanPlayer.isEliminated &&
    humanPlayer.id !== pendingAction?.actorId &&
    !gameState.passedPlayerIds.includes(humanPlayer.id);

  const humanMustRespondToBlock = phase === 'BLOCK_DECLARED' && pendingAction?.actorId === humanPlayer.id;
  const humanMustLoseInfluence = phase === 'LOSE_INFLUENCE' && loseInfluenceContext?.playerId === humanPlayer.id;
  const humanMustExchange = phase === 'EXCHANGE_SELECT' && pendingAction?.actorId === humanPlayer.id;

  const blockableChars = pendingAction ? getBlockableCharacters(pendingAction.type) : [];
  const humanIsTarget = pendingAction?.targetId === humanPlayer.id;

  const exchangeActor = pendingAction ? gameState.players.find(p => p.id === pendingAction.actorId) : null;
  const exchangeHandCards = (exchangeActor?.cards ?? []).filter(c => !c.revealed);

  const handleActionSelect = (action: ActionType) => {
    if (requiresTarget(action)) setPendingActionType(action);
    else humanDeclareAction(action);
  };

  const handleTargetSelect = (targetId: string) => {
    if (pendingActionType) { humanDeclareAction(pendingActionType, targetId); setPendingActionType(null); }
  };

  const availableActions = isHumanTurn && phase === 'ACTION_SELECT'
    ? getAvailableActions(humanPlayer, livingPlayers) : [];
  const validTargets = livingPlayers.filter(p => !p.isHuman && !p.isEliminated);

  return (
    <div className="h-[100dvh] bg-[#0a0a0f] flex flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center top, #12121f 0%, #0a0a0f 60%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 flex-shrink-0">
        <div className="font-cinzel text-yellow-400/80 text-base font-bold tracking-wider">COUP</div>
        <TurnIndicator currentPlayerName={currentPlayer.name} isHumanTurn={isHumanTurn}
          phase={phase} isAIThinking={isAIThinking} turnNumber={turnNumber} />
        <button onClick={() => setShowGameLog(!showGameLog)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5">
          <ScrollText className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable game area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-2 p-3">

          {/* AI players grid */}
          <div className={`grid gap-2 ${aiPlayers.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {aiPlayers.map(player => (
              <PlayerArea key={player.id} player={player}
                isCurrentTurn={currentPlayer.id === player.id} isHuman={false}
                canBeTargeted={!!pendingActionType && !player.isEliminated}
                isTargeted={false} onTarget={() => handleTargetSelect(player.id)} />
            ))}
          </div>

          {/* AI thinking */}
          <AnimatePresence>
            {isAIThinking && !humanMustRespond && !humanMustRespondToBlock && !humanMustLoseInfluence && !humanMustExchange && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-gray-500 text-xs">{currentPlayer.name} กำลังคิด…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer */}
          <div className="min-h-[8px]" />

          {/* Human player */}
          <PlayerArea player={humanPlayer} isCurrentTurn={isHumanTurn} isHuman
            canBeTargeted={false} isTargeted={false} />

          {/* Action panel */}
          <AnimatePresence>
            {isHumanTurn && phase === 'ACTION_SELECT' && availableActions.length > 0 && (
              <ActionPanel availableActions={availableActions}
                playerCoins={humanPlayer.coins} onAction={handleActionSelect} />
            )}
          </AnimatePresence>

          {/* Safe area spacer */}
          <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
        </div>
      </div>

      {/* Game log — bottom sheet on mobile, fixed sidebar on desktop */}
      <AnimatePresence>
        {showGameLog && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 sm:hidden"
              onClick={() => setShowGameLog(false)} />

            {/* Mobile bottom sheet */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e18] border-t border-white/10 rounded-t-2xl sm:hidden"
              style={{ maxHeight: '65dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">บันทึกเกม</span>
                <button onClick={() => setShowGameLog(false)}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain p-3" style={{ maxHeight: 'calc(65dvh - 52px)' }}>
                <GameLog entries={log} />
              </div>
            </motion.div>

            {/* Desktop sidebar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="hidden sm:block fixed right-0 bottom-0 z-40 border-l border-white/5 bg-gray-900/95 backdrop-blur-sm p-3 overflow-y-auto"
              style={{ top: '49px' }}>
              <GameLog entries={log} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === Modals === */}
      <AnimatePresence>
        {pendingActionType && requiresTarget(pendingActionType) && (
          <TargetSelector targets={validTargets} actionType={pendingActionType}
            onSelect={handleTargetSelect} onCancel={() => setPendingActionType(null)} />
        )}

        {humanMustRespond && pendingAction && (() => {
          const canHumanBlock = blockableChars.length > 0 && (!pendingAction.targetId || humanIsTarget);
          return (
            <ChallengeDialog
              pendingAction={pendingAction}
              actorName={gameState.players.find(p => p.id === pendingAction.actorId)?.name ?? ''}
              onChallenge={humanChallenge}
              onPass={humanPassChallenge}
              blockableCharacters={canHumanBlock ? blockableChars : undefined}
              onBlock={canHumanBlock ? humanBlock : undefined}
            />
          );
        })()}

        {humanMustRespondToBlock && pendingBlock && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="bg-gray-900 border border-purple-500/30 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl text-center"
              style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
              <div className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 bg-purple-900/20 mb-4">
                การกระทำของคุณถูกสกัด
              </div>
              <h2 className="text-white font-bold text-xl mb-2">
                {gameState.players.find(p => p.id === pendingBlock.blockerId)?.name} สกัด
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                อ้างว่าเป็น <span className="font-semibold text-white">{pendingBlock.claimedCharacter}</span>
              </p>
              <div className="space-y-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={humanChallengeBlock}
                  className="w-full py-4 rounded-xl bg-red-900/40 border border-red-500/50 text-red-300 font-semibold text-base transition-all">
                  ท้าทายการสกัด
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={humanPassBlock}
                  className="w-full py-4 rounded-xl bg-gray-800/60 border border-gray-600 text-gray-300 font-semibold text-base transition-all">
                  ยอมรับการสกัด
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {humanMustLoseInfluence && loseInfluenceContext && (
          <RevealDialog cards={humanPlayer.cards} reason={loseInfluenceContext.reason}
            onReveal={humanLoseInfluence} />
        )}

        {humanMustExchange && (
          <ExchangeDialog
            handCards={exchangeHandCards}
            drawnCards={exchangeCards ?? []}
            onConfirm={(keptCardId, offeredHandCardId) => humanCompleteExchange(keptCardId, offeredHandCardId)}
          />
        )}

        {phase === 'GAME_OVER' && winner && (
          <GameOverScreen winner={winner} allPlayers={gameState.players}
            onPlayAgain={() => { if (typeof window !== 'undefined') window.location.href = '/setup'; }} />
        )}
      </AnimatePresence>
    </div>
  );
}
