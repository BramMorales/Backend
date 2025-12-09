const express = require("express");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");
const jwtMiddleware = require('../../middleware/jwtMiddleware');

router.get('/', jwtMiddleware, logs); 
router.post('/ingresar', jwtMiddleware, ingresar);

async function logs(req, res) {
  try {
    const id = req.user.id_usuarioexamen;
    const rol = req.user.tiporol_authexamen;  

    let items;

    if (rol === 1) {
      items = await controlador.todos();
    } 
    else if (rol === 2 || rol === 3) {
      items = await controlador.logsXUsuario(id);
    } 
    else {
      return respuesta.error(req, res, "Rol no reconocido", 403);
    }
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function ingresar(req, res) {
  try {    
    const id = req.user.id_usuarioexamen;

    const items = await controlador.ingresar(id, req.body);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

module.exports = router;
