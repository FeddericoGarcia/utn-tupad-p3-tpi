// src/pages/admin/adminHome/adminHome.ts
import type { Estado } from '../../../types/types';
import { getSession, logout } from '../../../utils/auth';
import { getCategorias, getProductos, getPedidos } from '../../../utils/api';

const session = getSession();
if (!session || session.rol !== 'ADMIN') {
  window.location.href = '/src/pages/auth/login/login.html';
  throw new Error();
}

document.getElementById('adminName')!.textContent = `${session.nombre} ${session.apellido}`;
document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

const estadoBadge: Record<Estado, string> = {
  PENDIENTE:  'badge-yellow',
  CONFIRMADO: 'badge-blue',
  TERMINADO:  'badge-green',
  CANCELADO:  'badge-red',
};

const init = async () => {
  try {
    const [categorias, productos, pedidos] = await Promise.all([
      getCategorias(), getProductos(), getPedidos()
    ]);

    const catsActivas    = categorias.filter(c => !c.eliminado);
    const prodsActivos   = productos.filter(p => !p.eliminado);
    const prodsDisp      = prodsActivos.filter(p => p.disponible && p.stock > 0);
    const prodsNoDisp    = prodsActivos.filter(p => !p.disponible || p.stock === 0);
    const pedidosActivos = pedidos.filter(p => !('eliminado' in p) );

    // --- Tarjetas ---
    document.getElementById('statCategorias')!.textContent  = String(catsActivas.length);
    document.getElementById('statCatSub')!.textContent      = `de ${categorias.length} totales`;
    document.getElementById('statProductos')!.textContent   = String(prodsActivos.length);
    document.getElementById('statProdSub')!.textContent     = `de ${productos.length} totales`;
    document.getElementById('statPedidos')!.textContent     = String(pedidosActivos.length);
    document.getElementById('statPedSub')!.textContent      = `registrados`;
    document.getElementById('statDisponibles')!.textContent = String(prodsDisp.length);

    // --- Pedidos por estado ---
    const estados: Estado[] = ['PENDIENTE', 'CONFIRMADO', 'TERMINADO', 'CANCELADO'];
    document.getElementById('resumenPedidos')!.innerHTML = estados.map(est => {
      const count = pedidosActivos.filter(p => p.estado === est).length;
      return `<div class="summary-row">
        <span><span class="badge ${estadoBadge[est]}">${est}</span></span>
        <span>${count}</span>
      </div>`;
    }).join('');

    // --- Estado del catálogo ---
    document.getElementById('resumenProductos')!.innerHTML = `
      <div class="summary-row"><span>Productos activos</span><span>${prodsActivos.length}</span></div>
      <div class="summary-row"><span>Disponibles con stock</span><span style="color:#065f46;">${prodsDisp.length}</span></div>
      <div class="summary-row"><span>Sin stock / no disponibles</span><span style="color:#991b1b;">${prodsNoDisp.length}</span></div>
      <div class="summary-row"><span>Categorías activas</span><span>${catsActivas.length}</span></div>`;

    // --- Facturación ---
    const terminados = pedidosActivos.filter(p => p.estado === 'TERMINADO');
    const totalFact  = terminados.reduce((a, p) => a + (p.total ?? 0), 0);
    const pendTotal  = pedidosActivos
      .filter(p => p.estado === 'PENDIENTE')
      .reduce((a, p) => a + (p.total ?? 0), 0);

    document.getElementById('resumenFacturacion')!.innerHTML = `
      <div class="summary-row"><span>Total facturado</span><span style="color:#065f46;font-size:1.05rem;">${fmt(totalFact)}</span></div>
      <div class="summary-row"><span>Pedidos terminados</span><span>${terminados.length}</span></div>
      <div class="summary-row"><span>En espera (PENDIENTE)</span><span>${fmt(pendTotal)}</span></div>`;

  } catch (err) {
    console.error('Error al cargar dashboard:', err);
  }
};

init();
