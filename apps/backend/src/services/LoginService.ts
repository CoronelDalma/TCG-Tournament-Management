import { LoginCredentials, LoginService, User } from "domain/src";

export class LoginServiceImplementation implements LoginService {
    login(credentials: LoginCredentials): Promise<User> {
        throw new Error("Method not implemented.");
    }
    
}