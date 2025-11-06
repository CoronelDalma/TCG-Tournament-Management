import { UserRole, type UserWithoutHash } from "domain/src";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Tipo de error genérico para el bloque catch
export type UnknownError = Error | { message?: string };

export const mockApiCall = async (endpoint: string, data: Partial<UserWithoutHash> & { password?: string }) => {
    // Simula latencia de red
    await new Promise(resolve => setTimeout(resolve, 1200)); 

    if (endpoint === 'login') {
        const mockUsers = [
            { email: 'admin@test.com', role: UserRole.ADMIN, name: 'Administrador' },
            { email: 'user@test.com', role: UserRole.PLAYER, name: 'Usuario Standard' },
            { email: 'org@test.com', role: UserRole.ORGANIZER, name: 'Organizador' }
        ];

        const mockUser = mockUsers.find(u => u.email === data.email && data.password === '1234');
        
        if (mockUser) {
            return {
                token: `mock_jwt_${mockUser.role}_token`,
                user: { id: 'u' + Math.random().toString(36).substring(2, 9), ...mockUser, email: data.email },
            };
        }
        throw new ApiError('Credenciales de inicio de sesión inválidas.', 401);
    }

    if (endpoint === 'register') {
        if (data.email === 'exists@test.com') {
            throw new ApiError('El correo electrónico ya está en uso.', 400);
        }
        console.log(`Registro exitoso: ${data.name}, Rol: ${data.role}`);
        return { message: 'User registered successfully' };
    }

    throw new ApiError('Endpoint no encontrado', 404);
};


export const AuthHttpGateway = {
    async login(email: string, password: string) {
        return mockApiCall('login', { email, password });
    },
    async register(name: string, email: string, password: string, role: UserRole) {
        return mockApiCall('register', { name, email, password, role });
    }
};