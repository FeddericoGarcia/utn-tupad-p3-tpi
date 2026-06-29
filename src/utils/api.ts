// src/utils/api.ts — capa de fetch a JSONs locales
// Al integrar el backend, reemplazar cada URL con el endpoint de la API REST correspondiente

import type { ICategoria, IProducto, IUsuario, IPedido } from '../types/types';

export const getCategorias = async (): Promise<ICategoria[]> => {
  const res = await fetch('/data/categorias.json');
  return res.json();
};

export const getProductos = async (): Promise<IProducto[]> => {
  const res = await fetch('/data/productos.json');
  return res.json();
};

export const getUsuarios = async (): Promise<IUsuario[]> => {
  const res = await fetch('/data/usuarios.json');
  return res.json();
};

export const getPedidos = async (): Promise<IPedido[]> => {
  const res = await fetch('/data/pedidos.json');
  return res.json();
};
