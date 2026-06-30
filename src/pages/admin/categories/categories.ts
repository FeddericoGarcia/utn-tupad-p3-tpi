// src/pages/admin/categories/categories.ts
import type { ICategoria } from '../../../types/types';
import { getSession, logout } from '../../../utils/auth';
import { loadAll, listCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../../utils/store';

const session = getSession();
if (!session || session.rol !== 'ADMIN') {
  window.location.href = '/src/pages/auth/login/login.html';
  throw new Error();
}
document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

// DOM
const catBody      = document.getElementById('catBody') as HTMLElement;
const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
const modalTitle   = document.getElementById('modalTitle') as HTMLElement;
const editIdInput  = document.getElementById('editId') as HTMLInputElement;
const inputNombre  = document.getElementById('inputNombre') as HTMLInputElement;
const inputDesc    = document.getElementById('inputDesc') as HTMLTextAreaElement;
const inputImg     = document.getElementById('inputImg') as HTMLInputElement;
const formError    = document.getElementById('formError') as HTMLElement;

// --- Render tabla ---
const renderTable = () => {
  const cats = listCategorias();
  if (cats.length === 0) {
    catBody.innerHTML = `<tr><td colspan="5" style="color:#aaa;text-align:center;padding:24px;">
      No hay categorías activas.</td></tr>`;
    return;
  }
  catBody.innerHTML = cats.map(c => `
    <tr>
      <td>${c.id}</td>
      <td><img src="${c.imagen || 'https://placehold.co/48?text=?'}"
        onerror="this.src='https://placehold.co/48?text=?'" alt="${c.nombre}" /></td>
      <td><strong>${c.nombre}</strong></td>
      <td style="color:#666;font-size:.85rem;">${c.descripcion || '—'}</td>
      <td>
        <button class="btn-edit" data-id="${c.id}">Editar</button>
        <button class="btn-delete" data-id="${c.id}">Eliminar</button>
      </td>
    </tr>`).join('');

  catBody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => openEdit(Number((btn as HTMLElement).dataset.id)));
  });
  catBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => handleDelete(Number((btn as HTMLElement).dataset.id)));
  });
};

// --- Abrir modal ---
const openModal = (title: string, cat?: ICategoria) => {
  modalTitle.textContent = title;
  formError.style.display = 'none';
  editIdInput.value  = cat ? String(cat.id) : '';
  inputNombre.value  = cat?.nombre ?? '';
  inputDesc.value    = cat?.descripcion ?? '';
  inputImg.value     = cat?.imagen ?? '';
  modalOverlay.style.display = 'flex';
  inputNombre.focus();
};

const closeModal = () => { modalOverlay.style.display = 'none'; };

const openEdit = (id: number) => {
  const cat = listCategorias().find(c => c.id === id);
  if (cat) openModal('Editar Categoría', cat);
};

document.getElementById('btnNueva')!.addEventListener('click', () => openModal('Nueva Categoría'));
document.getElementById('btnCancelar')!.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// --- Guardar ---
document.getElementById('btnGuardar')!.addEventListener('click', () => {
  formError.style.display = 'none';

  const nombre = inputNombre.value.trim();
  if (!nombre) {
    formError.textContent = 'El nombre es obligatorio.';
    formError.style.display = 'block';
    return;
  }

  const id = editIdInput.value;
  if (id) {
    updateCategoria(Number(id), {
      nombre,
      descripcion: inputDesc.value.trim(),
      imagen: inputImg.value.trim() || 'https://placehold.co/400?text=Sin+imagen'
    });
  } else {
    createCategoria({
      nombre,
      descripcion: inputDesc.value.trim(),
      imagen: inputImg.value.trim() || 'https://placehold.co/400?text=Sin+imagen'
    });
  }

  closeModal();
  renderTable();
});

// --- Eliminar (baja lógica) ---
const handleDelete = (id: number) => {
  const cat = listCategorias().find(c => c.id === id);
  if (!cat) return;
  if (!confirm(`¿Dar de baja la categoría "${cat.nombre}"?\nSus productos seguirán en el sistema.`)) return;
  deleteCategoria(id);
  renderTable();
};

// Init
const init = async () => {
  await loadAll();
  renderTable();
};
init();
