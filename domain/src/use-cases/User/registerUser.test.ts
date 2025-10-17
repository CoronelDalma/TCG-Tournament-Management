import { describe, test, expect, beforeEach } from 'vitest';
import { registerUser } from './registerUser';
import { newUserMock, userMock, getInitialUsers } from '../../entities/mocks/user-mock';
import { User, UserRole, NewUser } from '../../entities';

export let existingUsers: User[] = [];

beforeEach(() => {
    existingUsers = getInitialUsers();
})

describe('RegisterUser', async () => {
    // TODO sacar de aca el mock del service
    const userService = {
        getByEmail: async (email: string) => {
            // Simulate fetching user by email
            return existingUsers.find(user => user.email === email) || null;
        },
        register: async (userData: NewUser) => {
            // Simulate user registration logic
            if (!userData.email || !userData.name || !userData.passwordHash || !userData.role) {
                throw new Error('Missing required user data');
            }
            if (!userData.email || !userData.email.includes('@')) {
                throw new Error('Invalid email format');
            }

            const existingUser = await userService.getByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            } else {
                    const newUser = userMock(userData as User);
                    existingUsers.push(newUser);
                    return newUser;
            }
        },

    }

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

});
