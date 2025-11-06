import type { Entity } from '../utils/types/entity';

export  const UserRole = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    PLAYER: 'player',
    GUEST: 'guest',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User extends Entity {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}

export type UserWithoutHash = Omit<User, 'passwordHash'>;

export type NewUser = Omit<User, 'id'>;

export type RegisterUserRequest = Omit<NewUser, 'passwordHash'> & {
    password: string;
};

export type LoginCredentials = {
    email: string;
    password: string;
};
