'use client';

import { motion } from 'framer-motion';
import { Card } from '@/lib/engine/types';
import { GameCard } from './card';

interface RevealDialogProps {
  cards: Card[];
  reason: string;
  onReveal: (cardId: string) => void;
}

const REASONS: Record<string, string> = {
  challenged: 'คุณถูกจับโกหก',
  assassinated: 'คุณถูกลอบสังหาร',
  coup: 'คุณถูกรัฐประหาร',
  block_challenged: 'การสกัดของคุณถูกท้าทาย',
};

export function RevealDialog({ cards, reason, onReveal }: RevealDialogProps) {
  const unrevealed = cards.filter(c => !c.revealed);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 14, 0.92)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        style={{
          background: 'var(--bg-1)',
          borderTop: '3px solid var(--assassin)',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          width: '100%',
          maxWidth: 480,
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--assassin)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          เสียอิทธิพล
        </div>

        {/* Heading */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          เลือกไพ่ที่จะเปิด
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 28,
          }}
        >
          {REASONS[reason] ?? reason}
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
          {unrevealed.map(card => (
            <motion.div
              key={card.id}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onReveal(card.id)}
              style={{ cursor: 'pointer' }}
            >
              <GameCard card={card} isHidden={false} isSelectable size="lg" />
            </motion.div>
          ))}
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          แตะไพ่เพื่อเปิดและเสียไพ่นั้น
        </div>
      </motion.div>
    </motion.div>
  );
}
