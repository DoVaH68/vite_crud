import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Producto } from '../types';

const initialForm = {
  nomProducto: '',
  cantidad: 0,
  precio: 0,
};

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarProductos = () => {
    setCargando(true);
    api.get<Producto[]>('/productos')
      .then(response => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de productos');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'cantidad' || name === 'precio' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/productos/${editandoId}`, form);
      } else {
        await api.post('/productos', form);
      }
      setForm(initialForm);
      setEditandoId(null);
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto');
    }
  };

  const handleEditar = (producto: Producto) => {
    setForm({
      nomProducto: producto.nomproducto,
      cantidad: producto.cantidad,
      precio: producto.precio,
    });
    setEditandoId(producto.id_producto);
  };

  const handleCancelar = () => {
    setForm(initialForm);
    setEditandoId(null);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto (puede estar en alguna venta)');
    }
  };

  if (cargando) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Productos</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <input
              type="text"
              name="nomProducto"
              className="form-control"
              placeholder="Nombre del producto"
              value={form.nomProducto}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              name="cantidad"
              className="form-control"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              name="precio"
              className="form-control"
              placeholder="Precio"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Actualizar' : 'Crear'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nomproducto}</td>
              <td>{p.cantidad}</td>
              <td>{p.precio}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(p)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(p.id_producto)}>
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

export default Productos;