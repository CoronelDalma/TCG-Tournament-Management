import { NewTournament, Tournament, TournamentStatus } from "../../entities";
import { TournamentService } from "../Tournament/TournamentService";

export const existingTournaments: Tournament[] = [];

export const TournamentServiceMock: TournamentService = {
    createTournament: async (data: NewTournament) => {
        const newTournament: Tournament = {
            ...data,
            id: (existingTournaments.length+1).toString(),
            status: TournamentStatus.PENDING,
            registeredPlayersIds: [],
            startDate: new Date(),
        }
        existingTournaments.push(newTournament);
        return newTournament;
    },
    getTournamentById: async (id: string) => {
        return existingTournaments.find( tournament => tournament.id === id) || null;
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
    getAllByStatus: function (status: TournamentStatus): Promise<Tournament[]> {
        throw new Error("Function not implemented.");
    }
}