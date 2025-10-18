import { User, NewUser } from '../../entities';
import { userMock } from '../../entities/mocks/user-mock';
import { existingUsers } from '../../entities/mocks/user-mock';

export const userServiceMock = {
        getByEmail: async (email: string) => {
            // Simulate fetching user by email
            console.log('Mock getByEmail called with:', email);
            console.log('Existing users:', existingUsers);
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

            const existingUser = await userServiceMock.getByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            } else {
                    const newUser = userMock(userData as User);
                    existingUsers.push(newUser);
                    return newUser;
            }
        },
    }