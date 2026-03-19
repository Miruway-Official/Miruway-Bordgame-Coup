'use client';

import { motion } from 'framer-motion';
import { ActionType } from '@/lib/engine/types';
import { ACTION_COSTS } from '@/lib/engine/constants';

interface ActionItem {
  label: string;
  sub: string;
  color: string;
}

const ACTIONS: Record<ActionType, ActionItem> = {
  income:      { label: 'รายได้',       sub: '+1 เหรียญ',       color: 'var(--text-secondary)' },
  foreign_aid: { label: 'ต่างประเทศ',  sub: '+2 เหรียญ',       color: 'var(--text-secondary)' },
  tax:         { label: 'เก็บภาษี',    sub: 'ดยุค · +3',       color: 'var(--duke)' },
  steal:       { label: 'ขโมย',         sub: 'กัปตัน · +2',    color: 'var(--captain)' },
  assassinate: { label: 'ลอบสังหาร',   sub: 'นักฆ่า',          color: 'var(--assassin)' },
  exchange:    { label: 'แลกไพ่',       sub: 'เอกอัครฯ',        color: 'var(--ambassador)' },
  coup:        { label: 'รัฐประหาร',   sub: 'บังคับเปิด',      color: 'var(--gold)' },
};

const ORDER: ActionType[] = [
  'income',
  'foreign_aid',
  'tax',
  'steal',
  'exchange',
  'assassinate',
  'coup',
];

interface ActionPanelProps {
  availableActions: ActionType[];
  playerCoins: number;
  onAction: (action: ActionType) => void;
}

export function ActionPanel({ availableActions, playerCoins, onAction }: ActionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-1)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        padding: '14px 14px 12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 12,
          paddingLeft: 2,
        }}
      >
        ตาของคุณ — เลือกการกระทำ
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {ORDER.map(action => {
          const cfg = ACTIONS[action];
          const cost = ACTION_COSTS[action];
          const isAvailable = availableActions.includes(action);
          const canAfford = playerCoins >= cost;
          const disabled = !isAvailable || !canAfford;

          // Resolve whether the color is a non-secondary accent
          const isAccent =
            cfg.color !== 'var(--text-secondary)' && cfg.color !== 'var(--text-muted)';

          return (
            <motion.button
              key={action}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && onAction(action)}
              disabled={disabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 3,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${disabled ? 'var(--border-subtle)' : cfg.color + '40'}`,
                background: disabled ? 'transparent' : `${cfg.color}0d`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.3 : 1,
                transition: 'all 0.15s ease',
                minHeight: 56,
                position: 'relative',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: disabled
                    ? 'var(--text-muted)'
                    : isAccent
                      ? cfg.color
                      : 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                {cfg.label}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                }}
              >
                {cfg.sub}
              </span>
              {/* Cost indicator dots */}
              {cost > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {Array.from({ length: Math.min(cost, 7) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: cost === 7 ? 'var(--gold)' : 'var(--assassin)',
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
