import { NewUser, UserService, User, UserRole } from "../../../../../domain/dist";
import { vi } from "vitest";

export const userServiceMock: UserService = {
    createUser: vi.fn(async (user: NewUser) => {
        return { ...user, id: "mocked-id" } as User;
    }),
    getByEmail: vi.fn(async (email: string) => {
        if (email === "test@email.com") {
            return {
                id: "existing-user-id",
                name: "Existing User",
                email: "test@email.com",
                passwordHash: "hashedpassword",
                role: "player" as UserRole
            } as User;
        }   
        return null;
    }),
    getById: vi.fn(async (id: string) => {
        if (id === "existing-user-id") {    
            return {
                id: "existing-user-id",
                name: "Existing User",
                email: "eee",
                passwordHash: "hashedpassword",
                role: "player" as UserRole
            } as User;
        }   
        return null;
    }),
    getUserRole: vi.fn(async (id: string) => {
        if (id === "existing-user-id") {    
            return "player";
            }; 
        return null;
    }),
    delete: vi.fn(async (id: string) => {
        
    })
}
