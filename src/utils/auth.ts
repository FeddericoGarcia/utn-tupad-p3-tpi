import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { navigate } from "./navigate";

const getUser = () => localStorage.getItem("userData");
const removeUser = () => localStorage.removeItem("userData");

export const checkAuthUser = (
  redireccionLogin: string, 
  redireccionRolIncorrecto: string, 
  rolRequerido: Rol
) => {
  const userStr = getUser();

  if (!userStr) {
    navigate(redireccionLogin);
    return;
  }

  const user: IUser = JSON.parse(userStr);

  if (user.role !== rolRequerido) {
    navigate(redireccionRolIncorrecto);
    return;
  }
};

export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};