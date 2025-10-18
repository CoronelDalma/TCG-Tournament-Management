import { User, NewUser } from "../../entities";
export interface UserService {
    getByEmail(email: string): Promise<User | null>;
    getById(userId: string): Promise<User | null>;
    getUserRole(userId: string): Promise<string | null>;
    createUser(userData: NewUser): Promise<User>;
    update(userId: string, updateData: Partial<User>): Promise<User>;
    delete(userId: string): Promise<void>;
}