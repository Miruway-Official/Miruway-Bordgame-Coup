'use client';

import { motion } from 'framer-motion';
import { GamePhase } from '@/lib/engine/types';

interface TurnIndicatorProps {
  currentPlayerName: string;
  isHumanTurn: boolean;
  phase: GamePhase;
  isAIThinking: boolean;
  turnNumber: number;
}

const PHASE_DESCRIPTIONS: Record<GamePhase, string> = {
  ACTION_SELECT: 'เลือกการกระทำ',
  TARGET_SELECT: 'เลือกเป้าหมาย',
  ACTION_DECLARED: 'ประกาศแล้ว — รอตอบ',
  BLOCK_DECLARED: 'สกัดแล้ว — รอท้าทาย',
  CHALLENGE_RESOLVE: 'ตัดสินการท้าทาย',
  BLOCK_CHALLENGE_RESOLVE: 'ตัดสินการท้าทายสกัด',
  LOSE_INFLUENCE: 'ต้องเปิดไพ่',
  EXCHANGE_SELECT: 'เลือกไพ่ที่จะเก็บ',
  RESOLVE: 'กำลังดำเนินการ',
  GAME_OVER: 'จบเกม',
};

export function TurnIndicator({
  currentPlayerName,
  isHumanTurn,
  phase,
  isAIThinking,
  turnNumber,
}: TurnIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 10,
      }}
    >
      {/* Turn dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {isAIThinking ? (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--gold)',
            }}
          />
        ) : (
          <motion.div
            animate={isHumanTurn ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isHumanTurn ? 'var(--gold)' : 'var(--text-muted)',
            }}
          />
        )}
      </div>

      {/* Player name */}
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15,
          fontWeight: 600,
          color: isHumanTurn ? 'var(--gold)' : 'var(--text-secondary)',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {isHumanTurn ? 'ตาของคุณ' : `${currentPlayerName}`}
      </span>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 12,
          background: 'var(--border)',
          flexShrink: 0,
        }}
      />

      {/* Phase description */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'var(--text-muted)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {PHASE_DESCRIPTIONS[phase]}
        {isAIThinking && ' …'}
      </span>

      {/* Turn number */}
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          color: 'var(--text-muted)',
          flexShrink: 0,
          letterSpacing: '0.05em',
        }}
      >
        T{turnNumber}
      </span>
    </div>
  );
}
