import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateUser } from './updateUser';
import { User } from '../../entities';
import { UserServiceMock } from '../../services/mocks/UserServiceMock';
import { existingUsers, resetExistingUsers } from '../../entities/mocks/user-mock';

const userId = 'user-1';
const updateData = { id: userId, name: 'New Name', email: 'new@test.com' };

beforeEach(() => {
    vi.clearAllMocks();
    resetExistingUsers();
});

describe('UpdateUserUseCase', () => {
    const userService = UserServiceMock;

    test('should successfully update the user data', async () => {
        const result = await updateUser({
            dependencies: { userService },
            payload: { data: updateData}
        });

        // ASSERT
        expect(result.email).toEqual(updateData.email)
        expect(result.id).toEqual(userId);
        expect(result.name).toEqual(updateData.name);
    });

    test('should throw an error if the user to update is not found', async () => {
        const result = updateUser({
            dependencies: { userService },
            payload: { data: {id: "no", email:"nuevo@emauil.com"}}
        });

        // ASSERT
        expect(result).rejects.toThrow("User not found")
    });

});