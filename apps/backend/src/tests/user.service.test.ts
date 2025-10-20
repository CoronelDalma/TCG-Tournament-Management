import { PrismaClient } from "@prisma/client";
import { UserRole, User } from "domain/entities";
import { PrismaUserService } from "src/services/PrismaUserService";
import { describe, test, expect, beforeEach, beforeAll, afterAll} from "vitest";

const prisma = new PrismaClient();
const userService = new PrismaUserService();

const newUser = {
    name: "Dalma",
    email: "dalma@email.com",
    passwordHash: "hashed123", // problemas con el nombre
    role: "player" as UserRole
};
export function newUserMock(opts?: Partial<Omit<User, 'id'>>): Omit<User, 'id'> {
    return {
        ...newUser,
        ...opts,
    };
}

describe ("PrismaUserService", () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("create and retrieve user by email", async () => {
        const created = await userService.createUser(newUser);
        expect(created).toHaveProperty("id");

        const found = await userService.getByEmail(newUser.email);
        expect(found?.email).toBe(newUser.email);
    });

    test("do not create user without email",async () => {
        const created = await userService.createUser(newUserMock({ email: "e"}));
        console.log(created);
        expect(created).toHaveProperty("id");

        const found = await userService.getByEmail(newUser.email);
        expect(found?.email).toBe(newUser.email);
    })
})