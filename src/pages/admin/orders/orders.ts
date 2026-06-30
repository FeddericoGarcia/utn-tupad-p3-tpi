// src/pages/admin/orders/orders.ts
import type { IPedido, IUsuario, IProducto, Estado } from '../../../types/types';
import { getSession, logout } from '../../../utils/auth';
import { getPedidos, getUsuarios, getProductos } from '../../../utils/api';
import { loadAll, listPedidos, updatePedidoEstado } from '../../../utils/store';

const session = getSession();
if (!session || session.rol !== 'ADMIN') {
  window.location.href = '/src/pages/auth/login/login.html';
  throw new Error();
}
document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

// DOM
const ordersBody   = document.getElementById('ordersBody') as HTMLElement;
const filterEstado = document.getElementById('filterEstado') as HTMLSelectElement;
const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
const modalTitle   = document.getElementById('modalTitle') as HTMLElement;
const modalBody    = document.getElementById('modalBody') as HTMLElement;

let allPedidos:   IPedido[]  = [];
let allUsuarios:  IUsuario[] = [];
let allProductos: IProducto[] = [];

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

const estadoClass: Record<Estado, string> = {
  PENDIENTE:  'badge-PENDIENTE',
  CONFIRMADO: 'badge-CONFIRMADO',
  TERMINADO:  'badge-TERMINADO',
  CANCELADO:  'badge-CANCELADO',
};

const getNombreUsuario = (idUsuario: number): string => {
  const u = allUsuarios.find(u => u.id === idUsuario);
  return u ? `${u.nombre} ${u.apellido}` : `Usuario #${idUsuario}`;
};

// --- Render tabla ---
const renderTable = (pedidos: IPedido[]) => {
  if (pedidos.length === 0) {
    ordersBody.innerHTML = `<tr><td colspan="6" style="color:#aaa;text-align:center;padding:24px;">
      No hay pedidos para mostrar.</td></tr>`;
    return;
  }

  // Ordenar por fecha más reciente primero
  const sorted = [...pedidos].sort((a, b) => b.fecha.localeCompare(a.fecha));

  ordersBody.innerHTML = sorted.map(p => {
    const cantProds = p.detalles.reduce((a, d) => a + d.cantidad, 0);
    return `<tr data-id="${p.id}" class="order-row">
      <td><strong>#${p.id}</strong></td>
      <td>${getNombreUsuario(p.idUsuario)}</td>
      <td>${p.fecha}</td>
      <td><span class="badge ${estadoClass[p.estado]}">${p.estado}</span></td>
      <td>${cantProds} ítem${cantProds !== 1 ? 's' : ''}</td>
      <td><strong>${fmt(p.total)}</strong></td>
    </tr>`;
  }).join('');

  ordersBody.querySelectorAll('.order-row').forEach(row => {
    row.addEventListener('click', () => {
      openDetail(Number((row as HTMLElement).dataset.id));
    });
  });
};

// --- Modal detalle ---
const openDetail = (id: number) => {
  // Buscar en store (tiene cambios en memoria) o en allPedidos
  const p = listPedidos().find(pd => pd.id === id) ?? allPedidos.find(pd => pd.id === id);
  if (!p) return;

  modalTitle.textContent = `Detalle del Pedido #${p.id}`;
  const subtotal = p.detalles.reduce((a, d) => a + d.subtotal, 0);
  const envio    = p.total - subtotal;
  const cliente  = getNombreUsuario(p.idUsuario);

  modalBody.innerHTML = `
    <div class="detail-row"><span>Cliente</span><span>${cliente}</span></div>
    <div class="detail-row"><span>Fecha</span><span>${p.fecha}</span></div>
    <div class="detail-row"><span>Forma de pago</span><span>${p.formaPago}</span></div>
    <hr />
    <h4 style="margin:0 0 10px;font-size:.9rem;">Productos</h4>
    ${p.detalles.map(d => {
      const prod = allProductos.find(pr => pr.id === d.idProducto);
      return `<div class="detail-row">
        <span>${prod?.nombre ?? 'Producto #' + d.idProducto} × ${d.cantidad}</span>
        <span>${fmt(d.subtotal)}</span>
      </div>`;
    }).join('')}
    <hr />
    <div class="detail-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="detail-row"><span>Envío</span><span>${fmt(envio >= 0 ? envio : 0)}</span></div>
    <div class="detail-row" style="font-size:1rem;">
      <span><strong>Total</strong></span><span><strong>${fmt(p.total)}</strong></span>
    </div>
    <hr />
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px;">
      <span style="font-size:.88rem;font-weight:600;">Cambiar estado:</span>
      <select id="selectEstado" class="estado-select">
        ${(['PENDIENTE','CONFIRMADO','TERMINADO','CANCELADO'] as Estado[]).map(e =>
          `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${e}</option>`
        ).join('')}
      </select>
      <button class="btn-save-estado" id="btnGuardarEstado" data-id="${p.id}">
        Guardar
      </button>
    </div>`;

  modalOverlay.style.display = 'flex';

  document.getElementById('btnGuardarEstado')!.addEventListener('click', () => {
    const nuevoEstado = (document.getElementById('selectEstado') as HTMLSelectElement).value as Estado;
    updatePedidoEstado(p.id, nuevoEstado);
    // Actualizar también en allPedidos para que el filtro lo refleje
    const idx = allPedidos.findIndex(pd => pd.id === p.id);
    if (idx !== -1) allPedidos[idx].estado = nuevoEstado;
    modalOverlay.style.display = 'none';
    applyFilter();
    alert(`✅ Pedido #${p.id} actualizado a ${nuevoEstado}`);
  });
};

const closeModal = () => { modalOverlay.style.display = 'none'; };
document.getElementById('btnClose')!.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// --- Filtro ---
const applyFilter = () => {
  const val = filterEstado.value as Estado | '';
  const filtered = val ? allPedidos.filter(p => p.estado === val) : allPedidos;
  renderTable(filtered);
};
filterEstado.addEventListener('change', applyFilter);

// --- Init ---
const init = async () => {
  try {
    await loadAll();
    [allUsuarios, allProductos] = await Promise.all([getUsuarios(), getProductos()]);

    // Combinar pedidos del JSON + los generados por el carrito en localStorage
    const fromJson   = await getPedidos();
    const fromLocal: IPedido[] = JSON.parse(localStorage.getItem('foodstore_pedidos') || '[]');
    // Fusionar sin duplicados por id
    const ids = new Set(fromJson.map(p => p.id));
    allPedidos = [...fromJson, ...fromLocal.filter(p => !ids.has(p.id))];

    applyFilter();
  } catch (err) {
    ordersBody.innerHTML = '<tr><td colspan="6" style="color:#e53e3e;">Error al cargar pedidos.</td></tr>';
    console.error(err);
  }
};

init();
