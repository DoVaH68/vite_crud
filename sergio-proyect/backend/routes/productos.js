const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id_producto');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM productos WHERE id_producto = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nomProducto, cantidad, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO productos (nomProducto, cantidad, precio) VALUES ($1, $2, $3) RETURNING *',
      [nomProducto, cantidad, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomProducto, cantidad, precio } = req.body;
    const result = await pool.query(
      'UPDATE productos SET nomProducto=$1, cantidad=$2, precio=$3 WHERE id_producto=$4 RETURNING *',
      [nomProducto, cantidad, precio, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el producto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM productos WHERE id_producto=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
});

module.exports = router;