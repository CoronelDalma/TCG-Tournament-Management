import { NewUser, RegisterUserRequest } from "../../entities";
import { AuthService } from "../../services";
import { RegisterUserService } from "../../services/User/RegisterUserService";
import { UserService } from "../../services/User/UserService";

interface RegisterUserData {
    dependencies: { registerService: RegisterUserService, userService: UserService, authService: AuthService },
    payload: {data: RegisterUserRequest}
}

export async function registerUser({dependencies, payload}: RegisterUserData) {
    const { registerService, userService, authService } = dependencies;
    const { name, email, password, role } = payload.data;

    if (!email || !email.includes('@')) {
        throw new Error('Invalid email format');
    }

    if (!email || !password) {
        throw new Error("'Missing required user data'");
    }

    const result = await userService.getByEmail(payload.data.email!);
    if (result) {
        throw new Error('User with this email already exists');
    }

    const passwordHash = await authService.hashPassword(password);
    const newUserForService: NewUser = {
        name,
        email,
        passwordHash, 
        role
    };
    return registerService.register(newUserForService);
}