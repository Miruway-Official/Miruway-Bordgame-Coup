'use client';

import { motion } from 'framer-motion';
import { Player, ActionType } from '@/lib/engine/types';
import { Coins, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TargetSelectorProps {
  targets: Player[];
  actionType: ActionType;
  onSelect: (playerId: string) => void;
  onCancel: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  steal: 'Steal from',
  assassinate: 'Assassinate',
  coup: 'Coup',
};

export function TargetSelector({ targets, actionType, onSelect, onCancel }: TargetSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-lg">
            {ACTION_LABELS[actionType] || 'Target'} who?
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {targets.map(target => (
            <motion.button
              key={target.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(target.id)}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl border border-gray-700',
                'bg-gray-800/60 hover:bg-red-900/30 hover:border-red-500/50 transition-all text-left',
              )}
            >
              <div>
                <div className="text-white font-semibold">{target.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {target.cards.filter(c => !c.revealed).length} influence remaining
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{target.coins}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all text-sm"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
