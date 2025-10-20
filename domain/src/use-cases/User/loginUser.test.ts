import { describe, test, expect, beforeEach } from 'vitest';
import {  resetExistingUsers, loginCredentialsMock } from '../../entities/mocks/user-mock';
import { loginUser } from './loginUser';
import { AuthServiceMock } from '../../services/mocks/AuthServiceMock';
import { UserServiceMock } from '../../services/mocks/UserServiceMock';

beforeEach(() => {
    resetExistingUsers();
})

describe('LoginUser', async () => {
    const userService = UserServiceMock;
    const authService = AuthServiceMock;

    test('should login a user successfully with correct credentials', async () => {
        const result = await loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock() }
        });
        expect(result).toHaveProperty('id');
    });

    test('should fail login with invalid email', async () => {
        const result = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock({ email: 'noRegistered@email' })}
        });
        await expect(result).rejects.toThrow('Invalid credentials');
    });

    test('should fail login with incorrect password', async () => {
        const result = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock({ password: 'wrongPassword' })}
        });
        await expect(result).rejects.toThrow('Incorrect password');
    });
    
    test('should fail login with empty email', async () => {
        const result = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock({ email: '' })}
        });
        await expect(result).rejects.toThrow('Email and password are required');
    });

    test('should fail login with empty password', async () => {
        const result = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock({ password: '' })}
        });
        await expect(result).rejects.toThrow('Email and password are required');
    });

    test('different users should login correctly', async () => {
        const adminLogin = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock()}
        });
        await expect(adminLogin).resolves.toHaveProperty('id');
        const playerLogin = loginUser({
            dependencies: { userService, authService },
            payload: { data: loginCredentialsMock({ email: 'player@email.com', password: 'passPlayer' })}
        });
        await expect(playerLogin).resolves.toHaveProperty('id');
    });
})