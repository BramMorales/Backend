const bcrypt = require("bcryptjs");
const auth = require("../../auth");
const config = require("../../config");

const TABLA = "authexamen";
const SALT_ROUNDS = 10;

module.exports = function (dbInyectada) {
  const db = dbInyectada || require("../../db/postgres");

  async function login(usuario_authexamen, password_authexamen) {
    try {
      const [user] = await db.runQuery(
        `SELECT * FROM ${TABLA} WHERE usuario_authexamen = $1`,
        [usuario_authexamen]
      );
      if (!user) throw new Error("Usuario no encontrado");
      if (!user.verificado_authexamen) throw new Error("Usuario no validado");

      const isMatch = await bcrypt.compare(password_authexamen, user.password_authexamen);
      if (!isMatch) throw new Error("Credenciales inválidas");

      const payload = {
        id_usuarioexamen: user.idusuario_authexamen,
        usuario_authexamen: user.usuario_authexamen,
        tiporol_authexamen: user.tiporol_authexamen,
        verificado_authexamen: user.verificado_authexamen,
      };

      const token = auth.generateToken(payload);
      const prod = config.environment === "production";

      return {
        token,
        cookieOptions: {
          httpOnly: true,
          secure: prod,
          sameSite: prod ? "none" : "Lax",
          expires: new Date(Date.now() + config.jwt.cookieExpires * 86400000),
        },
      };
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`);
    }
  }

  async function agregar(data) {
    const {
      idusuario_authexamen,
      usuario_authexamen = null,
      correo_authexamen = null,
      password_authexamen,
      tiporol_authexamen,
      verificado_authexamen,
    } = data;

    if (!idusuario_authexamen || !password_authexamen?.toString().trim()) {
      throw new Error("Faltan datos requeridos");
    }

    const hashedPassword = await bcrypt.hash(password_authexamen.toString(), SALT_ROUNDS);

    const authData = {
      idusuario_authexamen,
      usuario_authexamen,
      correo_authexamen,
      password_authexamen: hashedPassword,
      tiporol_authexamen,
      verificado_authexamen,
    }; 

    const params = [
      authData.idusuario_authexamen,
      authData.usuario_authexamen,
      authData.correo_authexamen,
      authData.password_authexamen,
      authData.tiporol_authexamen,
      authData.verificado_authexamen
    ];

    return await db.runQuery(
      `
      INSERT INTO authexamen (
        idusuario_authexamen,
        usuario_authexamen,
        correo_authexamen,
        password_authexamen,
        tiporol_authexamen,
        verificado_authexamen
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      params
    );
  }

  return {
    login,
    agregar
  };
};
