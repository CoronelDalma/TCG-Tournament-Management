import express  from "express";
import { registerController, loginController } from "../controllers/auth.controller";

const authRoutes = express.Router();

authRoutes.get("/ping", (req, res) => {
    res.send("pong");
});

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);

export default authRoutes;
