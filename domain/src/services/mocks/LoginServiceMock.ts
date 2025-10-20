import { User, NewUser, LoginCredentials } from '../../entities';
import { userMock } from '../../entities/mocks/user-mock';
import { existingUsers } from '../../entities/mocks/user-mock';
import { UserServiceMock } from './UserServiceMock';
import { AuthServiceMock } from './AuthServiceMock';

export const LoginServiceMock = {
    login: async (credentials: LoginCredentials) => {
        const { email, password } = credentials;

        const user = await UserServiceMock.getByEmail(email);
        if (!user) throw new Error("User not found");

        const valid = await AuthServiceMock.comparePassword(password, user.passwordHash);

        if (!valid) throw new Error("Incorrect password");

        return user;
    },
}