import { RegisterUserRequest } from "domain/src/entities";
import { RegisterUserService, User, NewUser, UserRole } from "domain/src";
import { vi } from "vitest";

export const backendRegisterServiceMock: RegisterUserService = {
    // Usamos vi.fn() para que la función sea rastreable
    register: vi.fn((userData: RegisterUserRequest): Promise<User> => {
        const mockUser: User = {
            id: "mock-new-user-id-123",
            name: userData.name,
            email: userData.email,
            passwordHash: "hashedpassword",
            role: userData.role
        };
        
        return Promise.resolve(mockUser);
    }),
};