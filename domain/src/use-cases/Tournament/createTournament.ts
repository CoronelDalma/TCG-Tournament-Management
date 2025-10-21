import { TournamentCredentials } from "../../entities";
import { TournamentService, UserService } from "../../services";
import { UserRole } from "../../entities";

interface CreateTournamentData {
    dependencies: {tournamentService: TournamentService, userService: UserService},
    payload: {data: TournamentCredentials}
}

type TournamentManagerRole = Exclude<UserRole, 'player'>;

function canManageTournament(role: UserRole):role is TournamentManagerRole {
    return role == UserRole.ADMIN || role == UserRole.ORGANIZER;
}

const MIN_PLAYERS: number = 2;

export async function createTournament({dependencies, payload}: CreateTournamentData) {
    const { tournamentService, userService } = dependencies;
    const { data, requesterId } = payload.data;
    const user = await userService.getById(requesterId);
   
    console.log("USer id: ", requesterId)
    console.log("Email: ", user?.email)
    if (!user) {
        throw new Error("Requester user not found.");
    }

    if (!canManageTournament(user.role)) {
        console.log(" -----------------ACAAAAA DETECTEEE QUE NO PODES CREAR")
        throw new Error('User is not authorized to create tournaments.');
    }

    if (data.maxPlayers < MIN_PLAYERS) {
        throw new Error(`Tournament must allow at least ${MIN_PLAYERS} players.`);
    }

    if (data.organizerId !== requesterId) {
        throw new Error("Organizer ID in payload must match requester ID.");
    }

    const tournament = await tournamentService.createTournament(data);
    return tournament;
}