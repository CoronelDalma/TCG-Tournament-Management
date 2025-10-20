import { User, RegisterUserRequest } from "../../entities";

export interface RegisterUserService {
    register(userData: RegisterUserRequest): Promise<User>;
}