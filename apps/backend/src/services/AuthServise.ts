import { AuthService } from "domain/src";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthServiceImplementation implements AuthService {
    secret = process.env.JWT_SECRET;

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
    async comparePassword(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
    async generateToken(userId: string, role: string): Promise<string> {
        if (!this.secret) throw new Error("JWT_SECRET no está definido");
        return jwt.sign({id: userId, role}, process.env.JWT_SECRET!, { expiresIn: "1h"})
    }
}