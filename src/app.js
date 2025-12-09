const express = require('express');
const jwtMiddleware = require("./middleware/jwtMiddleware");
const config = require('./config');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const alumnos = require('./modules/usuarios/rutas');
const auth = require('./modules/auth/rutas');
const calificaciones = require('./modules/calificaciones/rutas');
const carreras = require('./modules/carreras/rutas');
const factoresriesgo = require('./modules/factoresriesgo/rutas');
const materias = require('./modules/materias/rutas');
const logs = require('./modules/log/rutas');
const profesores = require('./modules/profesoresmaterias/rutas')

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.set('port', config.app.port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/auth/me", jwtMiddleware, (req, res) => {
  return res.json({
    ok: true,
    user: req.user,
  });
});

app.use('/api/calificaciones', calificaciones);
app.use('/api/carreras', carreras);
app.use('/api/factoresriesgo', factoresriesgo);
app.use('/api/logs', logs);
app.use('/api/materias', materias);
app.use('/api/alumnos', alumnos);
app.use('/api/auth', auth);
app.use('/api/profesores', profesores)

module.exports = app;