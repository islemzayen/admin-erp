// routes/admin.routes.js

const { protect, requireRole } = require("../hooks/auth.hook");
const {
  getStats, getAllUsers, getUserById, createUser, updateUser, deleteUser,
} = require("../controllers/admin.controller");
const { createUserBody, updateUserBody, idParam } = require("../schemas/admin.schema");

const adminOnly = [protect, requireRole("ADMIN")];

async function adminRoutes(fastify, options) {
  fastify.get("/stats",        { preHandler: adminOnly }, getStats);
  fastify.get("/users",        { preHandler: adminOnly }, getAllUsers);

  fastify.get("/users/:id",    { preHandler: adminOnly, schema: { params: idParam } }, getUserById);

  fastify.post("/users",       { preHandler: adminOnly, schema: { body: createUserBody } }, createUser);

  fastify.put("/users/:id",    {
    preHandler: adminOnly,
    schema: { body: updateUserBody, params: idParam },
  }, updateUser);

  fastify.delete("/users/:id", { preHandler: adminOnly, schema: { params: idParam } }, deleteUser);
}

module.exports = adminRoutes;