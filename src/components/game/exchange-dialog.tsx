'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/lib/engine/types';
import { GameCard } from './card';

interface ExchangeDialogProps {
  handCards: Card[];
  drawnCards: Card[];
  onConfirm: (keptCardId: string, offeredHandCardId: string) => void;
}

export function ExchangeDialog({ handCards, drawnCards, onConfirm }: ExchangeDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [offeredHandCardId, setOfferedHandCardId] = useState<string | null>(null);
  const [keptCardId, setKeptCardId] = useState<string | null>(null);

  const poolCards = offeredHandCardId
    ? [handCards.find(c => c.id === offeredHandCardId)!, ...drawnCards]
    : drawnCards;

  const handleOfferSelect = (id: string) => {
    setOfferedHandCardId(id);
    setKeptCardId(null);
    setStep(2);
  };

  const handleKeepSelect = (id: string) => {
    setKeptCardId(id);
  };

  const handleConfirm = () => {
    if (keptCardId && offeredHandCardId) {
      onConfirm(keptCardId, offeredHandCardId);
    }
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
          ความสามารถทูต
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}
        >
          {step === 1 ? 'เลือก 1 ใบจากมือเข้ากอง' : 'เลือก 1 ใบที่จะเก็บ'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 24,
          }}
        >
          {step === 1
            ? 'ไพ่ที่เลือกจะรวมกับไพ่จั่ว 2 ใบ'
            : 'เลือก 1 ใบจากกองรวม 3 ใบ — ที่เหลือคืนสู่สำรับ'}
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {[1, 2].map(s => (
            <div
              key={s}
              style={{
                width: 24,
                height: 4,
                borderRadius: 2,
                background: step >= s ? 'var(--ambassador)' : 'var(--border)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
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
          {step === 1
            ? handCards.map(card => (
                <motion.div
                  key={card.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleOfferSelect(card.id)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <GameCard
                    card={card}
                    isHidden={false}
                    isSelectable
                    isSelected={offeredHandCardId === card.id}
                    size="md"
                  />
                </motion.div>
              ))
            : poolCards.filter(Boolean).map(card => (
                <motion.div
                  key={card.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleKeepSelect(card.id)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <GameCard
                    card={card}
                    isHidden={false}
                    isSelectable
                    isSelected={keptCardId === card.id}
                    size="md"
                  />
                  {card.id === offeredHandCardId && (
                    <div style={{
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--ambassador)',
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>
                      จากมือ
                    </div>
                  )}
                </motion.div>
              ))}
        </div>

        {step === 2 && (
          <motion.button
            whileTap={keptCardId ? { scale: 0.97 } : {}}
            onClick={handleConfirm}
            disabled={!keptCardId}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: `1px solid ${keptCardId ? 'var(--ambassador)' : 'var(--border)'}`,
              background: keptCardId ? 'oklch(14% 0.05 155)' : 'transparent',
              color: keptCardId ? 'var(--ambassador)' : 'var(--text-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: keptCardId ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            ยืนยันการแลก
          </motion.button>
        )}

        {step === 2 && (
          <button
            onClick={() => { setStep(1); setKeptCardId(null); }}
            style={{
              marginTop: 10,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ← เลือกใหม่
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
