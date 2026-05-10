import type { Product, CartItem } from "../types/product";

const CART_KEY = "cart";

export const getCart = (): CartItem[] => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
export const saveCart = (cart: CartItem[]): void => localStorage.setItem(CART_KEY, JSON.stringify(cart));

export const addToCartLogic = (product: Product): void => {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    existing ? existing.cantidad++ : cart.push({ ...product, cantidad: 1 });
    saveCart(cart);
};

export const updateQuantityLogic = (id: number, change: number): void => {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.cantidad += change;
        if (item.cantidad <= 0) cart = cart.filter(i => i.id !== id);
        saveCart(cart);
    }
};

export const removeFromCartLogic = (id: number): void => {
    const cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
};

export const calculateTotal = (): number => {
    return getCart().reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
};

export const updateCartCounter = (): void => {
    const cart = getCart();
    const counterElement = document.getElementById("cart-count");
    if (counterElement) {
        const totalUnits = cart.reduce((acc, item) => acc + item.cantidad, 0);
        counterElement.innerText = totalUnits.toString();

        counterElement.style.display = totalUnits > 0 ? "inline-block" : "none";
    }
};