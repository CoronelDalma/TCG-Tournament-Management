import express from "express";
import { createTournamentController, getTournamentsController, registerPlayerController } from "src/controllers/tournament.controller";
import { AuthMiddleware } from "src/middlewares/AuthMiddleware";

const tournamentRouter = express.Router();

tournamentRouter.get("/", getTournamentsController);
tournamentRouter.post("/", AuthMiddleware, createTournamentController);
tournamentRouter.post("/:tournamentId/register", AuthMiddleware, registerPlayerController);

export default tournamentRouter;