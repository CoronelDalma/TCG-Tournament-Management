import { z } from 'zod';
import {UserRole} from 'domain/src/entities/User'

const roleValues = Object.values(UserRole) as [UserRole, ...UserRole[]];

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3),
    email: z.email(),
    passwordHash: z.string().min(8),
    role: z.enum(roleValues)
});