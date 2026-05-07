import type { IUser } from "../../../types/IUser";

const form = document.querySelector("#registroForm") as HTMLFormElement;

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const newUser: IUser = {
        email: data.get("email") as string,
        password: data.get("password") as string,
        role: 'client'
    };

    const users: IUser[] = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.find(u => u.email === newUser.email)) {
        alert("El usuario ya existe");
        return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = '../login/index.html';
});