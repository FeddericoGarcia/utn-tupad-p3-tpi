// src/utils/store.ts
// Estado en memoria para operaciones CRUD del admin.
// Las modificaciones se aplican aquí; al recargar se vuelve al JSON.
// En la siguiente iteración, reemplazar por llamadas a la API REST.

import type { ICategoria, IProducto, IPedido } from '../types/types';
import { getCategorias, getProductos, getPedidos } from './api';

let categorias: ICategoria[] = [];
let productos: IProducto[] = [];
let pedidos: IPedido[] = [];
let loaded = false;

export const loadAll = async (): Promise<void> => {
  if (loaded) return;
  [categorias, productos, pedidos] = await Promise.all([
    getCategorias(), getProductos(), getPedidos()
  ]);
  loaded = true;
};

// --- Categorías ---
export const listCategorias = () => categorias.filter(c => !c.eliminado);
export const createCategoria = (data: Omit<ICategoria, 'id' | 'eliminado'>): ICategoria => {
  const newId = Math.max(0, ...categorias.map(c => c.id)) + 1;
  const cat: ICategoria = { id: newId, eliminado: false, ...data };
  categorias.push(cat);
  return cat;
};
export const updateCategoria = (id: number, data: Partial<ICategoria>): void => {
  const idx = categorias.findIndex(c => c.id === id);
  if (idx !== -1) categorias[idx] = { ...categorias[idx], ...data };
};
export const deleteCategoria = (id: number): void => {
  const idx = categorias.findIndex(c => c.id === id);
  if (idx !== -1) categorias[idx].eliminado = true;
};

// --- Productos ---
export const listProductos = () => productos.filter(p => !p.eliminado);
export const createProducto = (data: Omit<IProducto, 'id' | 'eliminado'>): IProducto => {
  const newId = Math.max(0, ...productos.map(p => p.id)) + 1;
  const prod: IProducto = { id: newId, eliminado: false, ...data };
  productos.push(prod);
  return prod;
};
export const updateProducto = (id: number, data: Partial<IProducto>): void => {
  const idx = productos.findIndex(p => p.id === id);
  if (idx !== -1) productos[idx] = { ...productos[idx], ...data };
};
export const deleteProducto = (id: number): void => {
  const idx = productos.findIndex(p => p.id === id);
  if (idx !== -1) productos[idx].eliminado = true;
};

// --- Pedidos ---
export const listPedidos = () => pedidos.filter(p => !p.eliminado);
// @ts-ignore
export const updatePedidoEstado = (id: number, estado: IPedido['estado']): void => {
  const idx = pedidos.findIndex(p => p.id === id);
  if (idx !== -1) pedidos[idx].estado = estado;
};
