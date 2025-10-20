import { User, NewUser } from '../../entities';
import { userMock } from '../../entities/mocks/user-mock';
import { existingUsers } from '../../entities/mocks/user-mock';

export const UserServiceMock = {
        getByEmail: async (email: string) => {
            // Simulate fetching user by email
            return existingUsers.find(user => user.email === email) || null;
        },
        getById: async (id: string) => {
            // Simulate fetching user by id
            return existingUsers.find(user => user.id === id) || null;
        },
        getUserRole: async (id: string) => {
            const user = existingUsers.find(user => user.id === id);
            return user ? user.role : null;
        },
        createUser: async (userData: NewUser) => {
            // todo validaciones
            const newUser = userMock(userData as User); 
            existingUsers.push(newUser);
            return newUser;
        },
        update: async (userId: string, updateData: Partial<User>) => {
            const userIndex = existingUsers.findIndex(user => user.id === userId);  
            if (userIndex === -1) {
                throw new Error('User not found');
            }   
            const updatedUser = { ...existingUsers[userIndex], ...updateData } as User;
            existingUsers[userIndex] = updatedUser;
            return updatedUser;
        },
        delete: async (userId: string) => {
            const userIndex = existingUsers.findIndex(user => user.id === userId);  
            if (userIndex === -1) {
                throw new Error('User not found');
            }   
            existingUsers.splice(userIndex, 1);
        }

    }