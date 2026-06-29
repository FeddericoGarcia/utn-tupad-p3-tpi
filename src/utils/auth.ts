// src/utils/auth.ts
import type { ISession, Rol } from '../types/types';

const SESSION_KEY = 'foodstore_session';

export const getSession = (): ISession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setSession = (user: ISession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const logout = (): void => {
  clearSession();
  window.location.href = '/src/pages/auth/login/login.html';
};

/** Protege una página: redirige si no hay sesión o el rol no coincide */
export const requireAuth = (rolRequerido: Rol): ISession | never => {
  const session = getSession();
  if (!session) {
    window.location.href = '/src/pages/auth/login/login.html';
    throw new Error('Sin sesión');
  }
  if (session.rol !== rolRequerido) {
    const redirect = session.rol === 'ADMIN'
      ? '/src/pages/admin/adminHome/adminHome.html'
      : '/src/pages/store/home/home.html';
    window.location.href = redirect;
    throw new Error('Rol incorrecto');
  }
  return session;
};