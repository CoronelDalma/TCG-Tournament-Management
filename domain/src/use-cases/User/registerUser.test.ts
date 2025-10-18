import { describe, test, expect, beforeEach } from 'vitest';
import { registerUser } from './registerUser';
import { newUserMock, resetExistingUsers, existingUsers } from '../../entities/mocks/user-mock';
import { userServiceMock } from '../../services/mocks/UserServiceMock';

beforeEach(() => {
    resetExistingUsers();
})

describe('RegisterUser', async () => {
    const userService = userServiceMock;

    test('should register a new user successfully', async () => {
        const result = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock()}
        });
        expect(result).resolves.toHaveProperty('id');
    })

    test('should fail registration with invalid email', async () => {
        const result = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ email: 'invalidEmail' }) }
        });
        expect(result).rejects.toThrow('Invalid email format');
    })

    test('should fail registration with empty email', async () => {
        const result = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ email: '' }) }
        });
        expect(result).rejects.toThrow('Invalid email format');
    })

    test('should fail registration if email already exists', async () => {
        const result = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ email: 'player@email.com' }) }
        });
        expect(result).rejects.toThrow('User with this email already exists');
    })

    test('should fail registration with missing required fields', async () => {
        const result = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ name: '' }) }
        });
        expect(result).rejects.toThrow('Missing required user data');

        const result2 = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ passwordHash: '' }) }
        });
        expect(result2).rejects.toThrow('Missing required user data');

        const result3 = registerUser({
            dependencies: { userService },
            payload: { data: newUserMock({ role: '' as any }) }
        });
        expect(result3).rejects.toThrow('Missing required user data');
    })

    test('should add a new user with valid data', async () => {
        const newUserData = newUserMock();
        const result = await registerUser({
            dependencies: { userService },
            payload: { data: newUserData }
        });
        expect(result).toMatchObject(newUserData);
    })

    test('should add a new user to existing users list', async () => {
        const newUserData = newUserMock();
        const existingUsersCount = existingUsers.length;
        await registerUser({
            dependencies: { userService },
            payload: { data: newUserData }
        });
        const updatedUsersCount = existingUsers.length;
        expect(updatedUsersCount).toBe(existingUsersCount + 1);
    })

    test('should assign a unique id to the newly registered user', async () => {
        const newUserData = newUserMock();
        const result = await registerUser({
            dependencies: { userService },
            payload: { data: newUserData }
        });
        expect(result.id).toBeDefined();
        expect(result.id).not.toBe('');
    });

    test('should register multiple users with different emails successfully', async () => {
        const user1 = newUserMock({ email: 'newUser1@email.com' });
        const user2 = newUserMock({ email: 'newUser2@email.com' });

        const result1 = await registerUser({
            dependencies: { userService },
            payload: { data: user1 }
        });
        const result2 = await registerUser({
            dependencies: { userService },
            payload: { data: user2 }
        });

        expect(result1).toHaveProperty('id');
        expect(result2).toHaveProperty('id');
        expect(result1.email).toBe(user1.email);
        expect(result2.email).toBe(user2.email);
        expect(result1.id).not.toBe(result2.id);
    });

});
