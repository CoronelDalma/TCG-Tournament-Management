import { PrismaClient, Prisma} from "@prisma/client";
import { UserRole, UserService } from "domain/src";
import { NewUser, User } from "domain/src"
import { UserSchema } from "../validations/user.schema";

const prisma = new PrismaClient();

type PrismaUserType = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: string;
}; 
function mapPrismaUserToDomain(prismaUser: PrismaUserType): User {
    return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        passwordHash: prismaUser.passwordHash,
        role: prismaUser.role as UserRole, 
    };
}

export class PrismaUserService implements UserService {
    async getByEmail(email: string): Promise<User | null> {
        const prismaUser = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, passwordHash: true, role: true }});
        if (!prismaUser) return null;
        return mapPrismaUserToDomain(prismaUser);
    }

    async getById(id: string): Promise<User | null> {
        const prismaUser = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, passwordHash: true, role: true }});
        if (!prismaUser) return null;
        return mapPrismaUserToDomain(prismaUser);
    }

    getUserRole(userId: string): Promise<string | null> {
        throw new Error("Method not implemented get User role.");
    }

    async createUser(data: NewUser): Promise<User> {
        const validationSchema = UserSchema.omit({ id: true });
        const validation = validationSchema.safeParse(data);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => 
                `Field '${issue.path.join('.')}' is invalid: ${issue.message}`).join(';');
            
            throw new Error(`Usuario con datos invalidos: ${errorMessages}`);
        }

        const prismaData: Prisma.UserCreateInput = {
            ...data,
            role: data.role as any, 
        }
            const createdPrismaUser = await prisma.user.create({ 
            data: prismaData,
            select: { id: true, name: true, email: true, passwordHash: true, role: true }
        });
        
        return mapPrismaUserToDomain(createdPrismaUser as PrismaUserType);
    }

    async update(id: string, data: Partial<User>): Promise<User> {

        const prismaUpdateData: Prisma.UserUpdateInput = {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
            ...(data.role !== undefined && { role: data.role as any }), // 'as any' para ajustar al enum de Prisma

        };

        const updatedPrismaUser = await prisma.user.update({ 
            where: { id }, 
            data: prismaUpdateData,
            select: { id: true, name: true, email: true, passwordHash: true, role: true }
        });
        
        return mapPrismaUserToDomain(updatedPrismaUser as PrismaUserType);

    }
    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: {id}});
        return undefined;
    }
    
}