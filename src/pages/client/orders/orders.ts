// src/pages/client/orders/orders.ts
import type { IPedido, IProducto, Estado } from '../../../types/types';
import { getSession, logout } from '../../../utils/auth';
import { getPedidos, getProductos } from '../../../utils/api';
import { updateCartBadge } from '../../../utils/cart';

const session = getSession();
if (!session) { window.location.href = '/src/pages/auth/login/login.html'; throw new Error(); }

document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

updateCartBadge();

const ordersList = document.getElementById('ordersList') as HTMLElement;
const filterSelect = document.getElementById('filterEstado') as HTMLSelectElement;
const detailModal = document.getElementById('detailModal') as HTMLElement;
const modalBody = document.getElementById('modalBody') as HTMLElement;
const modalPedidoId = document.getElementById('modalPedidoId') as HTMLElement;

let allPedidos: IPedido[] = [];
let allProductos: IProducto[] = [];

const estadoStyle: Record<Estado, string> = {
  PENDIENTE:  'background:#fef3c7;color:#92400e;',
  CONFIRMADO: 'background:#dbeafe;color:#1e40af;',
  TERMINADO:  'background:#d1fae5;color:#065f46;',
  CANCELADO:  'background:#fee2e2;color:#991b1b;',
};

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

const renderOrders = (pedidos: IPedido[]) => {
  if (pedidos.length === 0) {
    ordersList.innerHTML = `<div style="text-align:center;padding:60px;color:#888;">
      <p style="font-size:2.5rem;margin:0;">📋</p>
      <p>No tenés pedidos todavía.</p>
      <a href="../../store/home/home.html" style="color:#ff6347;font-weight:600;">Ir al catálogo</a>
    </div>`;
    return;
  }

  ordersList.innerHTML = pedidos.map(p => {
    const resumen = p.detalles.slice(0, 3).map(d => {
      const prod = allProductos.find(pr => pr.id === d.idProducto);
      return prod ? `${prod.nombre} x${d.cantidad}` : `Producto #${d.idProducto}`;
    }).join(', ');
    const mas = p.detalles.length > 3 ? ` y ${p.detalles.length - 3} más...` : '';

    return `<div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:14px;
      box-shadow:0 2px 8px rgba(0,0,0,.07);cursor:pointer;" data-id="${p.id}" class="order-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div>
          <p style="margin:0;font-weight:700;font-size:.95rem;">Pedido #${p.id}</p>
          <p style="margin:0 0 12px 0;font-size:.82rem;color:#666;">${p.fecha} · ${p.formaPago}</p>
          <p style="margin:4px 0;font-size:.83rem;color:#555;">${resumen}${mas}</p>
        </div>
        <div style="text-align:right;">
          <span style="padding:4px 12px;border-radius:20px;font-size:.8rem;font-weight:600;${estadoStyle[p.estado]}">
            ${p.estado}
          </span>
          <p style="margin:8px 0 0;font-weight:700;font-size:1.1rem;padding-top:15px;">${fmt(p.total)}</p>
        </div>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('.order-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number((card as HTMLElement).dataset.id);
      openDetail(id);
    });
  });
};

const openDetail = (id: number) => {
  const p = allPedidos.find(pd => pd.id === id);
  if (!p) return;

  modalPedidoId.textContent = `Pedido #${p.id}`;
  const subtotal = p.detalles.reduce((a, d) => a + d.subtotal, 0);
  const envio = p.total - subtotal;

  modalBody.innerHTML = `
    <div style="margin-bottom:16px;">
      <span style="padding:4px 14px;border-radius:20px;font-size:.85rem;font-weight:600;${estadoStyle[p.estado]}">${p.estado}</span>
    </div>
    <p style="margin:4px 0;font-size:.9rem;"><strong>Fecha:</strong> ${p.fecha}</p>
    <p style="margin:4px 0;font-size:.9rem;"><strong>Método de pago:</strong> ${p.formaPago}</p>
    <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
    <h4 style="margin:0 0 10px;">Productos</h4>
    ${p.detalles.map(d => {
      const prod = allProductos.find(pr => pr.id === d.idProducto);
      return `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.9rem;">
        <span>${prod?.nombre ?? 'Producto #' + d.idProducto} x${d.cantidad}</span>
        <span>${fmt(d.subtotal)}</span>
      </div>`;
    }).join('')}
    <hr style="margin:12px 0;border:none;border-top:1px solid #eee;" />
    <div style="display:flex;justify-content:space-between;font-size:.9rem;margin-bottom:6px;">
      <span>Subtotal</span><span>${fmt(subtotal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.9rem;margin-bottom:6px;">
      <span>Envío</span><span>${fmt(envio >= 0 ? envio : 0)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.05rem;">
      <span>Total</span><span>${fmt(p.total)}</span>
    </div>
    ${p.estado === 'PENDIENTE' ? `<p style="margin-top:14px;font-size:.8rem;color:#92400e;background:#fef3c7;
      padding:8px 12px;border-radius:8px;">⏳ Tu pedido está siendo procesado.</p>` : ''}`;

  detailModal.style.display = 'flex';
};

document.getElementById('closeDetail')!.addEventListener('click', () => {
  detailModal.style.display = 'none';
});
detailModal.addEventListener('click', e => {
  if (e.target === detailModal) detailModal.style.display = 'none';
});

filterSelect.addEventListener('change', () => {
  const val = filterSelect.value as Estado | '';
  const filtered = val ? allPedidos.filter(p => p.estado === val) : allPedidos;
  renderOrders(filtered);
});

const init = async () => {
  try {
    allProductos = await getProductos();

    // Combina pedidos del JSON + los generados en localStorage por el carrito
    const fromJson = await getPedidos();
    const fromLocal: IPedido[] = JSON.parse(localStorage.getItem('foodstore_pedidos') || '[]');
    const combined = [...fromJson, ...fromLocal];

    // Solo pedidos del usuario en sesión
    allPedidos = combined.filter(p => p.idUsuario === session!.id);

    renderOrders(allPedidos);
  } catch (err) {
    ordersList.innerHTML = '<p style="color:#e53e3e;">Error al cargar pedidos.</p>';
    console.error(err);
  }
};

init();
