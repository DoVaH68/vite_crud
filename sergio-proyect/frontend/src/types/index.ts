export interface Cliente {
  id_cliente: number;
  nomcliente: string;
  contacto: string;
  departamento: string;
  ciudad: string;
}

export interface Producto {
  id_producto: number;
  nomproducto: string;
  cantidad: number;
  precio: number;
}

export interface Venta {
  id_venta: number;
  id_cliente: number;
  nomcliente: string;
  fecha_venta: string;
  total: number;
  estado: string;
}

export interface DetalleVenta {
  id_detalle: number;
  id_producto: number;
  nomproducto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaDetalle extends Venta {
  detalle: DetalleVenta[];
}

export interface ProductoVenta {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}