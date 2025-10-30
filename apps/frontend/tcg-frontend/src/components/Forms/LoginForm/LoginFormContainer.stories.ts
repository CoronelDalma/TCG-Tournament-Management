import type { Meta, StoryObj } from '@storybook/react';
import { LoginFormContainer } from './LoginFormContainer';
import { fn } from '@storybook/test'

const meta: Meta<typeof LoginFormContainer> = {
  title: 'components/Forms/Login/LoginContainer (Smart)', // Nueva ruta en Storybook
    component: LoginFormContainer,
    tags: ['autodocs'],
    args: {
        onSubmit: fn(), 
        onNavigateToRegister: fn(), 
    },
    // Opcional: Para una mejor demostración, puedes envolver el componente
    // en un componente padre que simule la navegación si fuera necesario.
};

export default meta;
type Story = StoryObj<typeof LoginFormContainer>;

// --- Historias Clave ---

// 1. Estado Inicial (Validación en el Contenedor)
export const Default: Story = {
  // Los campos están vacíos. Si intentas enviar, verás los errores de validación.
  // Interactúa con el formulario en Storybook para ver la lógica.
};

// 2. Simulación de Envío Exitoso
export const SuccessfulSubmission: Story = {
    args: {
        onSubmit: fn().mockImplementation(async (email, password) => {
            fn().mockName('onSubmit: Start (Simulating Success)')(email, password);
           // Simula el retraso de la red (1.5 segundos)
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Registrar el éxito y el resultado
            fn().mockName('onSubmit: Success')();

            alert('¡Inicio de sesión exitoso!');
            // Aquí el contenedor limpiaría los campos o redirigiría,
            // pero para el Storybook simplemente mostramos la acción.
        }),
    },
    // La prueba funcional se realiza llenando los campos en Storybook y haciendo clic.
};

// 3. Simulación de Error de Credenciales desde el Servidor
export const ServerError: Story = {
    args: {
        onSubmit: fn().mockImplementation(async (email, password) => {
            fn().mockName('onSubmit: Start (Simulating Error)')(email, password);
            await new Promise((_, reject) => setTimeout(() => reject(new Error('Invalid credentials')), 1500));
        // El contenedor debería atrapar este error y establecer formError.
        }),
    },
    // La prueba funcional se realiza llenando los campos en Storybook y haciendo clic.
};

// 4. Navegar al Registro (solo verifica que el action se dispare)
export const NavigateToRegister: Story = {
    args: {
        onNavigateToRegister: fn(),
    },
};