const express = require("express");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");

router.get('/', carreras);

async function carreras(req, res) {
  try {
    const items = await controlador.todos("carreraexamen");
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}


module.exports = router;
