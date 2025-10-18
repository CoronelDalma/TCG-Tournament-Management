import { User, NewUser } from '../../entities';
import { userMock } from '../../entities/mocks/user-mock';
import { existingUsers } from '../../entities/mocks/user-mock';

export const UserServiceMock = {
        getByEmail: async (email: string) => {
            // Simulate fetching user by email
            console.log('Mock getByEmail called with:', email);
            console.log('Existing users:', existingUsers);
            return existingUsers.find(user => user.email === email) || null;
        },
        // register: async (userData: NewUser) => {
        //     // Simulate user registration logic
        //     if (!userData.email || !userData.name || !userData.passwordHash || !userData.role) {
        //         throw new Error('Missing required user data');
        //     }
        //     if (!userData.email || !userData.email.includes('@')) {
        //         throw new Error('Invalid email format');
        //     }

        //     const existingUser = await userServiceMock.getByEmail(userData.email);
        //     if (existingUser) {
        //         throw new Error('User with this email already exists');
        //     } else {
        //             const newUser = userMock(userData as User);
        //             existingUsers.push(newUser);
        //             return newUser;
        //     }
        // },
        getById: async (id: string) => {
            // Simulate fetching user by id
            return existingUsers.find(user => user.id === id) || null;
        },
        getUserRole: async (id: string) => {
            const user = existingUsers.find(user => user.id === id);
            return user ? user.role : null;
        },
        createUser: async (userData: NewUser) => {
            const newUser = userMock(userData as User); 
            existingUsers.push(newUser);
            return newUser;
        },
        // update: async (userId: string, updateData: Partial<User>) => {
        //     const userIndex = existingUsers.findIndex(user => user.id === userId);  
        //     if (userIndex === -1) {
        //         throw new Error('User not found');
        //     }   
        //     const updatedUser = { ...existingUsers[userIndex], ...updateData };
        //     existingUsers[userIndex] = updatedUser;
        //     return updatedUser;
        // },
        delete: async (userId: string) => {
            const userIndex = existingUsers.findIndex(user => user.id === userId);  
            if (userIndex === -1) {
                throw new Error('User not found');
            }   
            existingUsers.splice(userIndex, 1);
        }

    }