import { describe, test, expect, beforeEach} from 'vitest';
import { UserServiceMock } from '../../services/mocks/UserServiceMock';
import { existingTournaments, TournamentServiceMock } from '../../services/mocks/TournamentServiceMock';
import { NewTournament, TournamentCredentials, TournamentStatus } from '../../entities';
import { resetExistingUsers } from '../../entities/mocks/user-mock';
import { createTournament } from './createTournament';

beforeEach(() => {
    resetExistingUsers();
    existingTournaments.length = 0;
})
describe('TournamentService', async () => {
    const tournamentService = TournamentServiceMock;
    const userService = UserServiceMock;

    const baseTournament: NewTournament = {
        name: "Test Commander League",
        description: "Weekly Commander Tournament for fun.",
        organizerId: 'user-2', // ID de Organizer Mock
        maxPlayers: 16,
        startDate: new Date(),
        format: 'Commander'
    }

    test('should allow an ORGANIZER user to create a tournament and initialize registeredPlayerIds as empty', async () => {
        const requesterId = 'user-2';
        const tournamentData: TournamentCredentials = {data: {...baseTournament}, requesterId};

        const result = await createTournament( {
            dependencies: { tournamentService, userService},
            payload: { data: tournamentData}
        })

        expect(result).toHaveProperty('id');
        expect(result.status).toBe(TournamentStatus.PENDING);
        expect(result.organizerId).toBe(requesterId);
        expect(result.registeredPlayersIds).toEqual([]);
    })

    test('should allow an ADMIN user to create a tournament and initialize registeredPlayerIds as empty', async () => {
        const requesterId = 'user-1';
        const newTournament = {...baseTournament, organizerId: requesterId};
        const tournamentData: TournamentCredentials = {data: {...newTournament}, requesterId};

        const result = await createTournament( {
            dependencies: { tournamentService, userService},
            payload: { data: tournamentData}
        })

        expect(result).toHaveProperty('id');
        expect(result.status).toBe(TournamentStatus.PENDING);
        expect(result.organizerId).toBe(requesterId);
        expect(result.registeredPlayersIds).toEqual([]);
        expect(existingTournaments.length).toBe(1);
    })

    test('should reject a PLAYER user to create a tournament', async () => {
        const requesterId = 'user-3';
        const tournamentData: TournamentCredentials = {data: {...baseTournament}, requesterId};

        await expect(
            createTournament({
            dependencies: { tournamentService, userService },
            payload: { data: tournamentData },
            })
        ).rejects.toThrow('User is not authorized to create tournaments.');

        expect(existingTournaments.length).toBe(0);
    })

    test('should reject if requesterId !== organizerId', async () => {
        const requesterId = 'user-1';
        const tournamentData: TournamentCredentials = {data: {...baseTournament}, requesterId};

        await expect(
            createTournament( {
            dependencies: { tournamentService, userService},
            payload: { data: tournamentData}
            })
        ).rejects.toThrow('Organizer ID in payload must match requester ID.');
        expect(existingTournaments.length).toBe(0);
    })

    test('should reject if requesterId no exist', async () => {
        const requesterId = 'user-fake';
        const tournamentData: TournamentCredentials = {data: {...baseTournament}, requesterId};

        await expect(
            createTournament( {
            dependencies: { tournamentService, userService},
            payload: { data: tournamentData}
            })
        ).rejects.toThrow('Requester user not found.');
        expect(existingTournaments.length).toBe(0);
    })

    test('should reject creation if maxPlayers is less than 2', async () => {
        const requesterId = 'user-2';
        const newTournament = {...baseTournament, maxPlayers: 1};
        const tournamentData: TournamentCredentials = {data: {...newTournament}, requesterId};

        await expect(
            createTournament( {
            dependencies: { tournamentService, userService},
            payload: { data: tournamentData}
            })
        ).rejects.toThrow('Tournament must allow at least 2 players.');
        expect(existingTournaments.length).toBe(0);
    })

})