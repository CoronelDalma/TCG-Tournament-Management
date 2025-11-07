import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User, UserRole } from "domain/src";
import { AuthUseCases } from "../../di/useCase.config";

export function AuthProvider ({children}: {children: React.ReactNode}) {
    const [ user, setUser] = useState<User | null>(null);
    const [ token, setToken] = useState<string | null>(null);
    const [ isLoading, setIsLoading] = useState<boolean>(false);
    //const [ role, setRole ] = useState<string | null>(null);

    useEffect(() => {
        // Aquí podrías cargar el usuario y token desde almacenamiento local si es necesario
        // const storedToken = localStorage.getItem('jwt_token');
        // // decodificar el token para obtener el usuario
        // const storedUser = storedToken ? JSON.parse(atob(storedToken.split('.')[1])) as User : null;
        // if (storedUser && storedToken) {
        //     setUser(storedUser);
        //     setToken(storedToken);
        //     setRole(storedUser.role);
        // }

        // Simulación de carga inicial
        const storedToken = localStorage.getItem('auhtToken');
        if (storedToken) {
            // En un app real, decodificamos el token para obtener el user/role
            // Aquí simulamos un login exitoso y seteamos un usuario mock basado en el token
            const roleMatch = storedToken.match(/mock_jwt_(.*)_token/);
            const role = roleMatch ? roleMatch[1] : 'standard';
            
            setUser({ id: 'u_mock', name: `MockUser (${role})`, email: `${role}@test.com`, passwordHash: '', role: role as UserRole });
            setToken(storedToken);
            //setRole(role);
        }

    }, []);

    const isLoggedIn = !!user && !!token;
    const role: UserRole = user?.role || 'guest';

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { user: loggedInUser, token: authToken } = await AuthUseCases.login(email, password);
            //add passwordHash to user to satisfy User type
            setUser({...loggedInUser, passwordHash: ''});
            setToken(authToken);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
        setIsLoading(true);
        try {
            await AuthUseCases.register(name, email, password, role);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('jwt_token'); 
        setUser(null);
        setToken(null);
    }, []);

    const values = { user, isLoggedIn, role, token, login, register, logout, isLoading};

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}