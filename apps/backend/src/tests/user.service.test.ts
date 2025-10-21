import { PrismaClient } from "@prisma/client";
import { UserRole, User } from "domain/src";
import { PrismaUserService } from "src/services/PrismaUserService";
import { describe, test, expect, beforeEach, beforeAll, afterAll} from "vitest";

const prisma = new PrismaClient();
const userService = new PrismaUserService();

const newUser = {
    name: "Dalma",
    email: "dalma@email.com",
    passwordHash: "hashed123", 
    role: UserRole.PLAYER
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
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    });

    test("create and retrieve user by email", async () => {
        const created = await userService.createUser({
            name: "Dalma",
            email: "dalma@email.com",
            passwordHash: "hashed123", 
            role: "player"
        });
        
        expect(created).toHaveProperty("id");

        const found = await userService.getByEmail(newUser.email);
        expect(found?.email).toBe(newUser.email);
        expect(found?.id).toBe(created.id);
    });

    test("do not create user with invalid data (Zod validation fail)",async () => {
        const invalidUser = newUserMock({ 
            name:"da",
            email: "e", 
            passwordHash: "dfsdf", 
            role: "admin"
        });
        let throwingCall = () => userService.createUser(invalidUser);

        // 1. Aserción General: Verifica que rechaza con el mensaje principal
        await expect(throwingCall).rejects.toThrow(/Usuario con datos invalidos/);

        throwingCall = () => userService.createUser(invalidUser);
        await expect(throwingCall).rejects.toThrow(/Invalid email address/);
        
        // --- Si quieres verificar todas las fallas ---
        throwingCall = () => userService.createUser(invalidUser);
        await expect(throwingCall).rejects.toThrow(/Too small: expected string to have >=3 characters/ // Falla 'name'
        );
        await expect(throwingCall).rejects.toThrow(/expected string to have >=8 characters/)
    })

    test("dont create user without email", async () => {
        const invalidUser = newUserMock({ email: "e"});
        let throwingCall = () => userService.createUser(invalidUser);
        await expect(throwingCall).rejects.toThrow(/Usuario con datos invalidos/);
    })

    test("should retrieve a user by ID and return null if not found", async () => {
        const createdUser = await userService.createUser(newUserMock());
        const foundById = await userService.getById(createdUser.id);

        expect(foundById).not.toBeNull();
        expect(foundById?.id).toBe(createdUser.id);
        
        const notFound = await userService.getById('non-existent-uuid-12345');
        expect(notFound).toBeNull();
    })

    test("should fail to update a non-existent user", async () => {
        const nonExistentId = 'non-existent-id-for-update';
        const updatePayload = { name: "New Name" };

        const updateAttempt = userService.update(nonExistentId, updatePayload);
        
        await expect(updateAttempt).rejects.toThrow(); 
    });

    test("should update an existing user's data", async () => {
        const initialEmail = "to_be_updated@test.com";
        const initialUser = await userService.createUser(newUserMock({ 
            email: initialEmail, 
            name: "Old Name",
            passwordHash: "updatehash"
        }));


        const updatePayload = {
            name: "New Name",
            role: UserRole.ORGANIZER
        };
        
        const updatedUser = await userService.update(initialUser.id, updatePayload);
        
        expect(updatedUser).toHaveProperty('id', initialUser.id);
        expect(updatedUser.name).toBe(updatePayload.name);
        expect(updatedUser.role).toBe(updatePayload.role);

        expect(updatedUser.email).toBe(initialUser.email);
    });

    test("should delete a user successfully and confirm deletion", async () => {
        const userToDelete = await userService.createUser(newUserMock({ 
            email: "to_be_deleted@test.com", 
            passwordHash: "deletehash" 
        }));

        const deleteResult = userService.delete(userToDelete.id);
        await expect(deleteResult).resolves.toBeUndefined();

        const foundAfterDeletion = await userService.getById(userToDelete.id);
        expect(foundAfterDeletion).toBeNull();
    });

    test("should throw an error when deleting a non-existent user", async () => {
        const nonExistentId = 'non-existent-id-for-deleteA';

        const deleteAttempt = userService.delete(nonExistentId);

        await expect(deleteAttempt).rejects.toThrow(); 
    });
})