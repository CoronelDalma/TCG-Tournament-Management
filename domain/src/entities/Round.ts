import { Entity } from '../utils/types/entity'
import { Match } from './Match'

export interface Round extends Entity {
    tournamentId: string;
    roundNumber: number;
    matches: Match[];
    isCompleted: boolean;
}

export type NewRound = Omit<Round, 'id' | 'matches' | 'isCompleted'>;