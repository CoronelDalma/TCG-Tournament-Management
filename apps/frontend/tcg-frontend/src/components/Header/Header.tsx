import styles from './Header.module.css';
import { type SVGProps } from 'react';
import type { JSX } from 'react/jsx-runtime';

import { Nav } from '../Nav/Nav';
import { useNavigate } from 'react-router-dom';


const TrophyIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M12 15v5"/><path d="M11 19h2"/><path d="M12 17a5 5 0 0 0-5 5"/><path d="M12 17a5 5 0 0 0 5 5"/><path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 1.5 0 3.3 0 5h12c0-1.7 0-3.5 0-5z"/></svg>
);


export function Header() {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    }
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.headerInner}>
                    {/* LOGO */}
                    <button className={styles.logoButton} onClick={() => handleNavigation('/')}>
                        <TrophyIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                        TorneosApp
                    </button>
                    
                    {/* NAVEGACIÓN */}
                    <Nav onNavigate={handleNavigation}/>
                </div>
            </div>
        </header>
    );
}