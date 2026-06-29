// src/pages/store/home/home.ts
import type { IProducto, ICategoria } from '../../../types/types';
import { requireAuth, logout } from '../../../utils/auth';
import { getCategorias, getProductos } from '../../../utils/api';
import { addToCart, updateCartBadge } from '../../../utils/cart';

// Proteger ruta: solo USUARIO (si es ADMIN, también puede ver el catálogo)
const session = (() => {
  const s = localStorage.getItem('foodstore_session');
  if (!s) { window.location.href = '/src/pages/auth/login/login.html'; throw new Error(); }
  return JSON.parse(s);
})();

// Mostrar nombre y link admin si corresponde
const navUserName = document.getElementById('navUserName') as HTMLElement;
navUserName.textContent = `${session.nombre} ${session.apellido}`;
navUserName.style.cssText = 'font-size:.82rem;opacity:.85;margin-right:8px;';
if (session.rol === 'ADMIN') {
  (document.getElementById('adminLink') as HTMLElement).style.display = 'inline';
}

document.getElementById('logoutButton')!.addEventListener('click', () => {
  if (confirm('¿Cerrar sesión?')) logout();
});

// Estado
let allProducts: IProducto[] = [];
let allCategorias: ICategoria[] = [];
let activeCategoryId = 0; // 0 = Todos

// DOM
const grid = document.getElementById('product-grid') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
const categoryList = document.getElementById('category-list') as HTMLElement;
const sectionTitle = document.getElementById('section-title') as HTMLElement;
const productCount = document.getElementById('product-count') as HTMLElement;

// --- Render ---
const renderGrid = (items: IProducto[]) => {
  productCount.textContent = `${items.length} producto${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">
      No se encontraron productos para la búsqueda.</div>`;
    return;
  }

  grid.innerHTML = items.map(prod => {
    const cat = allCategorias.find(c => c.id === prod.categoriaId);
    const disponible = prod.disponible && prod.stock > 0;
    return `
      <div class="card">
        <div class="card-img">
          <img src="${prod.imagen}" alt="${prod.nombre}"
            onerror="this.src='https://placehold.co/400x180?text=Sin+imagen'" />
        </div>
        <div class="card-content">
          <span class="category-tag">${cat?.nombre?.toUpperCase() ?? 'SIN CAT.'}</span>
          <h3>${prod.nombre}</h3>
          <p>${prod.descripcion}</p>
          ${!disponible
            ? `<span style="background:#fee2e2;color:#991b1b;font-size:.75rem;padding:2px 8px;border-radius:12px;">
                ${prod.stock === 0 ? 'Sin stock' : 'No disponible'}</span>`
            : `<span style="background:#d1fae5;color:#065f46;font-size:.75rem;padding:2px 8px;border-radius:12px;">Disponible</span>`
          }
          <div class="card-footer">
            <span class="price">$${prod.precio.toLocaleString('es-AR')}</span>
            <button class="btn-add" data-id="${prod.id}" ${!disponible ? 'disabled style="opacity:.45;cursor:not-allowed;"' : ''}>
              + Agregar
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Eventos de botones
  grid.querySelectorAll('.btn-add:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLButtonElement).dataset.id);
      const product = allProducts.find(p => p.id === id);
      if (product) {
        addToCart(product);
        updateCartBadge();
        (btn as HTMLButtonElement).textContent = '✓ Agregado';
        setTimeout(() => { (btn as HTMLButtonElement).textContent = '+ Agregar'; }, 1200);
      }
    });
  });
};

// --- Filtrar y ordenar ---
const applyFilters = () => {
  let items = allProducts.filter(p => !p.eliminado && p.disponible);

  if (activeCategoryId !== 0) {
    items = items.filter(p => p.categoriaId === activeCategoryId);
  }

  const term = searchInput.value.toLowerCase().trim();
  if (term) {
    items = items.filter(p => p.nombre.toLowerCase().includes(term));
  }

  const sort = sortSelect.value;
  if (sort === 'az') items.sort((a, b) => a.nombre.localeCompare(b.nombre));
  else if (sort === 'za') items.sort((a, b) => b.nombre.localeCompare(a.nombre));
  else if (sort === 'asc') items.sort((a, b) => a.precio - b.precio);
  else if (sort === 'desc') items.sort((a, b) => b.precio - a.precio);

  renderGrid(items);
};

// --- Cargar datos ---
const init = async () => {
  try {
    // Fetch a /data/categorias.json y /data/productos.json
    [allCategorias, allProducts] = await Promise.all([getCategorias(), getProductos()]);

    // Render sidebar categorías
    const activeCats = allCategorias.filter(c => !c.eliminado);
    categoryList.innerHTML = `<li class="category-item active" data-id="0">Todos los productos</li>`;
    activeCats.forEach(cat => {
      const li = document.createElement('li');
      li.className = 'category-item';
      li.dataset.id = String(cat.id);
      li.textContent = cat.nombre;
      categoryList.appendChild(li);
    });

    categoryList.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.category-item') as HTMLElement;
      if (!target) return;
      document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
      target.classList.add('active');
      activeCategoryId = Number(target.dataset.id);
      const label = activeCategoryId === 0
        ? 'Todos los Productos'
        : allCategorias.find(c => c.id === activeCategoryId)?.nombre ?? '';
      sectionTitle.textContent = label;
      applyFilters();
    });

    applyFilters();
    updateCartBadge();
  } catch (err) {
    grid.innerHTML = `<div style="grid-column:1/-1;color:#e53e3e;padding:20px;">
      Error al cargar el catálogo. Recargá la página.</div>`;
    console.error(err);
  }
};

searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

init();