import type { Meta, StoryObj } from "@storybook/react-vite";
import {Button} from './Button';

const meta: Meta<typeof Button> = {
    component: Button,
    title:"components/Button",
    parameters: {
        layout: "centered"
    },
    tags: ['autodocs'],
    argTypes: {
        onClick: { action: 'clicked'},
        children: {
            control: 'text',
        }
    }
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        children: 'Boton principal',
        variant: 'primary',
    }
}

// 2. Segundo Story: Secondary
export const Secondary: Story = {
    args: {
        children: 'Botón Secundario',
        variant: 'secondary',
    },
};

// 3. Tercer Story: Danger
export const Danger: Story = {
    args: {
        children: 'Eliminar Cuenta',
        variant: 'danger',
    },
};

// 4. Cuarto Story: Disabled (Deshabilitado)
export const Disabled: Story = {
    args: {
        children: 'Botón Deshabilitado',
        disabled: true,
    },
};

// 5. Quinto Story: Loading (Cargando)
export const Loading: Story = {
    args: {
        children: 'Iniciar Sesión',
        isLoading: true,
    },
};