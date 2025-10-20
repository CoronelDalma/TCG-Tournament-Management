import { LoginService } from '../../services/User/LoginService';
import { AuthService } from '../../services';
import { LoginCredentials } from '../../entities';  


interface AuthUserData {
    dependencies: { loginService:LoginService, authService: AuthService },
    payload: { data: LoginCredentials }
}

export async function loginUser({dependencies, payload}: AuthUserData) {
    const { loginService, authService } = dependencies;

    try {
        const user = await loginService.login(payload.data);

        const token = await authService.generateToken(user.id, user.role);
        return { user, token };
    } catch (error: any) {
        throw new Error(`Login failed: ${error.message}`);
    }

}