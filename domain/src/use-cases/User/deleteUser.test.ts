// domain/tests/use-cases/deleteUser.test.ts

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { deleteUser } from './deleteUser';
import { User } from '../../entities';
import { UserServiceMock } from '../../services/mocks/UserServiceMock';
import { existingUsers, resetExistingUsers } from '../../entities/mocks/user-mock';

const userId = 'user-to-delete';
const existingUser: User = { id: userId, name: '...', email: '...', passwordHash: 'hash', role: 'player' };

beforeEach(() => {
    vi.clearAllMocks();
    resetExistingUsers();
});

describe('DeleteUserUseCase', () => {
    const userService = UserServiceMock;

    test('should throw an error if the user to delete is not found', async () => {
        expect(existingUsers.length).toEqual(3);

        const result = deleteUser({
            dependencies: { userService },
            payload: { data: {id: userId}}
        });
        expect(result).rejects.toThrow("User not found");
        expect(existingUsers.length).toEqual(3);
    });

    test('should successfully delete an existing user', async () => {
        expect(existingUsers.length).toEqual(3);


        deleteUser({
            dependencies: { userService },
            payload: { data: {id: "user-2"}}
        });

        expect(existingUsers.length).toEqual(2);
    });
});