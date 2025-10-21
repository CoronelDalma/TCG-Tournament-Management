import { Tournament, TournamentStatus } from "../../entities";
import { TournamentService } from "../../services"

interface GetAllTournamentsData {
    dependencies: {
        tournamentService: TournamentService;
    };
    payload: {}; 
}


export async function getAllTournaments({ dependencies }: GetAllTournamentsData): Promise<Tournament[]> {
    const { tournamentService } = dependencies;
    const pendingTournaments = await tournamentService.getAllByStatus(TournamentStatus.PENDING);

    return pendingTournaments;
}