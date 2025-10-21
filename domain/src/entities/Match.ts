import { Entity } from "../utils/types/entity";

export const MatchResult = {
    PLAYER1_WIN: 'player1_win',
    PLAYER2_WIN: 'player2_win',
    DRAW: 'draw',
    PENDING: 'pending'
} as const;

export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];

export interface Match extends Entity {
    tournamentId: string;
    round: number;
    player1Id: string;
    player2Id: string;
    result: MatchResult;
    score: string; // 2-1-1
}

export type NewMatch = Omit<Match, 'id' | 'result' | 'score'>;