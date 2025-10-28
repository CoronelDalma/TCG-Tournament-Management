import { Match, MatchResult, Round, RoundService } from "domain/src";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    async createSwissRoundOne(roundData: Round): Promise<Round> {
        const createRound = await prisma.round.create({
            data: {
                tournamentId: roundData.tournamentId,
                roundNumber: roundData.roundNumber,
                isCompleted: roundData.isCompleted,
                matches: {
                    create: roundData.matches.map((match: Match) => ({
                        //round: match.roundNumber,
                        tournament: { connect: { id: match.tournamentId } },
                        player1: { connect: { id: match.player1Id } },
                        ...(match.player2Id ? { player2: { connect: { id: match.player2Id } } } : {}),
                        result: match.result as any,
                        score: match.score,
                    })),     
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