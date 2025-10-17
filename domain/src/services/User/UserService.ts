import { User, NewUser } from "../../entities";
export interface UserService {
    register(userData: NewUser): Promise<User>;
    getByEmail(email: string): Promise<User | null>;
}