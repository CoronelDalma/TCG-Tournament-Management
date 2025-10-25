import express from "express";
import { createTournamentController, getTournamentsController, registerPlayerController, startTournamentController } from "../controllers/tournament.controller";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const tournamentRouter = express.Router();

tournamentRouter.get("/", getTournamentsController);
tournamentRouter.post("/", AuthMiddleware, createTournamentController);
//tournamentRouter.post("/", AuthMiddleware, createTournamentController);
tournamentRouter.post("/:tournamentId/register", AuthMiddleware, registerPlayerController);
tournamentRouter.post("/:tournamentId/start", AuthMiddleware, startTournamentController);

export default tournamentRouter;