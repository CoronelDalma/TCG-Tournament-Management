import type { Entity } from '../utils/types/entity';

export  const UserRole = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    PLAYER: 'player',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User extends Entity {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}

export type NewUser = Omit<User, 'id'>;

export type LoginCredentials = {
    email: string;
    password: string;
};
