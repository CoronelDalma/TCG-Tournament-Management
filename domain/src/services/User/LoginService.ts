import { User, LoginCredentials } from "../../entities";

export interface LoginService {
    login(credentials: LoginCredentials): Promise<User>;
}