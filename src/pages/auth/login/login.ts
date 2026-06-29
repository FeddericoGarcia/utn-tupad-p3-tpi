// src/pages/auth/login/login.ts
import type { IUsuario } from '../../../types/types';
import { setSession, getSession } from '../../../utils/auth';
import { getUsuarios } from '../../../utils/api';

// Si ya hay sesión activa, redirigir directamente
const session = getSession();
if (session) {
  window.location.href = session.rol === 'ADMIN'
    ? '/src/pages/admin/adminHome/adminHome.html'
    : '/src/pages/store/home/home.html';
}

const form = document.getElementById('loginForm') as HTMLFormElement;
const inputEmail = document.getElementById('inputEmail') as HTMLInputElement;
const inputPassword = document.getElementById('inputPassword') as HTMLInputElement;
const errorMsg = document.getElementById('loginError') as HTMLElement;

form.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const email = inputEmail.value.trim().toLowerCase();
  const password = inputPassword.value;

  try {
    // Fetch a /data/usuarios.json  (en la siguiente iteración: fetch('/api/usuarios'))
    const usuarios: IUsuario[] = await getUsuarios();

    const found = usuarios.find(
      u => u.mail.toLowerCase() === email && u.password === password
    );

    if (!found) {
      errorMsg.style.display = 'block';
      return;
    }

    // Guardar sesión sin password
    const { password: _, ...sessionData } = found;
    setSession(sessionData);

    window.location.href = found.rol === 'ADMIN'
      ? '/src/pages/admin/adminHome/adminHome.html'
      : '/src/pages/store/home/home.html';

  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    errorMsg.textContent = 'Error al conectar. Intente de nuevo.';
    errorMsg.style.display = 'block';
  }
});