import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NewUser, UserRole, registerUser } from '../../../../domain/dist'
import { userServiceMock } from './mocks/backendUserServiceMock'
import { backendRegisterServiceMock } from './mocks/backendRegisterServiceMock';

const newUserPayload: NewUser = {
    name: "Test user",
    email: "testUser@email.com",
    passwordHash: "hashedpassword",
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
                userService: userServiceMock 
            },
            payload: { data: newUserPayload }
        });

        expect(result).toHaveProperty("id", "mock-new-user-id-123");
        expect(result).toHaveProperty("email", newUserPayload.email);

        expect(backendRegisterServiceMock.register).toHaveBeenCalledTimes(1);
        expect(backendRegisterServiceMock.register).toHaveBeenCalledWith(newUserPayload);
    })

})


