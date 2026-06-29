// src/types/types.ts — definiciones centrales del proyecto

export type Rol = 'ADMIN' | 'USUARIO';
export type Estado = 'PENDIENTE' | 'CONFIRMADO' | 'TERMINADO' | 'CANCELADO';
export type FormaPago = 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO';

export interface ICategoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  eliminado: boolean;
}

export interface IProducto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  eliminado: boolean;
  categoriaId: number;
}

export interface IUsuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  password: string;
  rol: Rol;
}

export interface IDetalle {
  idProducto: number;
  cantidad: number;
  subtotal: number;
}

export interface IPedido {
  id: number;
  fecha: string;
  estado: Estado;
  total: number;
  formaPago: FormaPago;
  idUsuario: number;
  detalles: IDetalle[];
}

export interface ICartItem extends IProducto {
  cantidad: number;
}

// Usuario en sesión (sin password)
export interface ISession {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: Rol;
}
