import { TournamentCredentials, TournamentService, UserService, createTournament, registerPlayerInTournament, getAllTournaments } from "domain/src";
import { Request, Response } from "express";
import { PrismaTournamentService } from "../services/PrismaTournamentService";
import { PrismaUserService } from "../services/PrismaUserService";
import { AuthRequest } from "../middlewares/AuthMiddleware"
import { _ } from "vitest/dist/chunks/reporters.d.BFLkQcL6";

const tournamentService: TournamentService = new PrismaTournamentService();
const userService: UserService = new PrismaUserService();

export async function createTournamentController( req: AuthRequest, res: Response) {
    console.log("createTournament endpoint hit");

    const requesterId = req.userId;
    if (!requesterId || !req.body.name || !req.body.maxPlayers || !req.body.format || !req.body.startDate) {
        return res.status(400).json({ error: "Missing required fields (name, maxPlayers, format, startDate)." });
    }
        console.log("name: ", req.body.name);
        console.log("name: ", req.body.maxPlayers);
        console.log("name: ", req.body.format);
        console.log("name: ", req.body.startDate);
        console.log("useriD. ", requesterId);
        console.log("role: ", req.body.role)
    try {
        const startDate = new Date(req.body.startDate);
        const payloadData: TournamentCredentials = {
            requesterId,
            data: {
                name: req.body.name,
                description: req.body.description || '',
                organizerId: requesterId,
                maxPlayers: parseInt(req.body.maxPlayers, 10),
                startDate: startDate, 
                format: req.body.format
            }
        };

        const newTournament = await createTournament({
            dependencies: { tournamentService, userService },
            payload: { data: payloadData }
        });

        res.status(201).json(newTournament);
    } catch ( error: any ) {
        console.error("Error creating tournament:", error.message);
        
        if (error.message.includes("User is not authorized to create tournaments.")) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes("Tournament must allow") || error.message.includes("Organizer ID")) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: "Failed to create tournament due to a server error." });
    }
}

export async function registerPlayerController(req: AuthRequest, res: Response) {
    const playerId = req.userId;
    const tournamentId = req.params.tournamentId;

    if (!playerId) {
        return res.status(401).json({ error: "Authentication required." });
    }

    if (!tournamentId) {
        return res.status(400).json({ error: "Missing tournamentId parameter." });
    }

    try {
        const updatedTournament = await registerPlayerInTournament({
            dependencies: { tournamentService, userService },
            payload: {
                tournamentId: tournamentId,
                playerId: playerId
            }
        });
        console.log(updatedTournament);
        res.status(200).json(updatedTournament);
    } catch (error: any) {
        console.error("Error registering player:", error.message);
        
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Cannot register") || error.message.includes("already full") || error.message.includes("already registered")) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: "Failed to register player due to a server error." });
    }
}

export async function getTournamentsController( req: Request, res: Response) {
    console.log("get tournaments endpoint hit");
    
    try {
        const tournaments = await getAllTournaments({
            dependencies: { tournamentService },
            payload: {}
        });

        res.status(200).json(tournaments);
    } catch(error: any) {
        console.error("Error fetching tournaments:", error.message);
        res.status(500).json({ error: "Failed to fetch tournaments due to a server error." });
    }
}

