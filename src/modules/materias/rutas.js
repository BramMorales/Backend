const express = require("express");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");

router.get('/:nombre_carrera', materias);

async function materias(req, res) {
  try {
    const { nombre_carrera } = req.params;

    const items = await controlador.todos("MateriasCarrera", nombre_carrera);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}


module.exports = router;
