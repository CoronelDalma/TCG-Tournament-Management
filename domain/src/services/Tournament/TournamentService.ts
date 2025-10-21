import { Tournament, NewTournament, TournamentStatus } from "../../entities";

export interface TournamentService {
    createTournament(data: NewTournament): Promise<Tournament>;
    getTournamentById(id: string): Promise<Tournament | null>
    getAllTournamentByOrganizerId(organizerId: string): Promise<Tournament[]>
    updateTournamentById(id: string, updateDAta: Partial<Tournament>): Promise<Tournament>;
    deleteById(id: string): Promise<void>;
    getAllByStatus(status: TournamentStatus): Promise<Tournament[]>;
}