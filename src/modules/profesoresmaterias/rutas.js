const express = require("express");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");

router.get('/', profesoresxmaterias);
router.post('/asignar', asignar);

async function profesoresxmaterias(req, res) {
  try {
    const items = await controlador.todos("profesormateria");
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function asignar(req, res) {
  try {
    const items = await controlador.asignar(req.body);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

module.exports = router;
