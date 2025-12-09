module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  async function todos(tabla, nombre_carrera) {

  // 1) Buscar ID de carrera por nombre
  const result = await db.runQuery(
    'SELECT id_carreraexamen FROM carreraexamen WHERE nombre_carreraexamen = $1',
    [nombre_carrera]
  );

  if (!result.length) {
    return []; // No existe carrera
  }

  const idcarrera = result[0].id_carreraexamen;

  // 2) Obtener materias por carrera
  return db.runQuery(
    `
      SELECT  
        mxc.idcarrera_materiascarrera,
        mxc.idmateria_materiascarrera,
        n.nombre_materiaexamen
      FROM ${tabla} mxc
      INNER JOIN materiaexamen n
        ON mxc.idmateria_materiascarrera = n.id_materiaexamen
      WHERE mxc.idcarrera_materiascarrera = $1
    `,
    [idcarrera]
  );
}


  return {
    todos
  };
};
