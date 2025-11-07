import { useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { PageContainer } from "../../pages/PageContainer/PageContainer";

export const RedirectToLogin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/auth'), 50);
        return () => clearTimeout(timer);
    }, [navigate]);

    return <PageContainer title="Redirigiendo..." subtitle="Necesitas iniciar sesión para acceder a esta página." />;
}