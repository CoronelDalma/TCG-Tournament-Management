import type { UserRole, UserWithoutHash } from "domain/src";

export interface UserData {
    user: UserWithoutHash;
    token: string; //avatar, etc pueden agregarse después
}

export interface IAuthUseCases {
    executeLogin: (email: string, password: string) => Promise<UserData>;
    executeRegister: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}