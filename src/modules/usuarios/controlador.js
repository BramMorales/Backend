const config = require('../../config');
const XLSX = require("xlsx");
const fs = require("fs");
const jwt = require('../../auth');
const auth = require('../auth');
const path = require("path");


module.exports = function (dbInyectada) {
  const db = dbInyectada || require('../../db/postgres');



  function todos(tabla) {
    return db.runQuery(`
      SELECT 
        u.id_usuarioexamen,
        u.numerocontrol_usuarioexamen,
        u.nombre_usuarioexamen,
        u.apellidop_usuarioexamen,
        u.apellidom_usuarioexamen,
        u.semestre_usuarioexamen,
        a.tiporol_authexamen,
        c.nombre_carreraexamen AS nombre_carrera
      FROM ${tabla} u
      INNER JOIN carreraexamen c
        ON u.idcarrera_usuarioexamen = c.id_carreraexamen
      INNER JOIN authexamen a
        ON u.id_usuarioexamen = a.idusuario_authexamen
      `);
  }

  function alumnosCalificacion(id_estudianteexamen) {
    return db.runQuery(`
      SELECT
          ue.id_usuarioexamen,
          ue.numerocontrol_usuarioexamen,
          ue.nombre_usuarioexamen,
          ue.apellidop_usuarioexamen,
          ue.apellidom_usuarioexamen,
          ue.semestre_usuarioexamen,
          c.nombre_carreraexamen,
          m.nombre_materiaexamen,
          cal.unidad_calificacionexamen,
          cal.calificacion_calificacionexamen,
          f.tipo_factorriesgoexamen,
          cal.observaciones_calificacionexamen
      FROM usuarioexamen ue
      INNER JOIN carreraexamen c
          ON ue.idcarrera_usuarioexamen = c.id_carreraexamen
      INNER JOIN materiascarrera mxc
          ON mxc.idcarrera_materiascarrera = c.id_carreraexamen
      INNER JOIN materiaexamen m
          ON m.id_materiaexamen = mxc.idmateria_materiascarrera
      LEFT JOIN calificacionexamen cal
          ON cal.idusuario_calificacionexamen = ue.id_usuarioexamen
          AND cal.idmateria_calificacionexamen = m.id_materiaexamen
      LEFT JOIN factorriesgoexamen f
          ON f.id_factorriesgoexamen = cal.idfactorriesgoexamen
      WHERE cal.unidad_calificacionexamen IS NOT NULL
        AND cal.calificacion_calificacionexamen IS NOT NULL
        AND id_usuarioexamen = $1
      ORDER BY m.nombre_materiaexamen, c.nombre_carreraexamen;
      `, [id_estudianteexamen]);
  }

  function alumnos_ADMIN() {
    return db.runQuery(`
      SELECT
          ue.id_usuarioexamen,
          ue.numerocontrol_usuarioexamen,
          ue.nombre_usuarioexamen,
          ue.apellidop_usuarioexamen,
          ue.apellidom_usuarioexamen,
          ue.semestre_usuarioexamen,
          c.nombre_carreraexamen,
          m.nombre_materiaexamen,
          cal.unidad_calificacionexamen,
          cal.calificacion_calificacionexamen,
          f.tipo_factorriesgoexamen,
          cal.observaciones_calificacionexamen
      FROM usuarioexamen ue
      INNER JOIN carreraexamen c
          ON ue.idcarrera_usuarioexamen = c.id_carreraexamen
      INNER JOIN materiascarrera mxc
          ON mxc.idcarrera_materiascarrera = c.id_carreraexamen
      INNER JOIN materiaexamen m
          ON m.id_materiaexamen = mxc.idmateria_materiascarrera
      LEFT JOIN calificacionexamen cal
          ON cal.idusuario_calificacionexamen = ue.id_usuarioexamen
          AND cal.idmateria_calificacionexamen = m.id_materiaexamen
      LEFT JOIN factorriesgoexamen f
          ON f.id_factorriesgoexamen = cal.idfactorriesgoexamen
      WHERE cal.unidad_calificacionexamen IS NOT NULL
        AND cal.calificacion_calificacionexamen IS NOT NULL
      ORDER BY m.nombre_materiaexamen;
    `);
  }

 async function alumnos_PROFESOR(idProfesor) {
  return db.runQuery(`
    SELECT
      cal.id_calificacionexamen,
      cal.idusuario_calificacionexamen,
      ue.numerocontrol_usuarioexamen,
      ue.nombre_usuarioexamen,
      ue.apellidop_usuarioexamen,
      ue.apellidom_usuarioexamen,
      ue.semestre_usuarioexamen,
      c.nombre_carreraexamen,
      cal.idmateria_calificacionexamen,
      m.nombre_materiaexamen,
      cal.semestre_calificacionexamen AS semestre_calificacion,
      cal.unidad_calificacionexamen,
      cal.calificacion_calificacionexamen,
      cal.Asistencias_CalificacionExamen,
      cal.TotalClases_CalificacionExamen,
      cal.PorcentajeAsistencia_CalificacionExamen,
      f.tipo_factorriesgoexamen,
      cal.observaciones_calificacionexamen
    FROM calificacionexamen cal
    INNER JOIN usuarioexamen ue
      ON ue.id_usuarioexamen = cal.idusuario_calificacionexamen
    INNER JOIN materiaexamen m
      ON m.id_materiaexamen = cal.idmateria_calificacionexamen
    INNER JOIN profesormateria pm
      ON pm.idmateria_profesormateria = cal.idmateria_calificacionexamen
       AND pm.idprofesor_profesormateria = $1
    LEFT JOIN factorriesgoexamen f
      ON f.id_factorriesgoexamen = cal.idfactorriesgoexamen
    LEFT JOIN carreraexamen c
      ON c.id_carreraexamen = ue.idcarrera_usuarioexamen
    ORDER BY m.nombre_materiaexamen, ue.apellidop_usuarioexamen, ue.nombre_usuarioexamen;
  `, [idProfesor]);
}



  async function agregar(req, res, body) {
    const { usuario_authexamen, correo_authexamen, password_authexamen, tiporol_authexamen } = body;

    if (usuario_authexamen) {
      const existingUser = await db.runQuery(
        `SELECT * FROM authexamen WHERE usuario_authexamen = $1`,
        [usuario_authexamen]
      );
      if (existingUser.length !== 0) throw new Error('Usuario ya existente');
    }

    if (correo_authexamen) {
      const existingEmail = await db.runQuery(
        `SELECT * FROM authexamen WHERE correo_authexamen = $1`,
        [correo_authexamen]
      );
      if (existingEmail.length !== 0) throw new Error('Correo ya existe');
    }

    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(usuario_authexamen)) {
      throw new Error('Usuario inválido');
    }

    const usuarioNuevo = {
      nombre_usuarioexamen: body.nombre_usuarioexamen,
      apellidop_usuarioexamen: body.apellidop_usuarioexamen,
      apellidom_usuarioexamen: body.apellidom_usuarioexamen,
      semestre_usuarioexamen: body.semestre_usuarioexamen,
      idcarrera_usuarioexamen: body.idcarrera_usuarioexamen
    };

    const insertUserParams = [
      usuarioNuevo.nombre_usuarioexamen,
      usuarioNuevo.apellidop_usuarioexamen,
      usuarioNuevo.apellidom_usuarioexamen,
      usuarioNuevo.semestre_usuarioexamen,
      usuarioNuevo.idcarrera_usuarioexamen
    ];

    const [insertedUser] = await db.runQuery(
      `
      INSERT INTO usuarioexamen (
          nombre_usuarioexamen,
          apellidop_usuarioexamen,
          apellidom_usuarioexamen,
          semestre_usuarioexamen,
          idcarrera_usuarioexamen
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_usuarioexamen
      `,
      insertUserParams
    );

    const insertId = insertedUser.id_usuarioexamen;

    if (usuario_authexamen || correo_authexamen || password_authexamen) {
      await auth.agregar({
        idusuario_authexamen: insertId,
        usuario_authexamen: body.usuario_authexamen,
        correo_authexamen: body.correo_authexamen,
        password_authexamen: body.password_authexamen,
        tiporol_authexamen: body.tiporol_authexamen || 0,
        verificado_authexamen: body.verificado_authexamen || 0,
      }, res);
    }

    return { mensaje: 'Usuario agregado exitosamente', id: insertId };
  }

  async function modificar(id_usuarioexamen, data) {
  const { 
    usuario_authexamen,
    correo_authexamen,
    password_authexamen,
    tiporol_authexamen
  } = data;

  if (!id_usuarioexamen) {
    throw new Error("Falta id_usuarioexamen");
  }

  const [exists] = await db.runQuery(
    `SELECT * FROM usuarioexamen WHERE id_usuarioexamen = $1`,
    [id_usuarioexamen]
  );
  if (!exists) {
    throw new Error("El usuario no existe");
  }

  if (usuario_authexamen) {
    const existingUser = await db.runQuery(
      `
      SELECT * FROM authexamen 
      WHERE usuario_authexamen = $1 AND idusuario_authexamen != $2
      `,
      [usuario_authexamen, id_usuarioexamen]
    );
    if (existingUser.length !== 0) throw new Error("Usuario ya existente");

    const regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(usuario_authexamen)) {
      throw new Error("Usuario inválido");
    }
  }

  if (correo_authexamen) {
    const existingEmail = await db.runQuery(
      `
      SELECT * FROM authexamen 
      WHERE correo_authexamen = $1 AND idusuario_authexamen != $2
      `,
      [correo_authexamen, id_usuarioexamen]
    );
    if (existingEmail.length !== 0) throw new Error("Correo ya existente");
  }

  await db.runQuery(
    `
    UPDATE usuarioexamen
    SET 
      nombre_usuarioexamen = $1,
      apellidop_usuarioexamen = $2,
      apellidom_usuarioexamen = $3,
      semestre_usuarioexamen = $4,
      idcarrera_usuarioexamen = $5
    WHERE id_usuarioexamen = $6
    `,
    [
      data.nombre_usuarioexamen,
      data.apellidop_usuarioexamen,
      data.apellidom_usuarioexamen,
      data.semestre_usuarioexamen,
      data.idcarrera_usuarioexamen,
      id_usuarioexamen
    ]
  );

  const authExists = await db.runQuery(
    `SELECT * FROM authexamen WHERE idusuario_authexamen = $1`,
    [id_usuarioexamen]
  );

  if (authExists.length > 0) {
    await db.runQuery(
      `
      UPDATE authexamen
      SET
        usuario_authexamen = COALESCE($1, usuario_authexamen),
        correo_authexamen = COALESCE($2, correo_authexamen),
        password_authexamen = COALESCE($3, password_authexamen),
        tiporol_authexamen = COALESCE($4, tiporol_authexamen)
      WHERE idusuario_authexamen = $5
      `,
      [
        usuario_authexamen,
        correo_authexamen,
        password_authexamen,
        tiporol_authexamen,
        id_usuarioexamen
      ]
    );
  } else {
    if (usuario_authexamen || correo_authexamen || password_authexamen) {
      await auth.agregar(
        {
          idusuario_authexamen: id_usuarioexamen,
          usuario_authexamen,
          correo_authexamen,
          password_authexamen,
          tiporol_authexamen: tiporol_authexamen || 0,
          verificado_authexamen: data.verificado_authexamen || 0,
        }, 
        res
      );
    }
  }

  return { mensaje: "Usuario modificado exitosamente" };
}


  return {
    alumnos_ADMIN,
    alumnos_PROFESOR,
    alumnosCalificacion,
    agregar,
    modificar,
    todos
  };
};