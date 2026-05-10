import { PRODUCTS } from "../../../data/data";
import type { Product } from "../../../types/product";
import { addToCartLogic } from "../../../utils/cart_logic";
import { logout } from "../../../utils/auth";
import type { IUser } from "../../../types/IUser";

const container = document.getElementById("product-grid") as HTMLElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const categoryList = document.getElementById("category-list") as HTMLElement;
const btnLogout = document.getElementById("logoutButton") as HTMLButtonElement;

let activeCategory = "Todos los productos";


const updateDisplay = () => {
    const term = searchInput.value.toLowerCase();

    const filtered = PRODUCTS.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(term);
        const matchesCategory = activeCategory === "Todos los productos" ||
            product.categorias.some(c => c.nombre === activeCategory);
        return matchesSearch && matchesCategory && !product.eliminado && product.disponible;
    });

    renderGrid(filtered);
};


const renderGrid = (items: Product[]) => {
    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = `<div class="no-results">No se encontraron productos para "${searchInput.value}"</div>`;
        return;
    }

    items.forEach(prod => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-img"><img src="/src/assets/${prod.imagen}" alt="${prod.nombre}"></div>
            <div class="card-content">
                <span class="category-tag">${prod.categorias[0].nombre.toUpperCase()}</span>
                <h3>${prod.nombre}</h3>
                <p>${prod.descripcion}</p>
                <div class="card-footer">
                    <span class="price">$${prod.precio.toLocaleString('es-AR')}</span>
                    <button class="btn-add" data-id="${prod.id}">+ Agregar</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    const addButtons = document.querySelectorAll(".btn-add");
    addButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            const product = PRODUCTS.find(p => p.id === id);
            if (product) {
                addToCartLogic(product); 
                alert(`${product.nombre} añadido al carrito`); 
                updateCartCounter();
            }
        });
    });
};

const updateCartCounter = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const counter = document.getElementById("cart-count");  
    if (counter) {
        const totalItems = cart.reduce((acc: number, item: any) => acc + item.cantidad, 0);
        counter.innerText = totalItems.toString();
    }
};

searchInput.addEventListener("input", updateDisplay);

categoryList.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "LI" || target.tagName === "BUTTON") {
        document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
        target.classList.add("active");

        activeCategory = target.innerText;
        updateDisplay();
    }
});

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
updateDisplay();
updateCartCounter();
