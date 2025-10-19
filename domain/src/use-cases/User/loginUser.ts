import { UserService } from '../../services/User/UserService';
import { AuthService } from '../../services/User/AuthService';
import { LoginCredentials } from '../../entities';  


interface AuthUserData {
    dependencies: { userService: UserService, authService: AuthService },
    payload: { data: LoginCredentials }
}

export async function loginUser({dependencies, payload}: AuthUserData) {
    const { userService, authService } = dependencies;
    const { email, password } = payload.data;
 
    const user = await userService.getByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await authService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const token = await authService.generateToken(user.id, user.role);
    return { user, token };
}