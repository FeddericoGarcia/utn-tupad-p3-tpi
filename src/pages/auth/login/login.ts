import type { IUser } from "../../../types/IUser";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("input-email") as HTMLInputElement;
const inputPassword = document.getElementById("input-pass") as HTMLInputElement;

form.addEventListener("submit", (e: SubmitEvent) => {
  console.log("📝 Formulario enviado. Procesando autenticación...");
  e.preventDefault();

  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

  const storedUsers: IUser[] = JSON.parse(localStorage.getItem("users") || "[]");
  console.log("📂 Usuarios almacenados en localStorage:", storedUsers);

  const userFound = storedUsers.find(
    (u) => u.email === valueEmail && u.password === valuePassword
  );
  console.log("🔍 Buscando usuario con email:", userFound);

  if (userFound) {
    localStorage.setItem("userData", JSON.stringify(userFound));

    if (userFound.role === "client") {
      navigate("/src/pages/store/home/home.html");
    } else {
      navigate("/src/pages/admin/home/home.html");
    }
  } else {
    alert("Email o contraseña incorrectos. Por favor, revise los datos ingresados.");
  }
});