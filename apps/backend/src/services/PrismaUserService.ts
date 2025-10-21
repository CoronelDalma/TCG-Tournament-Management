import { PrismaClient } from "@prisma/client";
import { UserService } from "domain/src";
import { NewUser, User } from "domain/src"
import { UserSchema } from "../validations/user.schema";

const prisma = new PrismaClient();

export class PrismaUserService implements UserService {
    getByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email }}) as Promise<User | null>;
    }
    getById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id }}) as Promise<User | null>;
    }
    getUserRole(userId: string): Promise<string | null> {
        throw new Error("Method not implemented get User role.");
    }
    createUser(data: NewUser): Promise<User> {
        const validationSchema = UserSchema.omit({ id: true });
        const validation = validationSchema.safeParse(data);

        if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => 
                `Field '${issue.path.join('.')}' is invalid: ${issue.message}`).join(';');
            
                throw new Error(`Usuario con datos invalidos: ${errorMessages}`);
        }

        return prisma.user.create({ data }) as Promise<User>;
    }
    update(id: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({ where: {id}, data}) as Promise<User>;
    }
    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: {id}});
        return undefined;
    }
    
}