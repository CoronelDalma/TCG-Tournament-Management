import { UserRole, User, RegisterUserRequest } from '../User';

export let existingUsers: User[] = [];

export function resetExistingUsers() {
    existingUsers.length = 0;
    existingUsers.push(
        {
        id: 'user-1',
        name: 'Alice Admin',
        email: 'admin@email.com',
        passwordHash: 'hashedAdmin',
        role: UserRole.ADMIN
        },
        {
        id: 'user-2',
        name: 'Oscar Organizer',
        email: 'organizer@email.com',
        passwordHash: 'hashedOrganizer',
        role: UserRole.ORGANIZER
        },
        {
        id: 'user-3',
        name: 'Peter Player',
        email: 'player@email.com',
        passwordHash: 'hashedPlayer',
        role: UserRole.PLAYER
        }
    );
}

const validUser = {
    name: 'Mock User',
    email: 'valid@email.com',
    passwordHash: 'hashedpassword',
    role: UserRole.PLAYER,
}

export function userMock(opts?: User): User {
    return {
        id: 'user-' + (existingUsers.length + 1),
        ...validUser,
        ...opts,
    };
}

export function newUserMock(opts?: Partial<RegisterUserRequest>): RegisterUserRequest {
    return {
        name: 'Mock User',
        email: 'valid@email.com',
        password: 'hashedpassword',
        role: UserRole.PLAYER,
        ...opts,
    };
}

// Login user credentials mock
const validCredentialsMock = {
    email: 'admin@email.com',
    password: 'passAdmin',
}
export function loginCredentialsMock(opts?: Partial<{email: string; password: string}>): {email: string; password: string} {
    return {
        ...validCredentialsMock,
        ...opts,
    };
}
