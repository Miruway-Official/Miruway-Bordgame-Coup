import { Player, ActionType, PendingAction } from './types';
import { ACTION_COSTS, ACTION_REQUIRES_TARGET, ACTION_BLOCKABLE_BY, ACTION_REQUIRES_CHARACTER, MUST_COUP_COINS } from './constants';

export function getAvailableActions(player: Player, allPlayers: Player[]): ActionType[] {
  const livingTargets = allPlayers.filter(p => !p.isEliminated && p.id !== player.id);
  const actions: ActionType[] = [];

  if (player.coins >= MUST_COUP_COINS) return ['coup'];

  actions.push('income');
  actions.push('foreign_aid');
  actions.push('tax');
  actions.push('exchange');

  if (livingTargets.length > 0) {
    actions.push('steal');
    if (player.coins >= 3) actions.push('assassinate');
    if (player.coins >= 7) actions.push('coup');
  }

  return actions;
}

export function buildPendingAction(type: ActionType, actorId: string, targetId?: string): PendingAction {
  return {
    type,
    actorId,
    targetId,
    claimedCharacter: ACTION_REQUIRES_CHARACTER[type],
    blockableBy: ACTION_BLOCKABLE_BY[type] ?? [],
    canBeCountered: !!(ACTION_BLOCKABLE_BY[type]?.length || ACTION_REQUIRES_CHARACTER[type]),
  };
}

export function requiresTarget(type: ActionType): boolean {
  return ACTION_REQUIRES_TARGET.includes(type);
}

export function getCost(type: ActionType): number {
  return ACTION_COSTS[type] ?? 0;
}
