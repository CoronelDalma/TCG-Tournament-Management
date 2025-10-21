import { NewUser, RegisterUserService, User } from "domain/src";
import { PrismaClient } from "@prisma/client";
import { PrismaUserService } from "./PrismaUserService";
import { AuthServiceImplementation } from "./AuthServise";
import { RegisterUserRequest } from "domain/dist";

const prisma = new PrismaClient();
const userService = new PrismaUserService();
const authService = new AuthServiceImplementation();

export class RegisterServiceImplementation implements RegisterUserService {
    async register(userData: RegisterUserRequest): Promise<User> {
        const existingUser = await userService.getByEmail(userData.email);

        if (existingUser) {
            throw new Error("Ya existe un usuario registrado con ese email");
        }

        const passwordHash = await authService.hashPassword(userData.password);
        const newUser: NewUser = {
            name: userData.name,
            email: userData.email,
            passwordHash: passwordHash,
            role: userData.role
        };
        const createdUser = userService.createUser(newUser);

        return createdUser;
    }
}