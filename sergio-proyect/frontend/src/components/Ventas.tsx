import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Venta, Cliente, Producto, ProductoVenta } from '../types';

function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [idCliente, setIdCliente] = useState<number | ''>('');
  const [estado, setEstado] = useState('pendiente');
  const [lineas, setLineas] = useState<ProductoVenta[]>([
    { id_producto: 0, cantidad: 1, precio_unitario: 0 },
  ]);

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([
      api.get<Venta[]>('/ventas'),
      api.get<Cliente[]>('/clientes'),
      api.get<Producto[]>('/productos'),
    ])
      .then(([ventasRes, clientesRes, productosRes]) => {
        setVentas(ventasRes.data);
        setClientes(clientesRes.data);
        setProductos(productosRes.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la información');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleLineaChange = (index: number, campo: keyof ProductoVenta, valor: number) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = { ...nuevasLineas[index], [campo]: valor };

    // Si cambia el producto, autocompletar el precio unitario
    if (campo === 'id_producto') {
      const productoSeleccionado = productos.find(p => p.id_producto === valor);
      if (productoSeleccionado) {
        nuevasLineas[index].precio_unitario = Number(productoSeleccionado.precio);
      }
    }

    setLineas(nuevasLineas);
  };

  const agregarLinea = () => {
    setLineas([...lineas, { id_producto: 0, cantidad: 1, precio_unitario: 0 }]);
  };

  const eliminarLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const totalCalculado = lineas.reduce(
    (acc, l) => acc + l.cantidad * l.precio_unitario,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCliente) {
      alert('Selecciona un cliente');
      return;
    }

    const lineasValidas = lineas.filter(l => l.id_producto > 0 && l.cantidad > 0);
    if (lineasValidas.length === 0) {
      alert('Agrega al menos un producto válido');
      return;
    }

    try {
      await api.post('/ventas', {
        id_cliente: idCliente,
        estado,
        productos: lineasValidas,
      });

      setIdCliente('');
      setEstado('pendiente');
      setLineas([{ id_producto: 0, cantidad: 1, precio_unitario: 0 }]);
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert('Error al crear la venta');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta venta?')) return;
    try {
      await api.delete(`/ventas/${id}`);
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la venta');
    }
  };

  if (cargando) return <p>Cargando ventas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Ventas</h2>

      <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded">
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Cliente</label>
            <select
              className="form-select"
              value={idCliente}
              onChange={e => setIdCliente(Number(e.target.value))}
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nomcliente}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={estado}
              onChange={e => setEstado(e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <h5>Productos</h5>
        {lineas.map((linea, index) => (
          <div className="row g-2 mb-2 align-items-end" key={index}>
            <div className="col-md-4">
              <label className="form-label">Producto</label>
              <select
                className="form-select"
                value={linea.id_producto}
                onChange={e => handleLineaChange(index, 'id_producto', Number(e.target.value))}
              >
                <option value={0}>Selecciona un producto</option>
                {productos.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nomproducto} (stock: {p.cantidad})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={linea.cantidad}
                onChange={e => handleLineaChange(index, 'cantidad', Number(e.target.value))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Precio unitario</label>
              <input
                type="number"
                className="form-control"
                value={linea.precio_unitario}
                onChange={e => handleLineaChange(index, 'precio_unitario', Number(e.target.value))}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => eliminarLinea(index)}
                disabled={lineas.length === 1}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mt-2 me-2" onClick={agregarLinea}>
          + Agregar producto
        </button>

        <p className="mt-3 fw-bold">Total: {totalCalculado}</p>

        <button type="submit" className="btn btn-success">
          Crear venta
        </button>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id_venta}>
              <td>{v.id_venta}</td>
              <td>{v.nomcliente}</td>
              <td>{new Date(v.fecha_venta).toLocaleDateString()}</td>
              <td>{v.total}</td>
              <td>{v.estado}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(v.id_venta)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ventas;