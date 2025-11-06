import { useContext } from "react";
import type { AuthContextType } from "../../domain/Auth.types";
import { AuthContext } from "./AuthContext";

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
