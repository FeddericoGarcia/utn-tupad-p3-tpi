import type { IUser } from './types/IUser';
import { seedLocalStorage } from "./utils/seed";

function checkAuth() {
    const path = window.location.pathname;
    const loggedUser: IUser | null = JSON.parse(localStorage.getItem('userData') || 'null');

    if (!loggedUser && !path.includes('/auth/')) {
        window.location.href = '/src/pages/auth/login/index.html';
        return;
    }

    if (loggedUser?.role === 'client' && path.includes('/admin/')) {
        window.location.href = '/src/pages/client/index.html';
    }
}


seedLocalStorage();
console.log("✅ Semilla de datos cargada en localStorage.");
checkAuth();
console.log("✅ Aplicación iniciada. Verifique la consola para detalles.");