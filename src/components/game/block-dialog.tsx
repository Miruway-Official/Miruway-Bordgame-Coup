'use client';

import { motion } from 'framer-motion';
import { PendingAction, CharacterName } from '@/lib/engine/types';
import { CHARACTER_COLORS } from '@/lib/engine/constants';
import { Shield, X } from 'lucide-react';

interface BlockDialogProps {
  pendingAction: PendingAction;
  blockableCharacters: CharacterName[];
  actorName: string;
  onBlock: (char: CharacterName) => void;
  onPass: () => void;
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
  foreign_aid: 'รับ 2 เหรียญจากต่างประเทศ',
  steal: 'ขโมยเหรียญของคุณ',
  assassinate: 'ลอบสังหารคุณ',
};

export function BlockDialog({ pendingAction, blockableCharacters, actorName, onBlock, onPass }: BlockDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/50 text-blue-300 bg-blue-900/20 mb-3">
            โอกาสสกัด
          </div>
          <h2 className="text-white font-bold text-xl mb-2">{actorName}</h2>
          <p className="text-gray-400 text-sm">
            กำลังพยายามจะ {ACTION_DESCRIPTIONS[pendingAction.type] ?? pendingAction.type}
          </p>
        </div>

        {blockableCharacters.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">อ้างตัวเป็นตัวละครเพื่อสกัด</div>
            <div className="space-y-2">
              {blockableCharacters.map(char => {
                const color = CHARACTER_COLORS[char];
                return (
                  <motion.button
                    key={char}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onBlock(char)}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border font-semibold transition-all"
                    style={{
                      borderColor: `${color}50`,
                      background: `${color}15`,
                      color,
                    }}
                  >
                    <Shield className="w-4 h-4" />
                    สกัดในฐานะ {char}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPass}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800/60 border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700/60 transition-all"
        >
          <X className="w-4 h-4" />
          ผ่าน (อนุญาต)
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
