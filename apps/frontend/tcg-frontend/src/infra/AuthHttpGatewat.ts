import { UserRole, type UserWithoutHash } from "domain/src";

export class ApiError extends Error {
    status: number;
    responseBody: unknown;
    constructor(message: string, status: number, responseBody: unknown = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.responseBody = responseBody;
    }
}

// Tipo de error genérico para el bloque catch
export type UnknownError = Error | { message?: string };
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// helper
const apiRequest = async <T = unknown>(url: string, method: HttpMethod, data: unknown = null ): Promise<T> => {
    console.log(`API Request - URL: ${url}, Method: ${method}, Data:`, data);
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('authToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };
    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        let responseData: unknown = {};
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (!response.ok) {
            const errorMessage = (responseData as UnknownError).message || `Error del servidor: ${response.statusText}`;
            throw new ApiError(errorMessage, response.status, responseData);
        }

        return responseData as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new Error('Error de red o inesperado');
        }
    }
}

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
        //return mockApiCall('login', { email, password });
        const data = await apiRequest<{ token?: string; user?: UserWithoutHash }>('/api/auth/login', 'POST', { email, password });
        // data contiene token. necesito el user también
        if (data?.token) {
            localStorage.setItem('authToken', data.token);
        }
        
        console.log('Login response data AuthHttpGetawat:', data);
        return {token:data.token, user:data.user};
    },
    async register(name: string, email: string, password: string, role: UserRole) {
        //return mockApiCall('register', { name, email, password, role });
        await apiRequest('/api/auth/register', 'POST', { name, email, password, role });
    }
};