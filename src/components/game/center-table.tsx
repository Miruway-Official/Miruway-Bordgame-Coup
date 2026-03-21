'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@/lib/engine/types';
import { getCurrentPlayer } from '@/lib/engine/game-engine';

interface CenterTableProps {
  gameState: GameState;
  isHumanTurn: boolean;
}

function DeckPile({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Stacked cards */}
      <div style={{ position: 'relative', width: 34, height: 46 }}>
        {[2, 1, 0].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 28,
              height: 38,
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: i === 0
                ? 'linear-gradient(135deg, oklch(16% 0.025 240) 0%, oklch(12% 0.02 240) 100%)'
                : 'var(--bg-1)',
              left: i * 3,
              top: i * 3,
              boxShadow: i === 0 ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {i === 0 && (
              <>
                {/* Card back cross-hatch pattern */}
                <div style={{
                  position: 'absolute',
                  inset: 3,
                  border: '1px solid oklch(28% 0.03 240)',
                  borderRadius: 2,
                  opacity: 0.6,
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'oklch(28% 0.04 240)',
                }} />
              </>
            )}
          </div>
        ))}
        {/* Count badge */}
        <div style={{
          position: 'absolute',
          top: -6,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--bg-0)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 700,
          color: 'var(--text-muted)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {count}
        </div>
      </div>
      <span style={{
        fontSize: 9,
        color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.06em',
      }}>
        กอง
      </span>
    </div>
  );
}

function TreasuryCoin({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Stacked coins */}
      <div style={{ position: 'relative', width: 34, height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {[2, 1, 0].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: i === 0
                ? `radial-gradient(circle at 35% 35%, oklch(78% 0.16 82), oklch(58% 0.14 82))`
                : `oklch(${52 - i * 4}% 0.10 82)`,
              border: `1px solid oklch(${42 - i * 3}% 0.10 82)`,
              bottom: i * 5,
              boxShadow: i === 0 ? '0 2px 6px rgba(0,0,0,0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i === 0 && (
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'oklch(88% 0.12 82)',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}>¢</span>
            )}
          </div>
        ))}
        {/* Count badge */}
        <div style={{
          position: 'absolute',
          top: -4,
          right: -2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'var(--bg-0)',
          border: '1px solid oklch(35% 0.08 82)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 700,
          color: 'var(--gold)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {count}
        </div>
      </div>
      <span style={{
        fontSize: 9,
        color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '0.06em',
      }}>
        คลัง
      </span>
    </div>
  );
}

export function CenterTable({ gameState, isHumanTurn }: CenterTableProps) {
  const currentPlayer = getCurrentPlayer(gameState);
  const deckCount = gameState.deck.length;
  const totalCoinsInPlay = gameState.players.reduce((s, p) => s + p.coins, 0);
  const treasury = Math.max(0, 50 - totalCoinsInPlay);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      margin: '0 2px',
      borderRadius: 12,
      background: 'oklch(10% 0.015 240 / 0.6)',
      border: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle center glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, oklch(15% 0.03 82 / 0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left: Deck */}
      <DeckPile count={deckCount} />

      {/* Center: Arrow + player name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        padding: '0 8px',
      }}>
        {/* Turn arrow */}
        <div style={{ position: 'relative', height: 28, width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isHumanTurn ? 'down' : 'up'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25 }}
            >
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ y: isHumanTurn ? [0, 3, 0] : [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                {isHumanTurn ? (
                  // Arrow pointing DOWN (human's turn → arrow from center towards human at bottom)
                  <path
                    d="M12 5 L12 16 M7 11 L12 16 L17 11"
                    stroke="var(--gold)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  // Arrow pointing UP (AI's turn → arrow from center towards AI at top)
                  <path
                    d="M12 19 L12 8 M7 13 L12 8 L17 13"
                    stroke="oklch(72% 0.15 242)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </motion.svg>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Player name */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: isHumanTurn ? 'var(--gold)' : 'oklch(72% 0.15 242)',
              letterSpacing: '0.04em',
              textAlign: 'center',
              maxWidth: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isHumanTurn ? 'ตาของคุณ' : `ตา ${currentPlayer.name}`}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: Treasury */}
      <TreasuryCoin count={treasury} />
    </div>
  );
}
