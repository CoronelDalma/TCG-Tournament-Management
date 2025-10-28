import { Match, MatchResult, MIN_PLAYERS, Round, Tournament, TournamentStatus, TournamentWithRounds, UserRole } from "../../entities";
import { TournamentService, UserService, RoundService } from "../../services";

interface StartTournamentData {
    dependencies: {
        tournamentService: TournamentService;
        userService: UserService;
        roundService: RoundService;
    },
    payload: {
        tournamentId: string;
        requesterId: string;
    }
}

function canStartTournament(requesterId: string, organizerId: string, role: UserRole): boolean {
    return requesterId === organizerId || role === UserRole.ADMIN;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = shuffled[i] as T;
        shuffled[i] = shuffled[j] as T;
        shuffled[j] = tmp;
    }
    return shuffled;
}

function createSwissRoundOne( registeredPlayersIds: string[], tournamentId: string): Round {
    const shuffledPlayers = shuffleArray(registeredPlayersIds);
    const numPlayers = shuffledPlayers.length;

    const matches: Match[] = [];
    let roundNumber = 1;
    let playerIndex = 0;

    while (playerIndex < numPlayers) {
        const player1Id = shuffledPlayers[playerIndex];
        // player2Id será null si solo queda un jugador (BYE)
        const player2Id = shuffledPlayers[playerIndex + 1] || null; 
        
        const newMatch: Match = {
            id: crypto.randomUUID(), // Generar ID único 
            tournamentId: tournamentId,
            roundNumber: roundNumber,
            player1Id: player1Id,
            player2Id: player2Id, // null si es BYE
            // Si player2Id es null, es un BYE y se resuelve como victoria para P1 (por defecto en Suizo)
            result: player2Id === null ? MatchResult.BYE : MatchResult.PENDING, 
            score: player2Id === null ? "1-0" : "0-0", // Puntuación inicial (1-0 para BYE, 0-0 para normal)
        } as Match;
        
        matches.push(newMatch);
        playerIndex += 2; // Avanzamos 2 jugadores
    }

    const round: Round = {
        id: crypto.randomUUID(), // Generar ID único para la ronda
        tournamentId: tournamentId,
        roundNumber: roundNumber,
        // Si hay BYE, la ronda no está inmediatamente completa hasta que las otras partidas finalicen.
        isCompleted: false, 
        matches: matches,
    };

    return round;
}

export async function startTournament({ dependencies, payload}: StartTournamentData): Promise<TournamentWithRounds> {
    const { tournamentService, userService, roundService } = dependencies;
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

    const round1Data = createSwissRoundOne(tournament.registeredPlayersIds, tournamentId);
    console.log(round1Data);
    const round1 = await roundService.createSwissRoundOne(round1Data);

    const startedTournament = await tournamentService.startTournament(tournamentId);

    return { ...startedTournament, rounds: [round1]};
}