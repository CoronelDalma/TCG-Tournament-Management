import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerPlayerInTournament } from './registerPlayerInTournament';
import { TournamentServiceMock, createTournamentMock, resetMockData } from '../../services/mocks/TournamentServiceMock';
import { UserServiceMock } from '../../services/mocks/UserServiceMock';
import { TournamentStatus, Tournament } from '../../entities';
import { resetExistingUsers } from '../../entities/mocks/user-mock';

describe('registerPlayerInTournament Use Case', () => {
    
    const tournamentService = TournamentServiceMock;
    const userService = UserServiceMock;

    const PLAYER_ID = 'user-3';
    let tournament: Tournament;

    beforeEach(() => {
        resetExistingUsers();
        resetMockData();
        tournament = createTournamentMock({
            id: 't-1',
            status: TournamentStatus.PENDING,
            maxPlayers: 4,
            registeredPlayersIds: [],
        });
        
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue(tournament);
        vi.spyOn(tournamentService, 'updateTournamentById').mockImplementation(async (id, data) => {
            // Simula la actualización en el mock de la DB
            if (data.registeredPlayersIds) {
                tournament.registeredPlayersIds = data.registeredPlayersIds;
            }
            return tournament;
        });
        
        vi.clearAllMocks();
    });

    test('debe registrar un jugador en un torneo PENDING con éxito', async () => {
        const updatedTournament = await registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: { tournamentId: 't-1', playerId: PLAYER_ID }
        });

        // Assert
        expect(tournamentService.updateTournamentById).toHaveBeenCalledTimes(1);
        expect(updatedTournament.registeredPlayersIds).toContain(PLAYER_ID);
        expect(updatedTournament.registeredPlayersIds.length).toBe(1);
    });

    test('debe fallar si el torneo no existe', async () => {
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue(null);

        await expect(registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: { tournamentId: 't-nonexistent', playerId: PLAYER_ID }
        })).rejects.toThrow('Tournament with ID t-nonexistent not found.');
    });
    
    test('debe fallar si el torneo NO está en estado PENDING (ej: COMPLETED)', async () => {
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            status: TournamentStatus.COMPLETED,
        });

        // Act & Assert
        await expect(registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: { tournamentId: 't-1', playerId: PLAYER_ID }
        })).rejects.toThrow(/Cannot register. Tournament is currently completed. Only PENDING tournaments allow registration./);
    });

    test('debe fallar si el torneo está lleno', async () => {
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            maxPlayers: 1,
            registeredPlayersIds: ['existing-player-id'],
        });

        // Act & Assert
        await expect(registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: { tournamentId: 't-1', playerId: PLAYER_ID }
        })).rejects.toThrow(/Tournament is already full/);
    });

    test('debe fallar si el jugador ya está registrado', async () => {
        // Configuración: El jugador ya está en la lista
        vi.spyOn(tournamentService, 'getTournamentById').mockResolvedValue({
            ...tournament,
            registeredPlayersIds: [PLAYER_ID],
        });

        await expect(registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: { tournamentId: 't-1', playerId: PLAYER_ID }
        })).rejects.toThrow(/is already registered in this tournament/);
    });
});
