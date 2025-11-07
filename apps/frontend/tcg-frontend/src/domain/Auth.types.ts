import type { User, UserRole, UserWithoutHash } from "domain/src";

export interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    role: UserRole;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, password: string, email: string, role: UserRole) => Promise<void>;
    isLoading: boolean;
}

export interface IAuthUseCases {
    login: (email: string, password: string) => Promise<{ user: UserWithoutHash, token: string }>;
    register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}