const express = require('express');
const router = express.Router();
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const multer = require("multer");
const jwtMiddleware = require('../../middleware/jwtMiddleware');
const upload = multer({ dest: "uploads/" });

router.post('/registrar', agregar);
router.put('/modificar/:id_usuarioexamen', modificar);
router.get('/', jwtMiddleware, alumnos);
router.get('/todos', todos);
router.get('/:id_usuarioexamen', alumnosCalificacion);

async function modificar(req, res) {
  try {
    const { id_usuarioexamen } = req.params;
    const data = req.body;

    const result = await controlador.modificar(id_usuarioexamen, data);

    const mensaje = "Item actualizado con éxito";
    respuesta.success(req, res, { mensaje, id: id_usuarioexamen }, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}


async function agregar(req, res, next) {
  try {
    const result = await controlador.agregar(req, res, req.body);
    const mensaje = "Item guardado con éxito";
    respuesta.success(req, res, { mensaje, id: result?.id || req.body.id }, 201);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function todos(req, res) {
  try {
    const items = await controlador.todos("usuarioexamen");
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function alumnos(req, res) {
  try {
    const rol = req.user.tiporol_authexamen;    
    const id = req.user.id_usuarioexamen;

    let items;

    if (rol === 1) {
      items = await controlador.alumnos_ADMIN();
    } 
    else if (rol === 2) {
      items = await controlador.alumnos_PROFESOR(id);
    } 
    else if (rol === 3) {
      items = await controlador.alumnosCalificacion(id);
    }
    else {
      return respuesta.error(req, res, "Rol no reconocido", 403);
    }

    respuesta.success(req, res, items, 200);
    
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

async function alumnosCalificacion(req, res) {
  try {
    const items = await controlador.alumnosCalificacion(req.params.id_estudianteexamen);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    respuesta.error(req, res, err.message, 500);
  }
}

module.exports = router;