const express = require("express");
const router = express.Router();
const controlador = require("./index");
const respuesta = require("../../red/respuestas");
const config = require("../../config");

router.post("/login", login);
router.post("/logout", logout);

async function login(req, res) {
  const { usuario_authexamen, password_authexamen } = req.body;

  if (!usuario_authexamen || !password_authexamen) {
    return respuesta.error(req, res, "Usuario y contraseña son requeridos", 400);
  }

  try {
    const { token, cookieOptions } = await controlador.login(usuario_authexamen, password_authexamen);
    res.cookie("jwt", token, cookieOptions);
    return respuesta.success(req, res, { token }, 200);
  } catch (err) {
    return respuesta.error(req, res, err.message || "Error en autenticación", 401);
  }
}

async function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: config.environment.environment === "production",
    sameSite: config.environment.environment === "production" ? "none" : "Lax",
    path: "/",
  });

  return respuesta.success(req, res, "Sesión cerrada correctamente", 200);
}

module.exports = router;
