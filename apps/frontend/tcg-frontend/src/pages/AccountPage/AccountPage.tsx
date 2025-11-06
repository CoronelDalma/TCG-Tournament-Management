import { useAuthContext } from "../../context/Auth/useAuthContext";
import { PageContainer } from "../PageContainer/PageContainer";

export const AccountPage = () => {
    const { user, role } = useAuthContext();
    return (
        <PageContainer title={`Mi Cuenta (${user?.email})`} subtitle="Gestiona la información de tu cuenta" role={role && `Rol: ${role}`}/>
    );
}