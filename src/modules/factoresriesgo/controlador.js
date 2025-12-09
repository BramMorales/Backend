module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  function todos(tabla) {
    return db.runQuery(`SELECT*FROM ${tabla}`);
  }

  return {
    todos
  };
};
