const fs = require("fs");
const csv = require("csv-parser");

module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  function todos(tabla) {
    return db.runQuery(`SELECT*FROM ${tabla}`);
  }

  async function importarCalificacionesC(req, id, rol) {
    const [materia] = await db.runQuery(`SELECT idmateria_profesormateria FROM profesormateria WHERE idprofesor_profesormateria = $1`,[id])

    return new Promise((resolve, reject) => {
      try {
        if (!req.file) {
          return reject(new Error("Archivo no recibido"));
        }

        const rows = [];

        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("data", (row) => rows.push(row))
          .on("end", async () => {
            try {
              const valid = [];
              const invalid = [];

              // Campos críticos
              const REQUIRED = [
                "idusuario_calificacionexamen",
                "idmateria_calificacionexamen",
                "unidad_calificacionexamen",
                "idfactorriesgoexamen"
              ];

              let processed = 0;
              let inserted = 0;
              let duplicated = 0;

              const BAJA_RIESGO_UUID = "bc85b93e-3293-4bfb-91c9-a41895ecb961";

              const toNum = (val) => {
                if (!val) return 0;
                if (typeof val === "number") return val;
                if (val === "#DIV/0!") return 0;
                const n = Number(val);
                return isNaN(n) ? 0 : n;
              };

              for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  processed++;

  const missing = REQUIRED.filter(
    (k) => !r[k] || r[k] === "" || r[k] === null
  );

  if (missing.length > 0) {
    invalid.push({
      row: i + 1,
      reason: `Faltan campos obligatorios: ${missing.join(", ")}`,
    });
    continue;
  }

  const asistencia = toNum(r.Asistencias_CalificacionExamen);
  const totalclases = toNum(r.TotalClases_CalificacionExamen);
  const porcasis = toNum(r.PorcentajeAsistencia_CalificacionExamen);
  const calificacion = toNum(r.calificacion_calificacionexamen);

  // ======================================================
  // ✅ 1) OBTENER SEMESTRE REAL
  // ======================================================
  let semestre_real;
  try {
    const sem = await db.runQuery(
      `SELECT semestre_usuarioexamen
       FROM usuarioexamen
       WHERE id_usuarioexamen = $1`,
      [r.idusuario_calificacionexamen]
    );

    if (sem.length === 0) {
      invalid.push({
        row: i + 1,
        reason: "Usuario no encontrado en usuarioexamen",
      });
      continue;
    }

    semestre_real = Number(sem[0].semestre_usuarioexamen);
  } catch (err) {
    invalid.push({
      row: i + 1,
      reason: "Error al buscar semestre: " + err.message,
    });
    continue;
  }

  // ======================================================
  // ✅ 2) Validar profesor/materia si rol = 2
  // ======================================================
  if (rol === 2) {
    try {
      const mat = await db.runQuery(
        `SELECT 1
         FROM profesormateria
         WHERE idprofesor_profesormateria = $1
           AND idmateria_profesormateria = $2`,
        [id, r.idmateria_calificacionexamen]
      );

      if (mat.length === 0) {
        invalid.push({
          row: i + 1,
          reason: "Profesor no asignado a esta materia",
        });
        continue;
      }
    } catch (err) {
      invalid.push({
        row: i + 1,
        reason: "Error validando profesor/materia: " + err.message,
      });
      continue;
    }
  }

  // ======================================================
  // ✅ 3) Evaluar asistencia < 10% ⇒ riesgo automático
  // ======================================================
  let idfactorriesgo = r.idfactorriesgoexamen ?? null;

  if (!isNaN(porcasis) && porcasis < 10) {
    idfactorriesgo = BAJA_RIESGO_UUID;
  }

                try {
                  const result = await db.runQuery(
                    `
                    INSERT INTO calificacionexamen (
                      idusuario_calificacionexamen,
                      idmateria_calificacionexamen,
                      semestre_calificacionexamen,
                      unidad_calificacionexamen,
                      calificacion_calificacionexamen,
                      Asistencias_CalificacionExamen,
                      TotalClases_CalificacionExamen,
                      PorcentajeAsistencia_CalificacionExamen,
                      idfactorriesgoexamen,
                      observaciones_calificacionexamen
                    )
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                    ON CONFLICT (
                      idusuario_calificacionexamen,
                      idmateria_calificacionexamen,
                      semestre_calificacionexamen,
                      unidad_calificacionexamen
                    ) DO NOTHING
                    RETURNING *;
                    `,
                    [
                      r.idusuario_calificacionexamen,
                      r.idmateria_calificacionexamen,
                      semestre_real, // ✅ NUEVO
                      r.unidad_calificacionexamen,
                      calificacion,
                      asistencia,
                      totalclases,
                      porcasis,
                      idfactorriesgo,
                      r.observaciones_calificacionexamen ?? ""
                    ]
                  );

                  // Si ya existía → no se inserta
                  if (result.rowCount === 0) {
                    duplicated++;
                    invalid.push({
                      row: i + 1,
                      reason: "Duplicado por UNIQUE",
                    });
                  } else {
                    inserted++;
                    valid.push({
                      row: i + 1,
                      status: "inserted",
                      semestre_real,
                    });
                  }

                } catch (err) {
                  invalid.push({
                    row: i + 1,
                    reason: err.message,
                  });
                }
              }

              fs.unlinkSync(req.file.path);

              resolve({
                ok: true,
                summary: {
                  processed,
                  inserted,
                  duplicated,
                  invalid: invalid.length,
                },
                valid,
                invalid,
              });

            } catch (error) {
              reject(error);
            }
          });
      } catch (e) {
        reject(e);
      }
    });
  }




  return {
    todos,
    importarCalificacionesC
  };
};
