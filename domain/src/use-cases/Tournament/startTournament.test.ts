import { describe, test, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { startTournament } from './startTournament'
import { resetMockData, TournamentServiceMock } from '../../services/mocks/TournamentServiceMock'
import { UserServiceMock } from '../../services/mocks/UserServiceMock';
import { existingUsers, resetExistingUsers } from '../../entities/mocks/user-mock';
import { Tournament, TournamentStatus, UserRole } from '../../entities';
import { RoundServiceMock } from '../../services/mocks/RoundServiceMock';


    let ADMIN_ID: string;
    let ORGANIZER_ID: string;
    let PLAYER_ID: string;
    let ORGANIZER2_ID: string;

describe('start tournament use case', () => {
    const tournamentService = TournamentServiceMock;
    const userService = UserServiceMock;
    const roundService = RoundServiceMock;

    let tournament: Tournament;

    beforeAll(async () => {
        resetExistingUsers();

        ADMIN_ID= existingUsers[0]!.id;
        ORGANIZER_ID = existingUsers[1]!.id;
        PLAYER_ID = existingUsers[2]!.id;
        ORGANIZER2_ID = existingUsers[3]!.id;

        tournament = await TournamentServiceMock.createTournament( {
                name: "Tournament Test",
                description: "Testeo",
                organizerId: ORGANIZER_ID,
                maxPlayers: 8,
                startDate: new Date(Date.now() + 86400000), // tomorrow
                format: "STANDART"
        })
    })
    
    afterAll(() => {
        resetExistingUsers();
        resetMockData();
    })

    test('should reject if tournament id not found', async () => {
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: 'not-found', requesterId: ADMIN_ID}
        })).rejects.toThrow('Tournament with ID not-found not found.');
    })

    test('should reject if REQUESTER ID not found', async () => {
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: 'nothing'}
        })).rejects.toThrow('User not found.');
    })

    test('should reject if REQUESTER ID not found', async () => {
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ''}
        })).rejects.toThrow('User not found.');
    })

    test('should reject if ORGANIZER ID is not the tournament organizer ', async () => {      
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ORGANIZER2_ID}
        })).rejects.toThrow('Permission denied. Only the Admin or the Tournament Organizer can start this tournament.');
    })

    test('should reject if requester is a player ', async () => {      
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: PLAYER_ID}
        })).rejects.toThrow('Permission denied. Only the Admin or the Tournament Organizer can start this tournament.');
    })

    test('should reject if there are less than 2 registered players', async () => {      
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ORGANIZER_ID}
        })).rejects.toThrow('Cannot start the tournament: at least 2 players are required.');
    })

    test('should reject if the tournament is NOT in PENDING state (e.g. COMPLETED)', async () => {      
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            status: TournamentStatus.COMPLETED,
        });
        
        await expect(startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ORGANIZER_ID}
        })).rejects.toThrow('Tournament must have status PENDING to be started. Current status: completed');
    })

    test('should allow the tournament to start if the requester is the tournament organizer, the status is pending and has more than 2 registered players', async () => {      
            vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            registeredPlayersIds: ['existing-player-id','existing-player2-id'],
        });

        const res = await startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ORGANIZER_ID}
        })

        expect(res).toHaveProperty('rounds');
    })

    test('should allow the tournament to start if the requester is a ADMIN, the status is pending and has more than 2 registered players', async () => {      
            vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            registeredPlayersIds: ['existing-player-id','existing-player2-id'],
        });
        
        const res = await startTournament( {
            dependencies: { tournamentService, userService, roundService},
            payload: {tournamentId: tournament.id, requesterId: ADMIN_ID}
        })

        expect(res).toHaveProperty('rounds');
    })

})