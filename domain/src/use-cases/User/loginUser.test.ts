import { describe, test, expect, beforeEach } from 'vitest';
import {  resetExistingUsers, loginCredentialsMock } from '../../entities/mocks/user-mock';
import { loginUser } from './loginUser';
import { AuthServiceMock } from '../../services/mocks/AuthServiceMock';
import { LoginServiceMock } from '../../services/mocks/LoginServiceMock';

beforeEach(() => {
    resetExistingUsers();
})

describe('LoginUser', async () => {
    const loginService = LoginServiceMock;
    const authService = AuthServiceMock;

    test('should login a user successfully with correct credentials', async () => {
        const result = await loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock() }
        });
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('token');
    });

    test('should fail login with invalid email', async () => {
        const result = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock({ email: 'noRegistered@email' })}
        });
        expect(result).rejects.toThrow('User not found');
    });

    test('should fail login with incorrect password', async () => {
        const result = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock({ password: 'wrongPassword' })}
        });
        expect(result).rejects.toThrow('Login failed: Incorrect password');
    });
    
    test('should fail login with empty email', async () => {
        const result = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock({ email: '' })}
        });
        expect(result).rejects.toThrow('User not found');
    });

    test('should fail login with empty password', async () => {
        const result = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock({ password: '' })}
        });
        expect(result).rejects.toThrow('Login failed: Incorrect password');
    });

    test('different users should login correctly', async () => {
        const adminLogin = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock()}
        });
        expect(adminLogin).resolves.toHaveProperty('token');
        const playerLogin = loginUser({
            dependencies: { loginService, authService },
            payload: { data: loginCredentialsMock({ email: 'player@email.com', password: 'passPlayer' })}
        });
        expect(playerLogin).resolves.toHaveProperty('token');
    });
})