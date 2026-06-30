// src/utils/cart.ts
import type { ICartItem, IProducto } from '../types/types';

const CART_KEY = 'foodstore_cart';
export const ENVIO = 500; // Costo fijo de envío en pesos

export const getCart = (): ICartItem[] =>
  JSON.parse(localStorage.getItem(CART_KEY) || '[]');

export const saveCart = (cart: ICartItem[]): void =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

export const clearCart = (): void =>
  localStorage.removeItem(CART_KEY);

export const addToCart = (product: IProducto): void => {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    if (existing.cantidad < product.stock) existing.cantidad++;
  } else {
    cart.push({ ...product, cantidad: 1 });
  }
  saveCart(cart);
};

export const updateQuantity = (id: number, delta: number, maxStock: number): void => {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) cart = cart.filter(i => i.id !== id);
  if (item.cantidad > maxStock) item.cantidad = maxStock;
  saveCart(cart);
};

export const removeFromCart = (id: number): void => {
  saveCart(getCart().filter(i => i.id !== id));
};

export const getSubtotal = (): number =>
  getCart().reduce((acc, i) => acc + i.precio * i.cantidad, 0);

export const getTotal = (): number => getSubtotal() + ENVIO;

export const getCartCount = (): number =>
  getCart().reduce((acc, i) => acc + i.cantidad, 0);

export const updateCartBadge = (): void => {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const count = getCartCount();
  el.textContent = count.toString();
  el.style.display = count > 0 ? 'inline-flex' : 'none';
};
