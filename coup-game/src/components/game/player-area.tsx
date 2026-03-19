'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/engine/types';
import { GameCard } from './card';

interface PlayerAreaProps {
  player: Player;
  isCurrentTurn: boolean;
  isHuman: boolean;
  canBeTargeted: boolean;
  isTargeted: boolean;
  onTarget?: () => void;
}

function CoinDots({ count }: { count: number }) {
  const max = 10;
  const dots = Math.min(count, max);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', maxWidth: 72 }}>
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className="coin-dot" />
      ))}
      {count > max && (
        <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>
          +{count - max}
        </span>
      )}
    </div>
  );
}

export function PlayerArea({
  player,
  isCurrentTurn,
  isHuman,
  canBeTargeted,
  isTargeted,
  onTarget,
}: PlayerAreaProps) {
  return (
    <motion.div
      layout
      onClick={canBeTargeted && !player.isEliminated ? onTarget : undefined}
      whileTap={canBeTargeted && !player.isEliminated ? { scale: 0.98 } : {}}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: isHuman ? '14px 16px' : '10px 12px',
        borderRadius: 12,
        background: isCurrentTurn
          ? 'linear-gradient(135deg, oklch(18% 0.04 82) 0%, var(--bg-2) 100%)'
          : isTargeted
            ? 'linear-gradient(135deg, oklch(15% 0.05 22) 0%, var(--bg-1) 100%)'
            : 'var(--bg-1)',
        border: isCurrentTurn
          ? '1px solid oklch(35% 0.08 82)'
          : isTargeted
            ? '1px solid oklch(35% 0.10 22)'
            : '1px solid var(--border)',
        cursor: canBeTargeted && !player.isEliminated ? 'pointer' : 'default',
        opacity: player.isEliminated ? 0.35 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active turn left bar */}
      {isCurrentTurn && !player.isEliminated && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: 'var(--gold)',
            borderRadius: '0 2px 2px 0',
          }}
        />
      )}

      {/* Target glow overlay */}
      {isTargeted && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 0 20px oklch(40% 0.15 22 / 0.3)',
            borderRadius: 12,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Left: name + coin dots */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {isCurrentTurn && !player.isEliminated && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--gold)',
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: isHuman ? 15 : 13,
              fontWeight: isHuman ? 600 : 500,
              color: isHuman ? 'var(--text-primary)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {isHuman ? 'คุณ' : player.name}
            {player.isEliminated && (
              <span style={{ fontSize: 11, color: 'var(--assassin)', marginLeft: 6 }}>
                ถูกคัดออก
              </span>
            )}
          </span>
        </div>
        <CoinDots count={player.coins} />
        <div
          style={{
            marginTop: 2,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {player.coins} เหรียญ
        </div>
      </div>

      {/* Right: cards */}
      <div style={{ display: 'flex', gap: isHuman ? 8 : 5, flexShrink: 0 }}>
        {player.cards.map(card => (
          <GameCard
            key={card.id}
            card={card}
            isHidden={!isHuman && !card.revealed}
            size={isHuman ? 'md' : 'sm'}
          />
        ))}
      </div>
    </motion.div>
  );
}
