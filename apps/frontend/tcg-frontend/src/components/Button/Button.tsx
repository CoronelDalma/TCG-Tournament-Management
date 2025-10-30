import styles from './Button.module.css';

export const ButtonVariant = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    DANGER: 'danger',
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    children?: React.ReactNode;
    variant?: ButtonVariant;
    onClick?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export function Button({children, variant='primary', onClick, disabled=false, isLoading=false, ...rest}: ButtonProps) {
    const isDisabled = disabled || isLoading;
    return (
        <button 
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            disabled={isDisabled}
            aria-busy={isLoading}
            {...rest}>
            {isLoading ? 'Cargando...' : children}
        </button>
    )
}