import { RegisterUserService, User, NewUser, UserRole } from "../../../../../domain/dist";
import { vi } from "vitest";

export const backendRegisterServiceMock: RegisterUserService = {
    // Usamos vi.fn() para que la función sea rastreable
    register: vi.fn((userData: NewUser): Promise<User> => {
        // Simulamos el comportamiento exitoso del registro:
        // Añadimos un ID simulado (lo que haría la DB) y un rol (si no viene en NewUser)
        
        // Creamos un objeto User completo a partir de NewUser
        const mockUser: User = {
            ...userData,
            id: "mock-new-user-id-123", // El servicio real generaría un ID
            role: "player" // Asume un rol por defecto
        };
        
        return Promise.resolve(mockUser);
    }),
};