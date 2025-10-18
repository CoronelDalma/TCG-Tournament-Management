import { NewUser } from "../../entities";
import { RegisterUserService } from "../../services/User/RegisterUserService";
import { UserService } from "../../services/User/UserService";

interface RegisterUserData {
    dependencies: { registerService: RegisterUserService, userService: UserService },
    payload: {data: NewUser}
}

export async function registerUser({dependencies, payload}: RegisterUserData) {
    const { registerService, userService } = dependencies;
    const { email, name, passwordHash, role } = payload.data;

    if (!email || !email.includes('@')) {
        throw new Error('Invalid email format');
    }

    const result = await userService.getByEmail(payload.data.email!);
    if (result) {
        throw new Error('User with this email already exists');
    }
    return registerService.register(payload.data);
}