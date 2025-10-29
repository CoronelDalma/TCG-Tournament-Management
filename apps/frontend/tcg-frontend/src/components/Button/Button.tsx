import styles from './Button.module.css';

export interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export function Button({children, variant='primary', onClick, disabled=false, isLoading=false}: ButtonProps) {
    const isDisabled = disabled || isLoading;
    return (
        <button 
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            disabled={isDisabled}
            aria-busy={isLoading}>
            {isLoading ? 'Cargando...' : children}
        </button>
    )
}