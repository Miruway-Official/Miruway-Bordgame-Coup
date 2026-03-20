'use client';

import { motion } from 'framer-motion';
import { Player } from '@/lib/engine/types';
import { GameCard } from './card';
import { useRouter } from 'next/navigation';

interface GameOverScreenProps {
  winner: Player;
  allPlayers: Player[];
  onPlayAgain: () => void;
}

export function GameOverScreen({ winner, allPlayers, onPlayAgain }: GameOverScreenProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 14, 0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '24px 20px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 220, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 3,
            background: 'var(--gold)',
            borderRadius: '3px 3px 0 0',
          }}
        />

        {/* Main card */}
        <div
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '32px 28px 28px',
          }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              จบเกม
            </div>

            {/* Winner name — dramatic */}
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.0,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}
            >
              {winner.isHuman ? 'คุณ' : winner.name}
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontStyle: 'italic',
                color: 'var(--gold)',
                marginBottom: 6,
              }}
            >
              ครองอำนาจแล้ว
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: 'var(--text-secondary)',
                marginBottom: 28,
              }}
            >
              {winner.isHuman
                ? 'ยินดีด้วย! คุณเอาชนะคู่ต่อสู้ทั้งหมดได้'
                : `${winner.name} ได้ยึดอำนาจการปกครองแล้ว`}
            </div>
          </motion.div>

          {/* All players final state */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              ผลสุดท้าย
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allPlayers.map(player => {
                const isWinner = player.id === winner.id;
                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: isWinner
                        ? '1px solid oklch(35% 0.08 82)'
                        : '1px solid var(--border)',
                      background: isWinner
                        ? 'linear-gradient(135deg, oklch(16% 0.04 82) 0%, var(--bg-2) 100%)'
                        : 'var(--bg-2)',
                    }}
                  >
                    {isWinner && (
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
                        fontSize: 13,
                        fontWeight: isWinner ? 600 : 400,
                        color: isWinner ? 'var(--gold)' : 'var(--text-secondary)',
                        flex: 1,
                      }}
                    >
                      {player.isHuman ? 'คุณ' : player.name}
                      {isWinner && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--gold-dim)',
                            marginLeft: 6,
                            fontStyle: 'italic',
                          }}
                        >
                          ผู้ชนะ
                        </span>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {player.cards.map(card => (
                        <GameCard key={card.id} card={card} isHidden={false} size="sm" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 10 }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onPlayAgain}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: '1px solid var(--gold)',
                background: 'oklch(16% 0.06 82)',
                color: 'var(--gold)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              เล่นอีกครั้ง
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--bg-2)',
                color: 'var(--text-secondary)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              เมนูหลัก
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
