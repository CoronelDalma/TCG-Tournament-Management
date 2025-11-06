import { createContext } from "react";
import type { AuthContextType } from "../../domain/Auth.types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);