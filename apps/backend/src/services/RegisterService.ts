import { NewUser, RegisterUserService, User } from "domain/src";
import { PrismaClient } from "@prisma/client";
import { PrismaUserService } from "./PrismaUserService";
import { AuthServiceImplementation } from "./AuthServise";

const prisma = new PrismaClient();
const userService = new PrismaUserService();
const authService = new AuthServiceImplementation();

export class RegisterServiceImplementation implements RegisterUserService {
    async register(userData: NewUser): Promise<User> {
        console.log("registrando usuario");
        const existingUser = await userService.getByEmail(userData.email);

        if (existingUser) {
            throw new Error("Ya existe un usuario registrado con ese email");
        }

        const passwordHash = await authService.hashPassword(userData.passwordHash);

        console.log(passwordHash);
        const createdUser = userService.createUser(userData);
        console.log(createdUser);

        return createdUser;
    }
}