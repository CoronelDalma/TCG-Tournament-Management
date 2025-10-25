import { NewTournament, Round, Tournament, TournamentStatus } from "../../entities";
import { TournamentService } from "../Tournament/TournamentService";

// mocks
export let existingTournaments: Tournament[] = [];
export function createTournamentMock(overrides: Partial<Tournament> = {}): Tournament {
    return {
        id: "t-23",
        name: overrides.name || "Torneo TCG de Prueba",
        description: overrides.description || "Un torneo estándar para tests.",
        organizerId: overrides.organizerId || "user-1",
        maxPlayers: overrides.maxPlayers || 8,
        startDate: overrides.startDate || new Date(Date.now() + 86400000), // Mañana
        status: overrides.status || TournamentStatus.PENDING,
        registeredPlayersIds: overrides.registeredPlayersIds || [],
        format: overrides.format || "Standard",
        ...overrides
    };
}

export function resetMockData() {
    existingTournaments = [];
}


export const TournamentServiceMock: TournamentService = {
    createTournament: async (data: NewTournament) => {
        const newTournament: Tournament = {
            ...data,
            id: (existingTournaments.length + 1).toString(),
            status: TournamentStatus.PENDING,
            registeredPlayersIds: [],
            startDate: new Date(),
        };
        existingTournaments.push(newTournament);
        return newTournament;
    },
    getTournamentById: async (id: string) => {
        return existingTournaments.find(tournament => tournament.id === id) || null;
    },
    getAllTournamentByOrganizerId: function (organizerId: string): Promise<Tournament[]> {
        throw new Error("Function not implemented.");
    },
    updateTournamentById: function (id: string, updateDAta: Partial<Tournament>): Promise<Tournament> {
        throw new Error("Function not implemented.");
    },
    deleteById: function (id: string): Promise<void> {
        throw new Error("Function not implemented.");
    },
    getAllByStatus: async function (status: TournamentStatus): Promise<Tournament[]> {
        return existingTournaments.filter(tournament => tournament.status === status);
    },
    startTournament: function (tournamentId: string, requesterId: string): Promise<Tournament> {
        throw new Error("Function not implemented.");
    },
    createSwissRoundOne: function (registeredPlayersIds: string[], tournamentId: string): Round {
        throw new Error("Function not implemented.");
    }
}