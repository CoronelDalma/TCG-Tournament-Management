import type { Meta, StoryObj } from '@storybook/react';
import { RegisterFormContainer } from './RegisterFormContainer';
import { fn } from '@storybook/test';

const meta: Meta<typeof RegisterFormContainer> = {
    title: 'components/Forms/Register/RegisterFormContainer (Smart)',
    component: RegisterFormContainer,
    tags: ['autodocs'],
    args: {
        // fn() simula la función de envío y navegación
        onSubmit: fn(),
        onNavigateToLogin: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof RegisterFormContainer>;

// --- Historias Clave ---

// 1. Estado Inicial (Prueba de Validación al Enviar)
export const Default: Story = {
  // PRUEBA: Al hacer clic en "Registrarse" con campos vacíos, debe mostrar errores de validación.
};

// 2. Error de Validación de Contraseña (Lógica de Contenedor)
export const PasswordMismatchTest: Story = {
  // PRUEBA: Llenar contraseñas diferentes y presionar Enviar. Debe mostrar el error.
};

// 3. Simulación de Envío Exitoso
export const SuccessfulSubmission: Story = {
    args: {
        onSubmit: fn().mockImplementation(async (name, email, password) => {
        fn().mockName('onSubmit: Start (Simulating Success)')(name, email, password); 
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        fn().mockName('onSubmit: Success')(); 
        // El componente mostrará el estado de carga durante 1.5s
        }),
    },
  // PRUEBA: Llenar correctamente y verificar que el botón cambie a "Registrando..."
};

// 4. Simulación de Error de Servidor (Ej: Email ya existe)
export const ServerError: Story = {
    args: {
        onSubmit: fn().mockImplementation(async (name, email, password) => {
        fn().mockName('onSubmit: Start (Simulating Error)')(name, email, password);
        await new Promise((_, reject) => setTimeout(() => {
            // Rechaza la promesa para simular que el servidor encontró un problema
            reject(new Error('Email already registered'));
        }, 1500));
        // El componente mostrará el estado de carga y luego el formError general.
        }),
    },
};