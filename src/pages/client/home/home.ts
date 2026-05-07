import { checkAuthUser, logout } from "../../../utils/auth";

/* checkAuthUser(
  "/src/pages/auth/login/login.html",
  "/src/pages/admin/home/home.html",
  "client"
); */

const logoutButton = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
logoutButton?.addEventListener("click", () => {
  logout();
});



