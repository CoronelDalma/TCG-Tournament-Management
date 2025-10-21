import { UserRole } from 'domain/src';
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: UserRole
}

export function AuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication token missing or invalid format.' });
    }

    const token = authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, role: UserRole, iat: number, exp: number};

            req.userId = decoded.id;
            req.userRole = decoded.role;

            next();
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
    } else {
        res.status(401).json({ error: 'No token.' });
    }

}