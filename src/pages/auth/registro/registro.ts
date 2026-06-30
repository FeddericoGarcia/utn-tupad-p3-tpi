// src/pages/auth/registro/registro.ts
import type { IUsuario } from '../../../types/types';
import { setSession } from '../../../utils/auth';
import { getUsuarios } from '../../../utils/api';

const form = document.getElementById('registroForm') as HTMLFormElement;
const errorMsg = document.getElementById('regError') as HTMLElement;

form.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();
  errorMsg.style.display = 'none';

  const nombre = (document.getElementById('inputNombre') as HTMLInputElement).value.trim();
  const apellido = (document.getElementById('inputApellido') as HTMLInputElement).value.trim();
  const mail = (document.getElementById('inputEmail') as HTMLInputElement).value.trim().toLowerCase();
  const password = (document.getElementById('inputPassword') as HTMLInputElement).value;

  if (password.length < 6) {
    errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    // Verificar que el email no exista ya en usuarios.json
    const usuarios: IUsuario[] = await getUsuarios();
    if (usuarios.find(u => u.mail.toLowerCase() === mail)) {
      errorMsg.textContent = 'Ya existe un usuario con ese email.';
      errorMsg.style.display = 'block';
      return;
    }

    // En esta iteración se agrega solo al estado local (no persiste en el JSON)
    const newId = Math.max(0, ...usuarios.map(u => u.id)) + 1;
    const newUser: IUsuario = { id: newId, nombre, apellido, mail, celular: '', password, rol: 'USUARIO' };

    // Auto-login después del registro
    const { password: _, ...sessionData } = newUser;
    setSession(sessionData);

    window.location.href = '/src/pages/store/home/home.html';

  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Error al procesar el registro. Intente de nuevo.';
    errorMsg.style.display = 'block';
  }
});
