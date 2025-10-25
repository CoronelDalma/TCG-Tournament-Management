import { MIN_PLAYERS, Tournament, TournamentStatus, TournamentWithRounds, UserRole } from "../../entities";
import { TournamentService, UserService } from "../../services";

interface StartTournamentData {
    dependencies: {
        tournamentService: TournamentService;
        userService: UserService;
    },
    payload: {
        tournamentId: string;
        requesterId: string;
    }
}

function canStartTournament(requesterId: string, organizerId: string, role: UserRole): boolean {
    return requesterId === organizerId || role === UserRole.ADMIN;
}

export async function startTournament({ dependencies, payload}: StartTournamentData): Promise<TournamentWithRounds> {
    const { tournamentService, userService} = dependencies;
    const { tournamentId, requesterId } = payload;

    const tournament = await tournamentService.getTournamentById(tournamentId);
    if (! tournament) {
        throw new Error(`Tournament with ID ${tournamentId} not found.`);
    }

    const requester = await userService.getById(requesterId);
    if (!requester) {
        throw new Error("User not found.");
    }

    if (!canStartTournament(requesterId, tournament.organizerId, requester.role)) {
        throw new Error('Permission denied. Only the Admin or the Tournament Organizer can start this tournament.')
    }

    if ( tournament.status !== TournamentStatus.PENDING) {
        throw new Error(`Tournament must have status PENDING to be started. Current status: ${tournament.status}`);
    }

    const numPlayers = tournament.registeredPlayersIds.length;
    if (numPlayers < MIN_PLAYERS) {
        throw new Error(`Cannot start the tournament: at least ${MIN_PLAYERS} players are required.`);
    }

    const round1 = tournamentService.createSwissRoundOne(tournament.registeredPlayersIds, tournamentId);


    const startedTournament = await tournamentService.updateTournamentById(tournament.id, {
        status: TournamentStatus.ACTIVE
    });

    return { ...startedTournament, rounds: [round1]};
}