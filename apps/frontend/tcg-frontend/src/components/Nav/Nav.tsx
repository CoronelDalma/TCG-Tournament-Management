import { useState, type CSSProperties, type SVGProps } from 'react';
import { useAuthContext } from '../../context/Auth/useAuthContext';
import { Button } from '../Button/Button';
import type { JSX } from 'react/jsx-runtime';
import styles from './Nav.module.css';

const UserIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LogOutIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

const NavLinks = {
    activos: '/torneos/activos',
    pendientes: '/torneos/pendientes',
    gestion: '/torneos/gestion'
}

export type NavLinkKey = keyof typeof NavLinks;

export interface NavProps {
    onNavigate: (path: string) => void;

}

export function Nav({ onNavigate }: NavProps) {
    const { isLoggedIn, user, role, logout } = useAuthContext();
    const isAdminOrOrganizer = role === 'admin' || role === 'organizer';
    const userName = user?.name || '';

    const [hoveredLink, setHoveredLink] = useState('');

    const getLinkStyle = (key: string, isSpecial: boolean = false): CSSProperties => ({
        ...(isSpecial ? { color: '#f59e0b', fontWeight: 500 } : {}),
        ...(hoveredLink === key ? { color: isSpecial ? '#fbbf24' : 'white' } : {})
    });
    return (
        <nav className={styles.nav}>
            <button onClick={() => onNavigate(NavLinks.activos)}>Activos</button>
            <button onClick={() => onNavigate(NavLinks.pendientes)}>Pendientes</button>
            {isAdminOrOrganizer && (
                <button onClick={() => onNavigate(NavLinks.gestion)}>Gestión</button>
            )}

            <Button 
                style={getLinkStyle('activos')}
                onMouseEnter={() => setHoveredLink('activos')}
                onMouseLeave={() => setHoveredLink('')}
                onClick={() => onNavigate('/torneos/activos')}>
                Activos
            </Button>
            <Button 
                style={getLinkStyle('pendientes')}
                onMouseEnter={() => setHoveredLink('pendientes')}
                onMouseLeave={() => setHoveredLink('')}
                onClick={() => onNavigate('/torneos/pendientes')}>
                Pendientes
            </Button>

            {/* LINK DE GESTIÓN (Solo Organizers/Admins) */}
            {isAdminOrOrganizer && (
                <Button 
                    style={getLinkStyle('gestion', true)}
                    onMouseEnter={() => setHoveredLink('gestion')}
                    onMouseLeave={() => setHoveredLink('')}
                    onClick={() => onNavigate('/torneos/gestion')}>
                    Gestión
                </Button>
            )}

            {/* AUTENTICACIÓN / CUENTA */}
            <div className={styles.authSection}>
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Button className={styles.accountButton} onClick={() => onNavigate('/cuenta')}>
                    <UserIcon style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                    {userName}
                  </Button>
                  <Button className={styles.logoutButton} onClick={logout}>
                    <LogOutIcon style={{ width: '1rem', height: '1rem' }} />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => onNavigate('/auth')}>
                  Ingresar
                </Button>
              )}
            </div>

        </nav>
    );
}