'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/lib/engine/types';
import { GameCard } from './card';

interface ExchangeDialogProps {
  cards: Card[];
  onConfirm: (keptCardIds: string[]) => void;
}

export function ExchangeDialog({ cards, onConfirm }: ExchangeDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const unrevealed = cards.filter(c => !c.revealed);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 2
          ? [...prev.slice(1), id]
          : [...prev, id],
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 6, 14, 0.90)',
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
          borderTop: '3px solid var(--ambassador)',
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
            color: 'var(--ambassador)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          การแลกไพ่เอกอัครราชทูต
        </div>

        {/* Heading */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          เลือกไพ่ 2 ใบที่จะเก็บ
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 24,
          }}
        >
          เลือกพอดี 2 ใบ ส่วนที่เหลือคืนสู่สำรับ
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {unrevealed.map(card => (
            <motion.div
              key={card.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => toggle(card.id)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <GameCard
                card={card}
                isHidden={false}
                isSelectable
                isSelected={selected.includes(card.id)}
                size="md"
              />
              {selected.includes(card.id) && (
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--ambassador)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  {selected.indexOf(card.id) + 1}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 16,
          }}
        >
          {selected.length}/2 ใบที่เลือก
        </div>

        <motion.button
          whileTap={selected.length === 2 ? { scale: 0.97 } : {}}
          onClick={() => selected.length === 2 && onConfirm(selected)}
          disabled={selected.length !== 2}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: `1px solid ${selected.length === 2 ? 'var(--ambassador)' : 'var(--border)'}`,
            background:
              selected.length === 2 ? 'oklch(14% 0.05 155)' : 'transparent',
            color:
              selected.length === 2 ? 'var(--ambassador)' : 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: selected.length === 2 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          ยืนยันการแลก
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
