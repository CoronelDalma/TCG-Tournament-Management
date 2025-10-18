import { NewUser, UserService } from "../../../../../domain/dist";

export const userServiceMock: UserService = {
    // createUser: async (user: NewUser) => {
    //     return { ...user, id: "mocked-id" };
    // },
    getByEmail: async (email: string) => {
        if (email === "test@email.com") {
            return {
                id: "existing-user-id",
                name: "Existing User",
                email: "test@email.com",
                passwordHash: "hashedpassword",
                role: "player"
            };
        }   
        return null;
    },
    // getById: async (id: string) => {
    //     if (id === "existing-user-id") {    
    //         return {
    //             id: "existing-user-id",
    //             name: "Existing User",
    //             email: "eee",
    //             passwordHash: "hashedpassword",
    //             role: "player"
    //         };
    //     }   
    //     return null;
    // },
}
