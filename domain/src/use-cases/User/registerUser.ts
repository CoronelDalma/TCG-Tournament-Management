import { NewUser } from "../../entities";
import { UserService } from "../../services/User/UserService";

interface RegisterUserData {
    dependencies: { userService: UserService },
    payload: {data: NewUser}
}

export async function registerUser({dependencies, payload}: RegisterUserData) {
    const { userService } = dependencies;
    const { email, name, passwordHash, role } = payload.data;
    if (!email || !email.includes('@')) {
        throw new Error('Invalid email format');
    }

    const result = await userService.getByEmail(payload.data.email!);
    if (result) {
        throw new Error('User with this email already exists');
    }
    return userService.register(payload.data);
}