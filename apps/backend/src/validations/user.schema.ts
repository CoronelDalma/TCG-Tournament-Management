import { z } from 'zod';
import {UserRole} from 'domain/src'

//const roleValues = Object.values(UserRole) as [UserRole, ...UserRole[]];
const roleValues = ['admin', 'organizer', 'player'] as const;
const roleValues2 = ['ADMIN', 'ORGANIZER', 'PLAYER'] as const;

export const UserSchema = z.object({
    id: z.uuid(),
    name: z.string().min(3),
    email: z.email(),
    passwordHash: z.string().min(8),
    role: z.enum(roleValues)
});