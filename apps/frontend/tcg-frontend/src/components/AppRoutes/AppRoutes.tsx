import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../../pages/HomePage/HomePage'
import { TournamentListPage } from '../../pages/TournamentListPage/TournamentListPage'
import { AuthPage } from '../../pages/AuthPage/AuthPage'
import { AccountPage } from '../../pages/AccountPage/AccountPage'
import { RedirectToLogin } from '../RedirectToLogin/RedirectToLogin'
import { TournamentManagementPage } from '../../pages/TournamentManagementPage/TournamentManagementPage'
import { PageContainer } from '../../pages/PageContainer/PageContainer'
import { useAuthContext } from '../../context/Auth/useAuthContext'

export const AppRoutes = () => {
    const { role, isLoggedIn } = useAuthContext();
    return (
        <Routes>
            <Route path='/' element={<HomePage/>} />
            <Route path='/torneos/activos' element={<TournamentListPage type='activos'/>} />
            <Route path='/torneos/pendientes' element={<TournamentListPage type='pendientes'/>} />
            <Route path='/auth' element={<AuthPage/>} />

            <Route path='/cuenta' element={isLoggedIn ? <AccountPage/> : <RedirectToLogin/>} />
            <Route path="/torneos/gestion" 
                element={(role === 'admin' || role === 'organizer') ? <TournamentManagementPage /> : <RedirectToLogin />} />
                      
            <Route path="*" element={<PageContainer title="404: Página No Encontrada" subtitle="La ruta a la que intentas acceder no existe." />} />
        </Routes>
    )
}