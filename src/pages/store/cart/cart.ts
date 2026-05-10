import { 
    getCart, 
    updateQuantityLogic, 
    removeFromCartLogic, 
    calculateTotal, 
    updateCartCounter 
} from "../../../utils/cart_logic";
import { logout } from "../../../utils/auth";
import type { IUser } from "../../../types/IUser";


const cartItemsContainer = document.getElementById("cart-items") as HTMLElement;
const totalDisplay = document.getElementById("cart-total") as HTMLElement;
const subtotalDisplay = document.getElementById("summary-subtotal") as HTMLElement;
const btnLogout = document.getElementById("logoutButton") as HTMLButtonElement;

const renderCartView = () => {
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Tu carrito está vacío.</td></tr>`;
        totalDisplay.innerText = "$0.00";
        subtotalDisplay.innerText = "$0.00";
        return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio.toLocaleString('es-AR')}</td>
            <td>
                <div class="qty-controls">
                    <button class="btn-qty" data-id="${item.id}" data-action="dec">-</button>
                    <span class="qty-number">${item.cantidad}</span>
                    <button class="btn-qty" data-id="${item.id}" data-action="inc">+</button>
                </div>
            </td>
            <td>
                <button class="btn-remove" data-id="${item.id}">Eliminar</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    const total = calculateTotal();
    totalDisplay.innerText = `$${total.toLocaleString('es-AR')}`;
    subtotalDisplay.innerText = `$${total.toLocaleString('es-AR')}`;
    
    attachEvents();
};


const updateQuantity = (id: number, change: number) => {
    updateQuantityLogic(id, change);
    renderCartView();
    updateCartCounter();
};


const attachEvents = () => {

    document.querySelectorAll(".btn-qty").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const button = e.currentTarget as HTMLButtonElement;
            const id = Number(button.dataset.id);
            const action = button.dataset.action === "inc" ? 1 : -1;
            
            updateQuantity(id, action);
        });
    });


    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const button = e.currentTarget as HTMLButtonElement;
            const id = Number(button.dataset.id);
            
            removeFromCartLogic(id);
            renderCartView();
            updateCartCounter();
        });
    });
};

if (btnLogout) {
    btnLogout.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();

        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            logout();
        }
    });
}

const checkAdminAccess = () => {
    const userData = localStorage.getItem("userData");

    if (userData) {
        const user: IUser = JSON.parse(userData);

        if (user.role === 'admin') {
            const navMenu = document.getElementById("nav-menu");

            if (navMenu) {
                const adminLink = document.createElement("a");
                adminLink.href = "/src/pages/admin/home/home.html";
                adminLink.innerText = "Panel Admin";

                navMenu.prepend(adminLink);
            }
        }
    }
};

checkAdminAccess();
renderCartView();
updateCartCounter();