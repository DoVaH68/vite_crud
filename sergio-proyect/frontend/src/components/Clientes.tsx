import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Cliente } from '../types';

const initialForm = {
  nomCliente: '',
  contacto: '',
  departamento: '',
  ciudad: '',
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarClientes = () => {
    setCargando(true);
    api.get<Cliente[]>('/clientes')
      .then(response => {
        setClientes(response.data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudo cargar la lista de clientes');
        setCargando(false);
        console.error(err);
      });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm(initialForm);
      setEditandoId(null);
      cargarClientes();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el cliente');
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setForm({
      nomCliente: cliente.nomcliente,
      contacto: cliente.contacto,
      departamento: cliente.departamento,
      ciudad: cliente.ciudad,
    });
    setEditandoId(cliente.id_cliente);
  };

  const handleCancelar = () => {
    setForm(initialForm);
    setEditandoId(null);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      cargarClientes();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el cliente (puede tener ventas asociadas)');
    }
  };

  if (cargando) return <p>Cargando clientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Clientes</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              name="nomCliente"
              className="form-control"
              placeholder="Nombre"
              value={form.nomCliente}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="contacto"
              className="form-control"
              placeholder="Contacto"
              value={form.contacto}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              name="departamento"
              className="form-control"
              placeholder="Departamento"
              value={form.departamento}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              name="ciudad"
              className="form-control"
              placeholder="Ciudad"
              value={form.ciudad}
              onChange={handleChange}
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
            <th>Contacto</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td>
              <td>{c.nomcliente}</td>
              <td>{c.contacto}</td>
              <td>{c.departamento}</td>
              <td>{c.ciudad}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(c)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(c.id_cliente)}>
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

export default Clientes;