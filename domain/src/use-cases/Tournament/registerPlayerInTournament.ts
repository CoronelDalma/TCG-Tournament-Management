import { Tournament, TournamentStatus} from "../../entities"
import { TournamentService, UserService } from "../../services"

interface RegisterPlayerInTournamentData {
    dependencies: {
        tournamentService: TournamentService;
        userService: UserService;
    };
    payload: {
        tournamentId: string;
        playerId: string;
    };
}

export async function registerPlayerInTournament({ dependencies, payload}: RegisterPlayerInTournamentData): Promise<Tournament> {
    const { tournamentService, userService } = dependencies;
    const { tournamentId, playerId } = payload;

    const tournament = await tournamentService.getTournamentById(tournamentId);
    if (! tournament) {
        throw new Error(`Tournament with ID ${tournamentId} not found.`);
    }

    const userFound = await userService.getById(playerId);
    if (!userFound) {
        throw new Error(`Player with ID ${playerId} not found.`);
    }

    if (tournament.status !== TournamentStatus.PENDING) {
        throw new Error(`Cannot register. Tournament is currently ${tournament.status}. Only PENDING tournaments allow registration.`);
    }

    const currentPlayersCount = tournament.registeredPlayersIds.length;
    if (currentPlayersCount >= tournament.maxPlayers) {
        throw new Error(`Tournament is already full (${currentPlayersCount}/${tournament.maxPlayers}).`);
    }

    if (tournament.registeredPlayersIds.includes(playerId)) {
        throw new Error(`Player with ID ${playerId} is already registered in this tournament.`);
    }

    const updatedPlayersIds = [...tournament.registeredPlayersIds, playerId];

    const updatedTournament = await tournamentService.updateTournamentById(tournament.id, {
        registeredPlayersIds: updatedPlayersIds
    });

    return updatedTournament;
}