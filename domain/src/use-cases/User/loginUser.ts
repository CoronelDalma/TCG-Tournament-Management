import { AuthService, UserService } from '../../services';
import { LoginCredentials } from '../../entities';  


interface LoginUserData {
    dependencies: { userService: UserService, authService: AuthService },
    payload: { data: LoginCredentials }
}

export async function loginUser({dependencies, payload}: LoginUserData) {
    const { userService, authService } = dependencies;
    const { email, password} = payload.data;

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await userService.getByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials'); 
    }

    const isValid = await authService.comparePassword(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Incorrect password');
    }

    const { passwordHash, ...userWithoutHash } = user;
    
    return userWithoutHash;
}