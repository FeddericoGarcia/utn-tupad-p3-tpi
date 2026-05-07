import type { IUser } from "../types/IUser";

export const seedLocalStorage = (): void => {
  if (localStorage.getItem("users")) {
    const mockUsers: IUser[] = [
      {
        email: "federico@gmail.com",
        password: "12345678",
        role: "admin"
      },
      {
        email: "federico@test.com",
        password: "12345678",
        role: "client"
      },
      {
        email: "user@test.com",
        password: "asdasdasd",
        role: "client"
      }
    ];
    localStorage.setItem("users", JSON.stringify(mockUsers));
    console.log("✅ Datos de prueba (Admin y Client) cargados en localStorage.");
  }
};