// routes/auth.routes.js

const { protect } = require("../hooks/auth.hook");
const { register, login, getMe } = require("../controllers/auth.controller");
const { registerBody, loginBody } = require("../schemas/auth.schema");

async function authRoutes(fastify, options) {
  fastify.post("/register", { schema: { body: registerBody } }, register);
  fastify.post("/login",    { schema: { body: loginBody } }, login);
  fastify.get("/me",        { preHandler: [protect] }, getMe);
}

module.exports = authRoutes;