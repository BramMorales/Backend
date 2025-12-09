
module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  function todos() {
    return db.runQuery(`
      SELECT 
          l.id_logusuario,
          u.numerocontrol_usuarioexamen,
          CONCAT(u.nombre_usuarioexamen, ' ', u.apellidop_usuarioexamen, ' ', u.apellidom_usuarioexamen) AS nombre_completo,
          l.movimiento_logusuario
      FROM logusuario l
      INNER JOIN usuarioexamen u
          ON l.idusuario_logusuario = u.id_usuarioexamen;
    `);
  }

  function logsXUsuario(id_logusuario) {
    return db.runQuery(`
      SELECT 
          l.id_logusuario,
          u.numerocontrol_usuarioexamen,
          CONCAT(u.nombre_usuarioexamen, ' ', u.apellidop_usuarioexamen, ' ', u.apellidom_usuarioexamen) AS nombre_completo,
          l.movimiento_logusuario
      FROM logusuario l
      INNER JOIN usuarioexamen u
          ON l.idusuario_logusuario = u.id_usuarioexamen
      WHERE idusuario_logusuario = $1;
    `, [id_logusuario]);
  }

  async function ingresar(id_usuarioexamen, body) {
    const {movimiento_logusuario} = body;
    
    return await db.runQuery(
      `
      INSERT INTO logusuario (
        idusuario_logusuario,
        movimiento_logusuario
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [id_usuarioexamen, movimiento_logusuario]
    );
  }

  return {
    todos,
    ingresar,
    logsXUsuario
  };
};
