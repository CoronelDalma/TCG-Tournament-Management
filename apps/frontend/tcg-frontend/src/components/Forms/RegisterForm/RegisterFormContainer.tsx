import React, { useState } from 'react';
import { RegisterForm } from './RegisterForm';
import type { UserRole } from 'domain/src';
import { useAuthContext } from '../../../context/Auth/useAuthContext';

export interface RegisterFormContainerProps {
    //onSubmit: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
    onSubmit: () => void;
    onNavigateToLogin: () => void;
}

export function RegisterFormContainer({ onSubmit, onNavigateToLogin }: RegisterFormContainerProps) {
    const { register } = useAuthContext();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ role, setRole ] = useState<UserRole>('player');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Errores de campo
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const resetErrors = () => {
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setFormError('');
    }
    const validate = () => {
        let isValid = true;
        resetErrors();

        // Validación Nombre
        if (name.trim().length < 3) {
        setNameError('El nombre debe tener al menos 3 caracteres.');
        isValid = false;
        }
        
        // Validación Email
        if (!email.trim() || !email.includes('@')) {
        setEmailError('El correo electrónico no es válido.');
        isValid = false;
        }
        
        // Validación Contraseña
        if (password.length < 8) {
        setPasswordError('La contraseña debe tener al menos 8 caracteres.');
        isValid = false;
        }

        // Validación Confirmación de Contraseña (Lógica Clave)
        if (password !== confirmPassword) {
        setConfirmPasswordError('Las contraseñas no coinciden.');
        isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            //await onSubmit(name, email, password, role);
            await register(name, email, password, role);
            onSubmit();
        // Éxito: El componente padre (App) se encargaría de la redirección.
        } catch (error) {
            console.log(error);
            setFormError('El correo ya está registrado o hubo un error en el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RegisterForm
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        nameError={nameError}
        emailError={emailError}
        passwordError={passwordError}
        confirmPasswordError={confirmPasswordError}
        formError={formError}
        isLoading={isLoading}
        
        onNameChange={(e) => setName(e.target.value)}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
        onRoleChange={(e) => setRole(e.target.value as UserRole)}

        onFormSubmit={handleSubmit}
        onNavigateToLogin={onNavigateToLogin}
        />
    );
};