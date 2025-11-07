import { Request, Response } from "express";
import { registerUser, loginUser } from "domain/src"
import { PrismaUserService } from "../services/PrismaUserService";
import { AuthServiceImplementation } from "../services/AuthServise";
import { RegisterServiceImplementation } from "../services/RegisterService";
import { LoginServiceImplementation } from "../services/LoginService";

const userService = new PrismaUserService();
const authService = new AuthServiceImplementation();
const registerService = new RegisterServiceImplementation();
const loginService = new LoginServiceImplementation();

export async function registerController(req: Request, res:Response) {
    console.log("register endpoint")
    try {
        const user = await registerUser({
            dependencies: { registerService, userService, authService },
            payload: {
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role
                }
            }
        })
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ error: error.message})
    }
}

export async function loginController(req: Request, res: Response) {
    try {
        const user = await loginUser({
            dependencies: { userService, authService },
            payload: {
                data: {
                    email: req.body.email,
                    password: req.body.password
                }
            }
        })

        const token = await authService.generateToken(user.id, user.role);
        console.log(token);
        res.status(200).json({ token, user });
    } catch (error: any) {
        res.status(401).json({ error: error.message})
    }
}
