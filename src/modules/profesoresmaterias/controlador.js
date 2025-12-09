module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  function todos(tabla) {
    return db.runQuery(`SELECT*FROM ${tabla}`);
  }

  function asignar(body) {
  return db.runQuery(
    `INSERT INTO profesormateria (idprofesor_profesormateria, idmateria_profesormateria)
     VALUES ($1, $2)`,
    [body.idprofesor_profesormateria, body.idmateria_profesormateria]
  );
}


  return {
    todos,
    asignar
  };
};
