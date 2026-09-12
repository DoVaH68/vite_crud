const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id_cliente');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los clientes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el cliente' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nomCliente, contacto, departamento, ciudad } = req.body;
    const result = await pool.query(
      'INSERT INTO clientes (nomCliente, contacto, departamento, ciudad) VALUES ($1, $2, $3, $4) RETURNING *',
      [nomCliente, contacto, departamento, ciudad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el cliente' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomCliente, contacto, departamento, ciudad } = req.body;
    const result = await pool.query(
      'UPDATE clientes SET nomCliente=$1, contacto=$2, departamento=$3, ciudad=$4 WHERE id_cliente=$5 RETURNING *',
      [nomCliente, contacto, departamento, ciudad, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE id_cliente=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el cliente' });
  }
});

module.exports = router;