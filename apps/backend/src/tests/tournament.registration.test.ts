import { vi, describe, test, expect, beforeEach, beforeAll, afterAll} from "vitest"
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

//    MOCKS   
const ADMIN_ID = "b06cc353-1631-4a3b-b843-cb8a00ab342c";
const ORGANIZER_ID = "d47536a6-ce4f-45d2-949b-b2f99887993c";
vi.spyOn(userService, "getById").mockImplementation(async (id: string) => {
  // Devuelve el usuario correcto según el ID
    const usersById: Record<string, User> = {
        "2154e371-30fc-422d-b757-84de252bdc94": {
        id: "2154e371-30fc-422d-b757-84de252bdc94",
        name: "admin_creator@test.com",
        email: "admin_creator@test.com",
        passwordHash: "hashed_pwd",
        role: UserRole.ADMIN
        },
        "d4e32eae-118c-497a-9521-9df72705cc26": {
        id: "d4e32eae-118c-497a-9521-9df72705cc26",
        name: "player_creator@test.com",
        email: "player_creator@test.com",
        passwordHash: "hashed_pwd",
        role: UserRole.PLAYER
        },
        "be73ec5f-36c1-4192-a995-a8755239152c": {
        id: "be73ec5f-36c1-4192-a995-a8755239152c",
        name: "player_two@test.com",
        email: "player_two@test.com",
        passwordHash: "hashed_pwd",
        role: UserRole.PLAYER
        },
        "d29079c0-a431-4a62-9d34-7480f550a5d4": {
        id: "d29079c0-a431-4a62-9d34-7480f550a5d4",
        name: "organizer_creator@test.com",
        email: "organizer_creator@test.com",
        passwordHash: "hashed_pwd",
        role: UserRole.ORGANIZER
        }
    };

    return usersById[id] ?? null;
});



const ADMIN_CREDENTIALS = { email: 'admin_creator@test.com', password: 'secure_admin_pwd', role: UserRole.ADMIN };
const ORGANIZER_CREDENTIALS = { email: 'organizer_creator@test.com', password: 'secure_organizer_pwd', role: UserRole.ORGANIZER };
const PLAYER_CREDENTIALS = { email: 'player_creator@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_TWO_CREDENTIALS = { email: 'player_two@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };

const BASE_TOURNAMENT_PAYLOAD = {
    name: "Weekly Standard Tournament",
    description: "Standard competitive event.",
    maxPlayers: 2,
    startDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
    format: "Standard"
};

describe("Tournament Endpoints (Creation & Registration)", () => {
    let adminToken: string;
    let playerOneToken: string;
    let playerTwoToken: string;
    let adminId: string;
    let organizerId: string;
    let playerOneId: string;
    let playerTwoId: string;
    let tournamentId: string;
    
    // Función auxiliar para crear y obtener tokens
    const createAndLogin = async (credentials: any, role: UserRole) => {
        const passwordHash = await authService.hashPassword(credentials.password);
        let created: User | undefined = undefined;

        try {
            created = await userService.createUser({
                    name: credentials.email,
                    email: credentials.email,
                    passwordHash: passwordHash,
                    role: role
            });
        } catch (e) {
            throw e;
        }

        if (!created) {
            throw new Error("User creation failed");
        }
        const token = await authService.generateToken(created.id, role);
        //const token = await authService.generateToken(ADMIN_ID, role);
        return { userId: created.id, token };
    };

    beforeAll(async () => {
        await prisma.$connect();
        
        // Setup de usuarios
        const admin = await createAndLogin(ADMIN_CREDENTIALS, UserRole.ADMIN);
        const playerOne = await createAndLogin(PLAYER_CREDENTIALS, UserRole.PLAYER);
        const playerTwo = await createAndLogin(PLAYER_TWO_CREDENTIALS, UserRole.PLAYER);
        const organizer = await createAndLogin(ORGANIZER_CREDENTIALS, UserRole.ORGANIZER);
        
        adminToken = admin.token;
        playerOneToken = playerOne.token;
        playerTwoToken = playerTwo.token;
        adminId =admin.userId;
        playerOneId = playerOne.userId;
        playerTwoId = playerTwo.userId;
        organizerId = organizer.userId;

        // 2. Crear un torneo inicial (Necesario para los tests de registro)
        const creationRes = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: "Weekly Standard Tournament",
                description: "Standard competitive event.",
                maxPlayers: 2,
                startDate: new Date(Date.now() + 86400000).toISOString(),
                format: "Standard",
                organizedId: organizerId
            });

        if (creationRes.status !== 201){
            throw new Error(`Falló la creación del torneo: ${creationRes.status} - ${creationRes.body?.error || 'Sin mensaje'}`);
        }
        tournamentId = creationRes.body.id;
        
    });

    beforeEach(async () => {
        // Asegurarse de que el torneo esté limpio antes de cada test de registro
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { 
                status: 'pending' as any,
                registeredPlayersIds: { set: [] } // Limpia la relación Many-to-Many
            }
        });
    });

    afterAll(async () => {
        await prisma.tournament.deleteMany({});
        await prisma.user.deleteMany({
            where: { email: { in: [
                ADMIN_CREDENTIALS.email, PLAYER_CREDENTIALS.email, PLAYER_TWO_CREDENTIALS.email, ORGANIZER_CREDENTIALS.email
            ]}}
        });
        await prisma.$disconnect();
    });

    test("should allow an ADMIN to create a valid tournament (initial check)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({...BASE_TOURNAMENT_PAYLOAD, name: "New Tournament Name"});

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("New Tournament Name");
        expect(res.body.registeredPlayersIds).toEqual([]); 
        expect(res.body.organizerId).toBe(`${adminId}`); 
    });

    test("should reject a PLAYER from creating a tournament (403 Forbidden)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .send(BASE_TOURNAMENT_PAYLOAD);
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