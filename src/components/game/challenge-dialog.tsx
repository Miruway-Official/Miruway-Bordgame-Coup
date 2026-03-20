'use client';

import { motion } from 'framer-motion';
import { PendingAction, CharacterName } from '@/lib/engine/types';
import { CHARACTER_COLORS } from '@/lib/engine/constants';

interface ChallengeDialogProps {
  pendingAction: PendingAction;
  actorName: string;
  onChallenge: () => void;
  onPass: () => void;
  // Block support — shown when the human can legally block this action
  blockableCharacters?: CharacterName[];
  onBlock?: (char: CharacterName) => void;
}

const ACTION_TH: Record<string, string> = {
  foreign_aid: 'รับความช่วยเหลือต่างประเทศ',
  tax: 'เก็บภาษี (ดยุค)',
  steal: 'ขโมยเหรียญ (กัปตัน)',
  assassinate: 'ลอบสังหาร (นักฆ่า)',
  exchange: 'แลกไพ่ (เอกอัครราชทูต)',
};

const CHAR_COLOR: Record<CharacterName, string> = {
  Duke: 'var(--duke)',
  Assassin: 'var(--assassin)',
  Captain: 'var(--captain)',
  Ambassador: 'var(--ambassador)',
  Contessa: 'var(--contessa)',
};

export function ChallengeDialog({
  pendingAction,
  actorName,
  onChallenge,
  onPass,
  blockableCharacters,
  onBlock,
}: ChallengeDialogProps) {
  const charColor = pendingAction.claimedCharacter
    ? CHARACTER_COLORS[pendingAction.claimedCharacter]
    : '#d4a847';
  const canChallenge = !!pendingAction.claimedCharacter;
  const canBlock = (blockableCharacters?.length ?? 0) > 0 && !!onBlock;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4, 6, 14, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
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
          borderTop: `3px solid ${charColor}`,
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          width: '100%', maxWidth: 480,
        }}
      >
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, fontWeight: 700,
          color: charColor,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          ประกาศการกระทำ
        </div>

        {/* Actor name */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 36, fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          {actorName}
        </div>

        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6,
        }}>
          {canChallenge ? 'อ้างว่าจะ' : 'พยายามจะ'}{ACTION_TH[pendingAction.type] ?? pendingAction.type}
        </div>

        {pendingAction.claimedCharacter && (
          <div style={{
            display: 'inline-block',
            padding: '4px 14px', borderRadius: 20,
            border: `1px solid ${charColor}60`,
            background: `${charColor}15`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 600, color: charColor,
            marginBottom: 24,
          }}>
            {pendingAction.claimedCharacter}
          </div>
        )}
        {!pendingAction.claimedCharacter && <div style={{ marginBottom: 24 }} />}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Challenge */}
          {canChallenge && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={onChallenge}
              style={{
                padding: '16px', borderRadius: 12,
                border: '1px solid var(--assassin)',
                background: 'oklch(12% 0.05 22)',
                color: 'oklch(75% 0.15 22)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
              ท้าทาย — จับโกหก
            </motion.button>
          )}

          {/* Block buttons — one per blockable character */}
          {canBlock && blockableCharacters!.map(char => (
            <motion.button key={char} whileTap={{ scale: 0.97 }} onClick={() => onBlock!(char)}
              style={{
                padding: '16px', borderRadius: 12,
                border: `1px solid ${CHAR_COLOR[char]}60`,
                background: `${CHAR_COLOR[char]}12`,
                color: CHAR_COLOR[char],
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
              สกัดในฐานะ {char}
            </motion.button>
          ))}

          {/* Pass */}
          <motion.button whileTap={{ scale: 0.97 }} onClick={onPass}
            style={{
              padding: '16px', borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-2)',
              color: 'var(--text-secondary)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
            }}>
            ผ่าน — อนุญาต
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
