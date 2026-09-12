const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
             c.id_cliente, c.nomCliente
      FROM ventas v
      JOIN clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venta
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las ventas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await pool.query(`
      SELECT v.id_venta, v.fecha_venta, v.total, v.estado,
             c.id_cliente, c.nomCliente
      FROM ventas v
      JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = $1
    `, [id]);

    if (venta.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    const detalle = await pool.query(`
      SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, dv.subtotal,
             p.id_producto, p.nomProducto
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = $1
    `, [id]);

    res.json({ ...venta.rows[0], detalle: detalle.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la venta' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_cliente, estado, productos } = req.body;

    await client.query('BEGIN');

    const total = productos.reduce((acc, p) => acc + p.cantidad * p.precio_unitario, 0);

    const ventaResult = await client.query(
      'INSERT INTO ventas (id_cliente, estado, total) VALUES ($1, $2, $3) RETURNING *',
      [id_cliente, estado || 'pendiente', total]
    );
    const id_venta = ventaResult.rows[0].id_venta;

    for (const p of productos) {
      const subtotal = p.cantidad * p.precio_unitario;
      await client.query(
        'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [id_venta, p.id_producto, p.cantidad, p.precio_unitario, subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(ventaResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la venta' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM detalle_venta WHERE id_venta=$1', [id]);
    const result = await client.query('DELETE FROM ventas WHERE id_venta=$1 RETURNING *', [id]);
    await client.query('COMMIT');
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }
    res.json({ mensaje: 'Venta eliminada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la venta' });
  } finally {
    client.release();
  }
});

module.exports = router;