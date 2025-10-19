import { PrismaClient } from "@prisma/client";
import { UserService } from "domain/src";
import { NewUser, User } from "domain/src"

const prisma = new PrismaClient();

export class PrismaUserService implements UserService {
    getByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email }}) as Promise<User | null>;
    }
    getById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id }}) as Promise<User | null>;
    }
    getUserRole(userId: string): Promise<string | null> {
        throw new Error("Method not implemented.");
    }
    createUser(data: NewUser): Promise<User> {
        return prisma.user.create({ data }) as Promise<User>;
    }
    update(id: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({ where: {id}, data}) as Promise<User>;
    }
    delete(id: string): Promise<void> {
        return prisma.user.delete({ where: {id}}) as unknown as Promise<void>;
    }
    
}