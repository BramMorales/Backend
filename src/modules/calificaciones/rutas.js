const express = require("express");
const multer = require("multer");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");
const upload = multer({ dest: "uploads/" });
const jwtMiddleware = require("../../middleware/jwtMiddleware")

router.post("/importar", jwtMiddleware, upload.single("file"), importarCalificaciones);
router.get('/', calificaciones);

async function calificaciones(req, res) {
  try {
    const items = await controlador.todos("calificacionexamen");
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function importarCalificaciones(req, res) {
  try {
    const id = req.user.id_usuarioexamen;
    const rol = req.user.tiporol_authexamen;

    const items = await controlador.importarCalificacionesC(req, id, rol);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    console.error(err);
    respuesta.error(req, res, err.message, 500);
  }
}

module.exports = router;
