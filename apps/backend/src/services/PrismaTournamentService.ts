import { PrismaClient } from "@prisma/client";
import { NewTournament, Round, Tournament, TournamentStatus, UserRole } from "domain/src";
import { TournamentService } from "domain/src";

const prisma = new PrismaClient();

function mapPrismaTournamentToDomain(prismaTournament: any): Tournament {
    return {
        id: prismaTournament.id,
        name: prismaTournament.name,
        description: prismaTournament.description || '',
        organizerId: prismaTournament.organizedId,
        maxPlayers: prismaTournament.maxPlayers,
        startDate: prismaTournament.startDate,
        status: prismaTournament.status as TournamentStatus,
        format: prismaTournament.format,
        registeredPlayersIds: prismaTournament.registeredPlayersIds ? prismaTournament.registeredPlayersIds.map(( p: any) => p.id) : [],
    }
}
export class PrismaTournamentService implements TournamentService {
    async createTournament(data: NewTournament): Promise<Tournament> {

        const createdTournament = await prisma.tournament.create({
            data: {
                name: data.name,
                description: data.description,
                organizedId: data.organizerId,
                maxPlayers: data.maxPlayers,
                startDate: data.startDate,
                format: data.format,
                status: TournamentStatus.PENDING,
            },
            include: { registeredPlayersIds: true}
        });

        return mapPrismaTournamentToDomain(createdTournament);
    }
    async getTournamentById(id: string): Promise<Tournament | null> {
        const tournament = await prisma.tournament.findUnique({ where: {id}, include: {registeredPlayersIds: true}});
        if (!tournament) return null;

        return mapPrismaTournamentToDomain(tournament);
    }
    async getAllTournamentByOrganizerId(organizerId: string): Promise<Tournament[]> {
        const prismaTournaments = await prisma.tournament.findMany({
            where: {
                organizedId: organizerId
            },
            include: {registeredPlayersIds: true}
        });

        return prismaTournaments.map(mapPrismaTournamentToDomain);
    }

    async updateTournamentById(id: string, updateDAta: Partial<Tournament>): Promise<Tournament> {
        const { registeredPlayersIds, ...rest} = updateDAta;
        let playerUpdate: any = {};

        if (registeredPlayersIds !== undefined) {
            playerUpdate.registeredPlayersIds = {
                set: registeredPlayersIds.map(playerId => ({ id: playerId}))
            }
        }

        const updatedTournament = await prisma.tournament.update({
            where: {id},
            data: {
                ...rest,
                ...playerUpdate
            },
            include: {registeredPlayersIds: true}
        });

        return mapPrismaTournamentToDomain(updatedTournament);
    }

    async deleteById(id: string): Promise<void> {
        await prisma.tournament.delete({
            where: { id }, 
            include: {registeredPlayersIds: true}
        });
    }
    
    async getAllByStatus(status: TournamentStatus): Promise<Tournament[]> {
        const prismaTournaments = await prisma.tournament.findMany({
            where: {
                status: status
            },
            include: {registeredPlayersIds: true}
        });

        return prismaTournaments.map(mapPrismaTournamentToDomain);
    }

    // saveRoundOne(roundData: Round): Promise<Round> {
    //     console.log("---- service createSwissRoundOne")
    //     throw new Error("Method not implemented.");
    // }

    async startTournament(tournamentId: string): Promise<Tournament> {
        console.log("---- service startTournament")
        const updatedTournament = await this.updateTournamentById(tournamentId, {
            status: TournamentStatus.ACTIVE
        });
        return updatedTournament;
    }
    
}