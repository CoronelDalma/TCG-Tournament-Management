import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getAllTournaments } from './getAllTournaments';
import { TournamentServiceMock, resetMockData } from '../../services/mocks/TournamentServiceMock';
import { TournamentStatus } from '../../entities';

describe('getAllTournaments Use Case', () => {
    
    const tournamentService = TournamentServiceMock;

    beforeEach(() => {
        resetMockData();
        vi.spyOn(tournamentService, 'getAllByStatus').mockClear();
    });

    test('debe llamar a tournamentService.getAllByStatus con el estado PENDING', async () => {
        // Act
        await getAllTournaments({
            dependencies: { tournamentService },
            payload: {}
        });

        expect(tournamentService.getAllByStatus).toHaveBeenCalledTimes(1);
        expect(tournamentService.getAllByStatus).toHaveBeenCalledWith(TournamentStatus.PENDING);
    });

    test('debe devolver un array vacío si no hay torneos PENDING', async () => {
        vi.spyOn(tournamentService, 'getAllByStatus').mockResolvedValue([]);
        
        const tournaments = await getAllTournaments({
            dependencies: { tournamentService },
            payload: {}
        });

        expect(tournaments).toEqual([]);
    });
});