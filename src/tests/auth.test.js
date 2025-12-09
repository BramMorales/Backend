const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../app"); // tu archivo principal express
const db = require("../db/postgres");
const authController = require("../modules/auth/controlador")();

// Mock DB
jest.mock("../db/postgres", () => ({
  runQuery: jest.fn()
}));

jest.mock("bcryptjs");

describe("AUTH MODULE", () => {
  describe("POST /login", () => {
    it("Debe loguear correctamente y devolver token + cookie", async () => {
      db.runQuery.mockResolvedValue([
        {
          idusuario_authexamen: 1,
          usuario_authexamen: "juan",
          password_authexamen: "hashed",
          verificado_authexamen: 1,
          tiporol_authexamen: 2
        }
      ]);

      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          usuario_authexamen: "juan",
          password_authexamen: "12345",
        });

      expect(res.status).toBe(200);
      expect(res.body.body.token).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("Debe fallar si el usuario no existe", async () => {
      db.runQuery.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ usuario_authexamen: "xx", password_authexamen: "123" });

      expect(res.status).toBe(401);
      expect(res.body.body).toContain("Error en login: Usuario no encontrado");
    });

    it("Debe fallar si el usuario no está verificado", async () => {
      db.runQuery.mockResolvedValue([
        {
          usuario_authexamen: "juan",
          password_authexamen: "hash",
          verificado_authexamen: 0
        }
      ]);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ usuario_authexamen: "juan", password_authexamen: "123" });

        console.log("BODY:", res.body);

      expect(res.status).toBe(401);
expect(res.body.body).toContain("Error en login: Usuario no validado");
    });

    it("Debe fallar si la contraseña es incorrecta", async () => {
      db.runQuery.mockResolvedValue([
        {
          usuario_authexamen: "juan",
          password_authexamen: "hash",
          verificado_authexamen: 1
        }
      ]);

      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ usuario_authexamen: "juan", password_authexamen: "xxx" });

      expect(res.status).toBe(401);
expect(res.body.body).toContain("Error en login: Credenciales inválidas");
    });
  });

  describe("auth.agregar", () => {
    it("Debe agregar un usuario correctamente", async () => {
      db.runQuery.mockResolvedValue([{ idusuario_authexamen: 1 }]);

      bcrypt.hash.mockResolvedValue("hashed-pass");

      const result = await authController.agregar({
        idusuario_authexamen: 1,
        usuario_authexamen: "juan",
        correo_authexamen: "a@a.com",
        password_authexamen: "12345",
        tiporol_authexamen: 1,
        verificado_authexamen: 1
      });

      expect(result).toBeDefined();
      expect(db.runQuery).toHaveBeenCalled();
    });

    it("Debe fallar si falta password", async () => {
      await expect(authController.agregar({
        idusuario_authexamen: 10,
        password_authexamen: ""
      })).rejects.toThrow("Faltan datos requeridos");
    });
  });
});
