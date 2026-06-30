// src/pages/store/cart/cart.ts
import type { IPedido, FormaPago } from '../../../types/types';
import { logout, getSession } from '../../../utils/auth';
import {
  getCart, removeFromCart, updateQuantity,
  clearCart, getSubtotal, getTotal, updateCartBadge, ENVIO
} from '../../../utils/cart';

// Proteger ruta
const session = getSession();
if (!session) { window.location.href = '/src/pages/auth/login/login.html'; throw new Error(); }

document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

// --- DOM ---
const tbody = document.getElementById('cart-items') as HTMLElement;
const emptyMsg = document.getElementById('emptyMsg') as HTMLElement;
const cartTable = document.getElementById('cartTable') as HTMLElement;
const subtotalEl = document.getElementById('summary-subtotal') as HTMLElement;
const totalEl = document.getElementById('cart-total') as HTMLElement;
const envioEl = document.getElementById('summary-envio') as HTMLElement;

const checkoutModal = document.getElementById('checkoutModal') as HTMLElement;
const modalSubtotal = document.getElementById('modalSubtotal') as HTMLElement;
const modalTotal = document.getElementById('modalTotal') as HTMLElement;
const checkoutError = document.getElementById('checkoutError') as HTMLElement;

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

// --- Render ---
const renderCart = () => {
  const cart = getCart();
  updateCartBadge();

  if (cart.length === 0) {
    emptyMsg.style.display = 'block';
    cartTable.style.display = 'none';
    subtotalEl.textContent = fmt(0);
    totalEl.innerHTML = `<strong>${fmt(0)}</strong>`;
    envioEl.textContent = fmt(ENVIO);
    return;
  }

  emptyMsg.style.display = 'none';
  cartTable.style.display = 'table';

  tbody.innerHTML = cart.map(item => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${item.imagen}" alt="${item.nombre}"
            onerror="this.src='https://placehold.co/60x60?text=?'"
            style="width:54px;height:54px;object-fit:cover;border-radius:8px;" />
          <span>${item.nombre}</span>
        </div>
      </td>
      <td>${fmt(item.precio)}</td>
      <td>
        <div class="qty-controls">
          <button class="btn-qty" data-id="${item.id}" data-action="dec">−</button>
          <span class="qty-number">${item.cantidad}</span>
          <button class="btn-qty" data-id="${item.id}" data-action="inc">+</button>
        </div>
      </td>
      <td>${fmt(item.precio * item.cantidad)}</td>
      <td>
        <button class="btn-remove" data-id="${item.id}"
          style="background:none;border:none;color:#e53e3e;cursor:pointer;font-size:1.1rem;">🗑</button>
      </td>
    </tr>`).join('');

  const sub = getSubtotal();
  const tot = getTotal();
  subtotalEl.textContent = fmt(sub);
  totalEl.innerHTML = `<strong>${fmt(tot)}</strong>`;
  envioEl.textContent = fmt(ENVIO);

  // Eventos
  tbody.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      const action = (btn as HTMLButtonElement).dataset.action === 'inc' ? 1 : -1;
      const item = getCart().find(i => i.id === id);
      const maxStock = item?.stock ?? 999;
      updateQuantity(id, action, maxStock);
      renderCart();
    });
  });

  tbody.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(Number((btn as HTMLButtonElement).dataset.id));
      renderCart();
    });
  });
};

// --- Vaciar carrito ---
document.getElementById('btnVaciar')!.addEventListener('click', () => {
  if (getCart().length === 0) return;
  if (confirm('¿Vaciar el carrito?')) { clearCart(); renderCart(); }
});

// --- Checkout modal ---
document.getElementById('btnCheckout')!.addEventListener('click', () => {
  if (getCart().length === 0) return;
  modalSubtotal.textContent = fmt(getSubtotal());
  modalTotal.textContent = fmt(getTotal());
  checkoutModal.style.display = 'flex';
});

document.getElementById('closeModal')!.addEventListener('click', () => {
  checkoutModal.style.display = 'none';
});

checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) checkoutModal.style.display = 'none';
});

// --- Confirmar pedido ---
document.getElementById('btnConfirmar')!.addEventListener('click', () => {
  checkoutError.style.display = 'none';

  const tel = (document.getElementById('checkoutTel') as HTMLInputElement).value.trim();
  const pago = (document.getElementById('checkoutPago') as HTMLSelectElement).value as FormaPago;

  if (!tel) { checkoutError.textContent = 'El teléfono es obligatorio.'; checkoutError.style.display = 'block'; return; }
  if (!pago) { checkoutError.textContent = 'Seleccioná un método de pago.'; checkoutError.style.display = 'block'; return; }

  const cart = getCart();

  // Generar objeto pedido
  const pedidosRaw: IPedido[] = JSON.parse(localStorage.getItem('foodstore_pedidos') || '[]');
  const newId = Math.max(0, ...pedidosRaw.map(p => p.id)) + 1;

  const newPedido: IPedido = {
    id: newId,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PENDIENTE',
    total: getTotal(),
    formaPago: pago,
    idUsuario: session.id,
    detalles: cart.map(item => ({
      idProducto: item.id,
      cantidad: item.cantidad,
      subtotal: item.precio * item.cantidad
    }))
  };

  pedidosRaw.push(newPedido);
  localStorage.setItem('foodstore_pedidos', JSON.stringify(pedidosRaw));

  clearCart();
  checkoutModal.style.display = 'none';

  alert(`✅ ¡Pedido #${newId} confirmado!\nTotal: ${fmt(newPedido.total)}\nPago: ${pago}`);
  window.location.href = '/src/pages/client/orders/orders.html';
});

// Init
renderCart();
