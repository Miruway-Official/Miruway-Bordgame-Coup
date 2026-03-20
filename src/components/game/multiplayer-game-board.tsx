'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMultiplayerStore } from '@/stores/multiplayer-store';
import { useUIStore } from '@/stores/ui-store';
import { getAvailableActions, requiresTarget } from '@/lib/engine/actions';
import { getBlockableCharacters } from '@/lib/engine/blocks';
import { getLivingPlayers, getCurrentPlayer } from '@/lib/engine/game-engine';
import { ActionType, CharacterName } from '@/lib/engine/types';

import { PlayerArea } from './player-area';
import { ActionPanel } from './action-panel';
import { TargetSelector } from './target-selector';
import { ChallengeDialog } from './challenge-dialog';
import { BlockDialog } from './block-dialog';
import { RevealDialog } from './reveal-dialog';
import { ExchangeDialog } from './exchange-dialog';
import { GameLog } from './game-log';
import { GameOverScreen } from './game-over-screen';
import { TurnIndicator } from './turn-indicator';
import { ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiplayerGameBoardProps {
  myPlayerId: string;
}

export function MultiplayerGameBoard({ myPlayerId }: MultiplayerGameBoardProps) {
  const router = useRouter();
  const { gameState, sendMove } = useMultiplayerStore();
  const { showGameLog, setShowGameLog } = useUIStore();
  const [pendingActionType, setPendingActionType] = useState<ActionType | null>(null);

  if (!gameState) return null;

  const { phase, pendingAction, pendingBlock, loseInfluenceContext, exchangeCards, log, turnNumber } = gameState;

  // Find this client's player by matching player_id to game player id (seat_index based)
  // In multiplayer, game players are created in seat order, so player-0 = seat 0, etc.
  // The game engine assigns ids like "player-0", "player-1", ...
  // We need to find which seat this client occupies - stored in roomPlayers
  const { roomPlayers } = useMultiplayerStore.getState();
  const myRoomPlayer = roomPlayers.find(p => p.player_id === myPlayerId);
  const myGamePlayerId = myRoomPlayer ? `player-${myRoomPlayer.seat_index}` : null;
  const myPlayer = myGamePlayerId ? gameState.players.find(p => p.id === myGamePlayerId) : null;

  const currentPlayer = getCurrentPlayer(gameState);
  const isMyTurn = myPlayer ? currentPlayer.id === myPlayer.id : false;
  const livingPlayers = getLivingPlayers(gameState);

  // Other players (everyone except me)
  const otherPlayers = gameState.players.filter(p => p.id !== myGamePlayerId);
  const winner = gameState.winner ? gameState.players.find(p => p.id === gameState.winner) : null;

  // What this client must do
  const myMustRespond =
    phase === 'ACTION_DECLARED' &&
    myPlayer &&
    !myPlayer.isEliminated &&
    myPlayer.id !== pendingAction?.actorId &&
    !gameState.passedPlayerIds.includes(myPlayer.id);

  const myMustRespondToBlock =
    phase === 'BLOCK_DECLARED' &&
    myPlayer &&
    pendingAction?.actorId === myPlayer.id;

  const myMustLoseInfluence =
    phase === 'LOSE_INFLUENCE' &&
    myPlayer &&
    loseInfluenceContext?.playerId === myPlayer.id;

  const myMustExchange =
    phase === 'EXCHANGE_SELECT' &&
    myPlayer &&
    pendingAction?.actorId === myPlayer.id;

  const blockableChars = pendingAction ? getBlockableCharacters(pendingAction.type) : [];
  const myIsTarget = myPlayer ? pendingAction?.targetId === myPlayer.id : false;

  const availableActions =
    isMyTurn && phase === 'ACTION_SELECT' && myPlayer
      ? getAvailableActions(myPlayer, livingPlayers)
      : [];

  const validTargets = livingPlayers.filter(p => p.id !== myGamePlayerId && !p.isEliminated);

  // Handlers - all route through sendMove
  const handleActionSelect = (action: ActionType) => {
    if (!myPlayer) return;
    if (requiresTarget(action)) {
      setPendingActionType(action);
    } else {
      sendMove({ type: 'action', playerId: myPlayer.id, actionType: action });
    }
  };

  const handleTargetSelect = (targetId: string) => {
    if (!myPlayer || !pendingActionType) return;
    sendMove({ type: 'action', playerId: myPlayer.id, actionType: pendingActionType, targetId });
    setPendingActionType(null);
  };

  const handleCancelTarget = () => setPendingActionType(null);

  const handleChallenge = () => {
    if (!myPlayer) return;
    sendMove({ type: 'challenge', playerId: myPlayer.id });
  };

  const handlePassChallenge = () => {
    if (!myPlayer) return;
    sendMove({ type: 'pass_challenge', playerId: myPlayer.id });
  };

  const handleBlock = (character: CharacterName) => {
    if (!myPlayer) return;
    sendMove({ type: 'block', playerId: myPlayer.id, character });
  };

  const handlePassBlock = () => {
    if (!myPlayer) return;
    sendMove({ type: 'pass_block', playerId: myPlayer.id });
  };

  const handleChallengeBlock = () => {
    if (!myPlayer) return;
    sendMove({ type: 'challenge_block', playerId: myPlayer.id });
  };

  const handleLoseInfluence = (cardId: string) => {
    if (!myPlayer) return;
    sendMove({ type: 'lose_influence', playerId: myPlayer.id, cardId });
  };

  const handleCompleteExchange = (keptCardIds: string[]) => {
    if (!myPlayer) return;
    sendMove({ type: 'exchange_complete', playerId: myPlayer.id, keptCardIds });
  };

  const handlePlayAgain = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('coup_room_code');
    }
    router.push('/lobby');
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0f] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center top, #12121f 0%, #0a0a0f 60%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="font-cinzel text-yellow-400/80 text-lg font-bold tracking-wider">COUP</div>
        <TurnIndicator
          currentPlayerName={currentPlayer.name}
          isHumanTurn={isMyTurn}
          phase={phase}
          isAIThinking={false}
          turnNumber={turnNumber}
        />
        <button
          onClick={() => setShowGameLog(!showGameLog)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ScrollText className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main game area */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Other players grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {otherPlayers.map(player => (
              <PlayerArea
                key={player.id}
                player={player}
                isCurrentTurn={currentPlayer.id === player.id}
                isHuman={false}
                canBeTargeted={!!pendingActionType && !player.isEliminated}
                isTargeted={false}
                onTarget={() => handleTargetSelect(player.id)}
              />
            ))}
          </div>

          {/* Center status */}
          <div className="flex-1 flex items-center justify-center min-h-[80px]">
            {!isMyTurn &&
              !myMustRespond &&
              !myMustRespondToBlock &&
              !myMustLoseInfluence &&
              !myMustExchange && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-sm flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  {currentPlayer.name}&apos;s turn...
                </motion.div>
              )}
          </div>

          {/* My player area */}
          {myPlayer && (
            <PlayerArea
              player={myPlayer}
              isCurrentTurn={isMyTurn}
              isHuman
              canBeTargeted={false}
              isTargeted={false}
            />
          )}

          {/* Action panel */}
          <AnimatePresence>
            {isMyTurn && phase === 'ACTION_SELECT' && availableActions.length > 0 && myPlayer && (
              <ActionPanel
                availableActions={availableActions}
                playerCoins={myPlayer.coins}
                onAction={handleActionSelect}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Game log sidebar */}
        <AnimatePresence>
          {showGameLog && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/5 bg-gray-900/40 p-3 overflow-hidden"
              style={{ minWidth: 0 }}
            >
              <GameLog entries={log} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Target selector */}
        {pendingActionType && requiresTarget(pendingActionType) && (
          <TargetSelector
            targets={validTargets}
            actionType={pendingActionType}
            onSelect={handleTargetSelect}
            onCancel={handleCancelTarget}
          />
        )}

        {/* Challenge dialog */}
        {myMustRespond && pendingAction && (
          <ChallengeDialog
            pendingAction={pendingAction}
            actorName={gameState.players.find(p => p.id === pendingAction.actorId)?.name ?? ''}
            onChallenge={handleChallenge}
            onPass={handlePassChallenge}
          />
        )}

        {/* Block dialog - shown when I am the target */}
        {myMustRespond && pendingAction && blockableChars.length > 0 && myIsTarget && (
          <BlockDialog
            pendingAction={pendingAction}
            blockableCharacters={blockableChars}
            actorName={gameState.players.find(p => p.id === pendingAction.actorId)?.name ?? ''}
            onBlock={handleBlock}
            onPass={handlePassChallenge}
          />
        )}

        {/* Block challenge dialog */}
        {myMustRespondToBlock && pendingBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 bg-purple-900/20 mb-4">
                Your Action was Blocked
              </div>
              <h2 className="text-white font-bold text-xl mb-2">
                {gameState.players.find(p => p.id === pendingBlock.blockerId)?.name} blocks
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                claiming <span className="font-semibold text-white">{pendingBlock.claimedCharacter}</span>
              </p>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChallengeBlock}
                  className="w-full py-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-300 font-semibold hover:bg-red-800/50 transition-all"
                >
                  Challenge the block
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePassBlock}
                  className="w-full py-3 rounded-xl bg-gray-800/60 border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700/60 transition-all"
                >
                  Accept the block
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reveal / lose influence */}
        {myMustLoseInfluence && loseInfluenceContext && myPlayer && (
          <RevealDialog
            cards={myPlayer.cards}
            reason={loseInfluenceContext.reason}
            onReveal={handleLoseInfluence}
          />
        )}

        {/* Exchange */}
        {myMustExchange && exchangeCards && (
          <ExchangeDialog
            cards={exchangeCards}
            onConfirm={handleCompleteExchange}
          />
        )}

        {/* Game over */}
        {phase === 'GAME_OVER' && winner && (
          <GameOverScreen
            winner={winner}
            allPlayers={gameState.players}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
