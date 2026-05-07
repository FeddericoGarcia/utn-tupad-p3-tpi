import { checkAuthUser, logout } from "../../../utils/auth";

checkAuthUser(
  "/src/pages/auth/login/login.html", 
  "/src/pages/client/home/home.html", 
  "admin"
);

const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});


