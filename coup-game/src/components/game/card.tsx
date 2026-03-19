'use client';

import { motion } from 'framer-motion';
import { Card as CardType, CharacterName } from '@/lib/engine/types';

// Large single letter initial, editorial style
const CHAR_INITIAL: Record<CharacterName, string> = {
  Duke: 'D',
  Assassin: 'A',
  Captain: 'C',
  Ambassador: 'Am',
  Contessa: 'Co',
};

const CHAR_COLOR_VAR: Record<CharacterName, string> = {
  Duke: 'var(--duke)',
  Assassin: 'var(--assassin)',
  Captain: 'var(--captain)',
  Ambassador: 'var(--ambassador)',
  Contessa: 'var(--contessa)',
};

const SIZE = {
  sm: { w: 56, h: 76, initial: 22, name: 10 },
  md: { w: 76, h: 104, initial: 30, name: 12 },
  lg: { w: 108, h: 148, initial: 42, name: 14 },
};

interface CardProps {
  card: CardType;
  isHidden: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function GameCard({
  card,
  isHidden,
  isSelectable,
  isSelected,
  onClick,
  size = 'md',
}: CardProps) {
  const s = SIZE[size];
  const color = CHAR_COLOR_VAR[card.character];
  const isRevealed = card.revealed;

  return (
    <motion.div
      layout
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={isSelectable && !isRevealed ? { scale: 0.93 } : {}}
      onClick={isSelectable && !isRevealed ? onClick : undefined}
      style={{
        width: s.w,
        height: s.h,
        borderRadius: 10,
        position: 'relative',
        cursor: isSelectable && !isRevealed ? 'pointer' : 'default',
        overflow: 'hidden',
        flexShrink: 0,
        outline: isSelected ? '2px solid var(--gold)' : 'none',
        outlineOffset: 2,
        filter: isRevealed ? 'grayscale(0.7) brightness(0.5)' : 'none',
        transition: 'filter 0.3s ease',
      }}
    >
      {isHidden ? (
        /* Card Back — editorial */
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(160deg, var(--bg-2) 0%, var(--bg-1) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {/* Decorative inner border */}
          <div
            style={{
              position: 'absolute',
              inset: 6,
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: s.initial * 0.7,
              fontWeight: 700,
              color: 'var(--gold-dim)',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            C
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 7,
              fontWeight: 600,
              color: 'var(--gold-dim)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            COUP
          </div>
        </div>
      ) : (
        /* Card Face — character color with editorial type */
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(175deg, ${color}22 0%, ${color}08 60%, var(--bg-1) 100%)`,
            border: `1px solid ${color}40`,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 8,
          }}
        >
          {/* Top colour wash */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: s.h * 0.55,
              background: `linear-gradient(180deg, ${color}30 0%, transparent 100%)`,
            }}
          />
          {/* Big initial */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: s.initial,
              fontWeight: 700,
              color: color,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {CHAR_INITIAL[card.character]}
          </div>
          {/* Character name */}
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: s.name,
              fontWeight: 600,
              color: isRevealed ? 'var(--text-muted)' : 'var(--text-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {card.character}
          </div>
          {/* Revealed overlay */}
          {isRevealed && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--assassin)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  transform: 'rotate(-25deg)',
                  border: '1.5px solid var(--assassin)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                DEAD
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
