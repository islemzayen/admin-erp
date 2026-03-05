// server.js

const Fastify = require("fastify");
const dotenv = require("dotenv");
const deptRoutes = require("./routes/department.routes");

dotenv.config();

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  },
});

// ── Plugins ────────────────────────────────────────────────
fastify.register(require("@fastify/helmet"));
fastify.register(require("@fastify/cors"), {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
});
fastify.register(require("./plugins/mongo.plugin"));   // DB connection
fastify.register(require("./plugins/jwt.plugin"));     // JWT + fastify.authenticate

// ── Routes ─────────────────────────────────────────────────
fastify.register(require("./routes/auth.routes"),  { prefix: "/api/auth"  });
fastify.register(require("./routes/admin.routes"), { prefix: "/api/admin" });

// Department routes — one factory, three registrations
fastify.register(deptRoutes("HR"),           { prefix: "/api/hr"        });
fastify.register(deptRoutes("Marketing"),    { prefix: "/api/marketing" });
fastify.register(deptRoutes("Online Sales"), { prefix: "/api/sales"     });

// ── Health check ───────────────────────────────────────────
fastify.get("/", async (req, reply) => {
  return { message: "ERP API is running ✅" };
});

// ── 404 ────────────────────────────────────────────────────
fastify.setNotFoundHandler((req, reply) => {
  reply.code(404).send({ message: "Route not found" });
});

// ── Global error handler ───────────────────────────────────
fastify.setErrorHandler((err, req, reply) => {
  fastify.log.error(err);
  reply.code(err.statusCode || 500).send({ message: err.message || "Internal Server Error" });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) { fastify.log.error(err); process.exit(1); }
});