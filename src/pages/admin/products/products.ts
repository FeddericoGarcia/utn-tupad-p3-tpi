// src/pages/admin/products/products.ts
import type { IProducto, ICategoria } from '../../../types/types';
import { getSession, logout } from '../../../utils/auth';
import {
  loadAll, listProductos, listCategorias,
  createProducto, updateProducto, deleteProducto
} from '../../../utils/store';

const session = getSession();
if (!session || session.rol !== 'ADMIN') {
  window.location.href = '/src/pages/auth/login/login.html';
  throw new Error();
}
document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

// DOM
const prodBody      = document.getElementById('prodBody') as HTMLElement;
const modalOverlay  = document.getElementById('modalOverlay') as HTMLElement;
const modalTitle    = document.getElementById('modalTitle') as HTMLElement;
const editIdInput   = document.getElementById('editId') as HTMLInputElement;
const inputNombre   = document.getElementById('inputNombre') as HTMLInputElement;
const inputDesc     = document.getElementById('inputDesc') as HTMLTextAreaElement;
const inputPrecio   = document.getElementById('inputPrecio') as HTMLInputElement;
const inputStock    = document.getElementById('inputStock') as HTMLInputElement;
const inputCat      = document.getElementById('inputCategoria') as HTMLSelectElement;
const inputImg      = document.getElementById('inputImg') as HTMLInputElement;
const inputDisp     = document.getElementById('inputDisponible') as HTMLInputElement;
const formError     = document.getElementById('formError') as HTMLElement;

const fmt = (n: number) => `$${n.toLocaleString('es-AR')}`;

// --- Render tabla ---
const renderTable = () => {
  const prods = listProductos();
  const cats  = listCategorias();

  if (prods.length === 0) {
    prodBody.innerHTML = `<tr><td colspan="9" style="color:#aaa;text-align:center;padding:24px;">
      No hay productos activos.</td></tr>`;
    return;
  }

  prodBody.innerHTML = prods.map(p => {
    const catNombre = cats.find(c => c.id === p.categoriaId)?.nombre ?? '—';
    const dispBadge = p.disponible && p.stock > 0
      ? `<span class="badge-disp">Disponible</span>`
      : `<span class="badge-nodisp">${p.stock === 0 ? 'Sin stock' : 'No disp.'}</span>`;
    return `<tr>
      <td>${p.id}</td>
      <td><img src="${p.imagen || 'https://placehold.co/44?text=?'}"
        onerror="this.src='https://placehold.co/44?text=?'" alt="${p.nombre}" /></td>
      <td><strong>${p.nombre}</strong></td>
      <td style="color:#666;font-size:.82rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
        title="${p.descripcion}">${p.descripcion || '—'}</td>
      <td>${fmt(p.precio)}</td>
      <td>${catNombre}</td>
      <td>${p.stock}</td>
      <td>${dispBadge}</td>
      <td style="white-space:nowrap;">
        <button class="btn-edit" data-id="${p.id}">Editar</button>
        <button class="btn-delete" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>`;
  }).join('');

  prodBody.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', () => openEdit(Number((btn as HTMLElement).dataset.id)))
  );
  prodBody.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', () => handleDelete(Number((btn as HTMLElement).dataset.id)))
  );
};

// --- Poblar select de categorías ---
const populateCatSelect = (selectedId?: number) => {
  const cats = listCategorias();
  inputCat.innerHTML = cats.map(c =>
    `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nombre}</option>`
  ).join('');
};

// --- Abrir modal ---
const openModal = (title: string, prod?: IProducto) => {
  modalTitle.textContent = title;
  formError.style.display = 'none';
  editIdInput.value    = prod ? String(prod.id) : '';
  inputNombre.value    = prod?.nombre ?? '';
  inputDesc.value      = prod?.descripcion ?? '';
  inputPrecio.value    = prod ? String(prod.precio) : '';
  inputStock.value     = prod ? String(prod.stock) : '';
  inputImg.value       = prod?.imagen ?? '';
  inputDisp.checked    = prod ? prod.disponible : true;
  populateCatSelect(prod?.categoriaId);
  modalOverlay.style.display = 'flex';
  inputNombre.focus();
};

const closeModal = () => { modalOverlay.style.display = 'none'; };

const openEdit = (id: number) => {
  const prod = listProductos().find(p => p.id === id);
  if (prod) openModal('Editar Producto', prod);
};

document.getElementById('btnNuevo')!.addEventListener('click', () => {
  if (listCategorias().length === 0) {
    alert('Primero creá al menos una categoría antes de agregar productos.');
    return;
  }
  openModal('Nuevo Producto');
});
document.getElementById('btnCancelar')!.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// --- Guardar ---
document.getElementById('btnGuardar')!.addEventListener('click', () => {
  formError.style.display = 'none';

  const nombre  = inputNombre.value.trim();
  const precio  = parseFloat(inputPrecio.value);
  const stock   = parseInt(inputStock.value, 10);
  const catId   = Number(inputCat.value);

  if (!nombre) {
    formError.textContent = 'El nombre es obligatorio.'; formError.style.display = 'block'; return;
  }
  if (isNaN(precio) || precio <= 0) {
    formError.textContent = 'El precio debe ser mayor a 0.'; formError.style.display = 'block'; return;
  }
  if (isNaN(stock) || stock < 0) {
    formError.textContent = 'El stock no puede ser negativo.'; formError.style.display = 'block'; return;
  }
  if (!catId) {
    formError.textContent = 'Seleccioná una categoría.'; formError.style.display = 'block'; return;
  }

  const data = {
    nombre,
    descripcion: inputDesc.value.trim(),
    precio,
    stock,
    categoriaId: catId,
    imagen: inputImg.value.trim() || 'https://placehold.co/400?text=Sin+imagen',
    disponible: inputDisp.checked
  };

  const id = editIdInput.value;
  if (id) {
    updateProducto(Number(id), data);
  } else {
    createProducto(data);
  }

  closeModal();
  renderTable();
});

// --- Eliminar (baja lógica) ---
const handleDelete = (id: number) => {
  const prod = listProductos().find(p => p.id === id);
  if (!prod) return;
  if (!confirm(`¿Dar de baja el producto "${prod.nombre}"?`)) return;
  deleteProducto(id);
  renderTable();
};

// Init
const init = async () => {
  await loadAll();
  renderTable();
};
init();
