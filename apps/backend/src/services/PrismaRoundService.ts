import { Match, MatchResult, Round, RoundService } from "domain/src";
import { PrismaClient, Prisma, MatchResult as PrismaMatchResult } from "@prisma/client";

const prisma = new PrismaClient();

type MatchCreateInput = Prisma.MatchCreateWithoutRoundRelationInput;

interface PrismaMatchWithRound {
    id: string;
    tournamentId: string;
    roundId: string; // Foreign key de Prisma
    player1Id: string;
    player2Id: string | null;
    result: string;
    score: string;
    // Debemos incluir la relación de la ronda para obtener el número de ronda.
    roundRelation?: { roundNumber: number }; 
}

function mapPrismaMatchToDomain(match: PrismaMatchWithRound): Match {
    const roundNumber = match.roundRelation?.roundNumber || 0; 
    return {
        id: match.id,
        tournamentId: match.tournamentId,
        roundNumber: roundNumber,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        result: match.result as MatchResult,
        score: match.score
    }
}

// Interfaz para el objeto Round de Prisma, incluyendo los matches
interface PrismaRoundWithMatches {
    id: string;
    tournamentId: string;
    roundNumber: number;
    isCompleted: boolean;
    // Los matches deben ser mapeados al formato que mapPrismaMatchToDomain espera
    matches: PrismaMatchWithRound[]; 
}

function mapPrismaRoundToDomain(roundData: PrismaRoundWithMatches): Round {
    const matchesWithRoundInfo = roundData.matches.map(m => ({
        ...m,
        roundRelation: { roundNumber: roundData.roundNumber }
    }));

    return {
        id: roundData.id,
        tournamentId: roundData.tournamentId,
        roundNumber: roundData.roundNumber,
        isCompleted: roundData.isCompleted,
        matches: matchesWithRoundInfo.map(mapPrismaMatchToDomain),
    }
}

export class PrismaRoundService implements RoundService {
    private mapDomainResultToPrismaEnum(domainResult: MatchResult): PrismaMatchResult {
        // Convertimos a minúsculas y snake_case para hacer match con el schema de Prisma.
        const resultString = domainResult.toLowerCase().replace(/-/g, '_');

        switch (resultString) {
            case 'player1_wins':
                return 'player1_wins';
            case 'player2_wins':
                return 'player2_wins';
            case 'draw':
                return 'draw';
            // El valor 'bye' de tu schema de Prisma cubre el caso del bye win
            case 'bye':
            case 'bye_win': 
                return 'bye';
            case 'pending':
            default:
                return 'pending';
        }
    }
    async createSwissRoundOne(roundData: Round): Promise<Round> {
        const createRound = await prisma.round.create({
            data: {
                tournamentId: roundData.tournamentId,
                roundNumber: roundData.roundNumber,
                isCompleted: roundData.isCompleted,
                matches: {
                    create: roundData.matches.map((match: Match) => {
                        const matchData: MatchCreateInput = {
                                tournament: { connect: { id: match.tournamentId } },
                                player1: { connect: { id: match.player1Id } },
                                // Mapear el resultado al string literal que Prisma espera.
                                result: this.mapDomainResultToPrismaEnum(match.result), 
                                score: match.score,
                            };
                                                     // Agregar player2 solo si existe (para evitar errores en byes)
                        if (match.player2Id) {
                            matchData.player2 = { connect: { id: match.player2Id } };
                        }
                            
                        return matchData;
                    }),     
                }
            },
            include: {
                matches: { include: { roundRelation: true } }
            }
        }) as unknown as PrismaRoundWithMatches; // Forzamos el tipo para que el mapeador funcione;

        return mapPrismaRoundToDomain(createRound);
    }
        
    async getMatchById(matchId: string): Promise<Match | null> {
        const match = await prisma.match.findUnique({ where: { id: matchId }, include: { roundRelation: true} }) as PrismaMatchWithRound | null;
        if (!match) return null;
        return mapPrismaMatchToDomain(match);
    }

    async updateMatchResult(matchId: string, result: MatchResult, score: string): Promise<Match> {
        const updatedMatch = await prisma.match.update({
            where: { id: matchId },
            data: {
                result: result as any,
                score: score,
            },
            include: { roundRelation: true}
        }) as PrismaMatchWithRound;
        return mapPrismaMatchToDomain(updatedMatch);
    }

    async getRoundById(roundId: string): Promise<Round | null> {
        const round = await prisma.round.findUnique({ where: { id: roundId }, include: { matches: true } });
        if (!round) return null;
        return mapPrismaRoundToDomain(round);
    }
    
    async completeRound(roundId: string): Promise<Round> {
        const completedRound = await prisma.round.update({
            where: { id: roundId },
            data: { isCompleted: true },
            include: {
                matches: { include: { roundRelation: true } }
            }
        });
        return mapPrismaRoundToDomain(completedRound);
    }

}