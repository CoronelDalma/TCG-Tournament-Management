import { NewUser, RegisterUserService, User } from "domain/src";

export class RegisterServiceImplementation implements RegisterUserService {
    register(userData: NewUser): Promise<User> {
        throw new Error("Method not implemented.");
    }

}