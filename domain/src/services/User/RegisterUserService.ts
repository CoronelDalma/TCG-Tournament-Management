import { User, NewUser } from "../../entities";

export interface RegisterUserService {
    register(userData: NewUser): Promise<User>;
}