'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameLogEntry } from '@/lib/engine/types';
import { cn } from '@/lib/utils';

interface GameLogProps {
  entries: GameLogEntry[];
}

const TYPE_COLORS: Record<GameLogEntry['type'], string> = {
  action: 'text-yellow-300',
  challenge: 'text-red-300',
  block: 'text-blue-300',
  reveal: 'text-orange-300',
  system: 'text-gray-400',
};

const TYPE_BORDERS: Record<GameLogEntry['type'], string> = {
  action: 'border-l-yellow-500/50',
  challenge: 'border-l-red-500/50',
  block: 'border-l-blue-500/50',
  reveal: 'border-l-orange-500/50',
  system: 'border-l-gray-600/50',
};

export function GameLog({ entries }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
        บันทึกเกม
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {entries.map(entry => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'border-l-2 pl-2 py-1 rounded-r',
                TYPE_BORDERS[entry.type],
                'bg-gray-800/30',
              )}
            >
              <span className={cn('text-xs', TYPE_COLORS[entry.type])}>
                {entry.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
