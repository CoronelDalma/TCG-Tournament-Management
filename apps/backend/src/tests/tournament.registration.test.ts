import { vi, describe, test, expect, beforeEach, beforeAll, afterAll, afterEach} from "vitest"
import request from "supertest"
import app from "../server"
import { UserRole, TournamentStatus, User } from "domain/src";
import { PrismaClient } from "@prisma/client"
import { AuthServiceImplementation } from "../services/AuthServise";
import { PrismaUserService } from "src/services/PrismaUserService";

const urlTournament = "/api/tournaments";

const prisma = new PrismaClient();
const authService = new AuthServiceImplementation();
const userService = new PrismaUserService();

const ADMIN_CREDENTIALS = { email: 'admin_creator@test.com', password: 'secure_admin_pwd', role: UserRole.ADMIN };
const ORGANIZER_CREDENTIALS = { email: 'organizer_creator@test.com', password: 'secure_organizer_pwd', role: UserRole.ORGANIZER };
const PLAYER_CREDENTIALS = { email: 'player_creator@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_TWO_CREDENTIALS = { email: 'player_two@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_THREE_EMAIL = 'player_three@test.com'; // Email temporal

const BASE_TOURNAMENT_PAYLOAD = (organizerId: string) => ({
    name: "Weekly Standard Tournament",
    description: "Standard competitive event.",
    maxPlayers: 2,
    startDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
    format: "Standard",
    organizedId: organizerId
});

// FUNCIÓN DE RETRY: CRUCIAL para manejar fallos de sincronización de DB en E2E.
async function retryOperation<T>(operation: () => Promise<T>, maxAttempts: number = 3, delayMs: number = 200): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const isLastAttempt = attempt === maxAttempts;
            if (isLastAttempt) {
                console.error(`[RETRY FAIL] Falló después de ${maxAttempts} intentos.`);
                throw error;
            }
            console.warn(`[RETRY] Intento ${attempt}/${maxAttempts} fallido. Reintentando en ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("Retry function failed unexpectedly.");
}

describe("Tournament Endpoints (Creation & Registration)", () => {
    let adminToken: string;
    let playerOneToken: string;
    let playerTwoToken: string;
    let adminId: string;
    let organizerId: string;
    let playerOneId: string;
    let playerTwoId: string;
    let tournamentId: string;
    

    const createAndLogin = async (credentials: any, role: UserRole) => {
        let passwordHash =await authService.hashPassword(credentials.password);

        // 1. Intentar encontrar el usuario por email
        let prismaUser = await prisma.user.upsert({ 
            where: { email: credentials.email },
            update: { 
                passwordHash: passwordHash,
                // Aseguramos que el rol en Prisma sea mayúsculas
                role: role, 
            },
            create: {
                email: credentials.email,
                name: credentials.email,
                passwordHash: passwordHash,
                // Aseguramos que el rol en Prisma sea mayúsculas
                role: role, 
            },
        });

        // Mapeamos de nuevo al objeto de dominio para el token
        const createdUser: User = {
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
            passwordHash: prismaUser.passwordHash,
            // El rol del token siempre es minúsculas (UserRole)
            role: prismaUser.role.toLowerCase() as UserRole, 
        };

        // Generar token con el ID real y rol del usuario
        const token = await authService.generateToken(createdUser.id, createdUser.role);
        return { userId: createdUser.id, token };
    };

    //---------------------
    const createAndLogin2 = async (credentials: any, role: UserRole) => {
        const passwordHash = await authService.hashPassword(credentials.password);
        
        // Estrategia de doble verificación: buscamos primero.
        let prismaUser = await prisma.user.findFirst({
            where: { email: credentials.email }
        });

        if (prismaUser && prismaUser.passwordHash !== passwordHash) {
             // Si existe pero la contraseña no coincide (limpieza fallida), actualizamos.
            prismaUser = await prisma.user.update({
                where: { id: prismaUser.id },
                data: { passwordHash: passwordHash, role: role }
            });
        } else if (!prismaUser) {
            // Si no existe, creamos.
            prismaUser = await prisma.user.create({
                data: {
                    email: credentials.email,
                    name: credentials.email,
                    passwordHash: passwordHash,
                    role: role, 
                },
            });
        }

        // Si por alguna razón el usuario es null (lo cual no debería pasar)
        if (!prismaUser) throw new Error(`FATAL: Could not create or find user ${credentials.email}`);

        const createdUser: User = {
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
            passwordHash: prismaUser.passwordHash,
            role: prismaUser.role.toLowerCase() as UserRole, 
        };

        const token = await authService.generateToken(createdUser.id, createdUser.role);
        return { userId: createdUser.id, token };
    };

    beforeAll(async () => {
        await prisma.$connect();
        await prisma.tournament.deleteMany({});
        const emailsToClean = [
            ADMIN_CREDENTIALS.email, 
            PLAYER_CREDENTIALS.email, 
            PLAYER_TWO_CREDENTIALS.email, 
            ORGANIZER_CREDENTIALS.email
        ];
        await prisma.user.deleteMany({
            where: { email: { in: emailsToClean }}
        });

        await retryOperation(async () => {
            const admin = await createAndLogin(ADMIN_CREDENTIALS, UserRole.ADMIN);
            const playerOne = await createAndLogin(PLAYER_CREDENTIALS, UserRole.PLAYER);
            const playerTwo = await createAndLogin(PLAYER_TWO_CREDENTIALS, UserRole.PLAYER);
            const organizer = await createAndLogin(ORGANIZER_CREDENTIALS, UserRole.ORGANIZER);
            
            adminToken = admin.token;
            playerOneToken = playerOne.token;
            playerTwoToken = playerTwo.token;
            adminId = admin.userId;
            playerOneId = playerOne.userId;
            playerTwoId = playerTwo.userId;
            organizerId = organizer.userId;
        }, 5, 200);
    });

    beforeEach(async () => {
        // [CAMBIO CLAVE]: Envolvemos la creación del torneo en un retry.
        // Esto captura específicamente el error 500 causado por el Admin no encontrado.
        const creationRes = await retryOperation(async () => {
            const res = await request(app)
                .post(urlTournament)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(BASE_TOURNAMENT_PAYLOAD(organizerId));

            // Si el error es el de sincronización, lanzamos un error específico para forzar el retry
            if (res.status === 500 && res.body?.error.includes("Requester user not found")) {
                throw new Error("Requester user not found (Sync Issue)");
            }
            if (res.status !== 201) {
                // Si es un error de lógica, lo lanzamos para detener el test
                console.error(`Error de servidor en beforeEach: ${res.body?.error || 'Sin mensaje'}`);
                throw new Error(`Falló la creación del torneo: ${res.status} - ${res.body?.error || 'Sin mensaje'}`);
            }
            return res;
        }, 5, 100); // 5 intentos de retry con 100ms de retraso.

        tournamentId = creationRes.body.id; 
    });

    afterEach(async () => {
        // Eliminar el torneo creado en beforeEach
        if (tournamentId) {
            await prisma.tournament.delete({ where: { id: tournamentId } });
        }
    });

    afterAll(async () => {
        const emailsToClean = [
            ADMIN_CREDENTIALS.email, 
            PLAYER_CREDENTIALS.email, 
            PLAYER_TWO_CREDENTIALS.email, 
            ORGANIZER_CREDENTIALS.email,
            PLAYER_THREE_EMAIL 
        ];
        //await prisma.tournament.deleteMany({});
        await prisma.user.deleteMany({
            where: { email: { in: emailsToClean }}
        });
        await prisma.$disconnect();
    });

    test("should allow an ADMIN to create a valid tournament (initial check)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({...BASE_TOURNAMENT_PAYLOAD(adminId), name: "New Tournament Name"});

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("New Tournament Name");
        expect(res.body.registeredPlayersIds).toEqual([]); 
        expect(res.body.organizerId).toBe(`${adminId}`); 

        // Limpieza manual del torneo creado en este test (aparte del beforeEach/afterEach)
        if (res.body.id) {
            await prisma.tournament.delete({ where: { id: res.body.id } });
        }
    });

    test("should reject a PLAYER from creating a tournament (403 Forbidden)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .send(BASE_TOURNAMENT_PAYLOAD(playerOneId));
        expect(res.status).toBe(403);
        expect(res.body.error).toContain("User is not authorized to create tournaments.");
    });

    // -------------------------------------------------------------------------
    // ✅ NUEVOS TESTS DE REGISTRO DE JUGADORES
    // -------------------------------------------------------------------------

    test("should allow a player to register in a PENDING tournament", async() => {
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`); // Player 1 se inscribe

        expect(res.status).toBe(200);
        // Debe haber 1 jugador registrado (el ID de Player 1)
        expect(res.body.registeredPlayersIds).toEqual([playerOneId]); 
        expect(res.body.maxPlayers).toBe(2);
        expect(res.body.status).toBe(TournamentStatus.PENDING);
    });

    test("should prevent a player from registering twice in the same tournament", async() => {
        // 1. Primer registro (debe funcionar)
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .expect(200);

        // 2. Segundo registro (debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`);

        //El error 404/400 es válido si el use case lo lanza
        expect([400, 404]).toContain(res.status);
        expect(res.body.error).toContain("already registered");
    });
    
    test("should prevent registration if the tournament is already full", async() => {
        // Torneo maxPlayers = 2

        // 1. Registro Player 1
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .expect(200);

        // 2. Registro Player 2
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerTwoToken}`)
            .expect(200);
        
        // 3. Crear Player 3 para intentar el registro
        const { token: playerThreeToken } = await createAndLogin({ email: 'player_three@test.com', password: 'secure_pwd' }, UserRole.PLAYER);

        // 4. Registro Player 3 (Debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerThreeToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("already full");

        // Limpiar player 3
        await prisma.user.delete({ where: { email: 'player_three@test.com' } });
    });

    test("should prevent registration if the tournament status is not PENDING", async() => {
        // 1. Cambiar el estado del torneo a ACTIVE
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: TournamentStatus.ACTIVE } 
        });

        // 2. Intentar registrar (debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Cannot register. Tournament is currently active");
    });
});