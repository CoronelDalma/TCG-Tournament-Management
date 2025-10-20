import { describe, test, expect, vi, beforeEach } from 'vitest'
import { UserRole, registerUser } from 'domain/src'
import { userServiceMock } from './mocks/backendUserServiceMock'
import { backendRegisterServiceMock } from './mocks/backendRegisterServiceMock';
import { RegisterUserRequest, User } from 'domain/entities';
import { backendAuthServiceMock } from './mocks/backendAuthService';

const newUserPayload: RegisterUserRequest = {
    name: "Test user",
    email: "testUser@email.com",
    password: "password",
    role: UserRole.ORGANIZER
};

describe("Domain module integration", async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    test("should use RegisterUserService.register when creating a new user", async () => {
        const result = await registerUser({
            dependencies: { 
                registerService: backendRegisterServiceMock, 
                userService: userServiceMock,
                authService: backendAuthServiceMock 
            },
            payload: { data: newUserPayload }
        });

        expect(result).toHaveProperty("id", "mock-new-user-id-123");
        expect(result).toHaveProperty("email", newUserPayload.email);

        expect(backendRegisterServiceMock.register).toHaveBeenCalledTimes(1);
        expect(backendRegisterServiceMock.register).toHaveBeenCalledWith(newUserPayload);
    })

})


