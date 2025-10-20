import { User, NewUser, RegisterUserRequest } from '../../entities';
import { userMock } from '../../entities/mocks/user-mock';
import { existingUsers } from '../../entities/mocks/user-mock';
import { RegisterUserService } from '../User/RegisterUserService';
import { UserServiceMock } from './UserServiceMock';

export const RegisterUserServiceMock = {
    register: async (userData: RegisterUserRequest) => {
        // Simulate user registration logic
        if (!userData.email || !userData.name || !userData.password || !userData.role) {
            throw new Error('Missing required user data');
        }
        if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Invalid email format');
        }

        const existingUser = await UserServiceMock.getByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        } else {
            const { password, ...dataWithoutPassword } = userData;

            const newUser = userMock({
                ...dataWithoutPassword, passwordHash: "hashedpassword-hashed",
                id: (existingUsers.length+1).toString()
            });
            existingUsers.push(newUser);
            return newUser;
        }
    },
}