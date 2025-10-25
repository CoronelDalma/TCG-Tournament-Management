import type { Entity } from "../utils/types/entity";
import { Round } from "./Round";

export const TournamentStatus = {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELED: 'canceled'
} as const;

export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

export const MIN_PLAYERS: number = 2;

export interface Tournament extends Entity {
    name: string;
    description: string;
    organizerId: string;
    maxPlayers: number;
    startDate: Date;
    status: TournamentStatus;
    registeredPlayersIds: string[];
    format: string;
}

export type NewTournament = Omit<Tournament, 'id' | 'status' | 'registeredPlayersIds'>;

export type TournamentCredentials = {
    data: NewTournament;
    requesterId: string
};

export interface TournamentWithRounds extends Tournament {
    rounds: Round[];
} 