import { useState } from "react";
import { LoginForm } from "./LoginForm";

export interface LoginFormContainerProps {
    onSubmit: (email: string, password: string) => Promise<void>;
    onNavigateToRegister: () => void;
}

export function LoginFormContainer({onSubmit, onNavigateToRegister}: LoginFormContainerProps) {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ errorFormMessage, setErrorFormMessage ] = useState('');
    const [ errorEmailMessage, setErrorEmailMessage ] = useState('');
    const [ errorPasswordMessage, setErrorPasswordMessage ] = useState('');

    const resetErrors = () => {
        setErrorEmailMessage('');
        setErrorPasswordMessage('');
        setErrorFormMessage('');
    }

    const validate = () => {
        let isValid = true;
        resetErrors();

        if (!email.trim()) {
            setErrorEmailMessage("Email requerido");
            isValid = false;
        }
        if ( password.length < 6) {
            setErrorPasswordMessage("La contraseña debe tener al menos 6 caracteres");
            isValid = false;
        }

        return isValid;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(email, password);
        } catch (error) {
            console.error(error);
            setErrorFormMessage("Credenciales incorrectas ");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <LoginForm email={email} password={password}
            isLoading={isLoading} 
            errorFormMessage={errorFormMessage} 
            errorEmailMessage={errorEmailMessage} 
            errorPasswordMessage={errorPasswordMessage} 
            onFormSubmit={handleSubmit} 
            onEmailChange={(e) => setEmail(e.target.value)} 
            onPasswordChange={(e) => setPassword(e.target.value)} 
            onNavigateToRegister={onNavigateToRegister} />
    )
}