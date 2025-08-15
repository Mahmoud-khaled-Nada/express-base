import { createHttp } from "./core/http.js";
import { requestLogger } from "./infra/observability/requestLogger.js";
import { health } from "./infra/health/healthRoutes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { notFoundHandler, errorHandler } from "./core/errors/errorMiddleware.js";

//  swagger
// import swaggerUi from "swagger-ui-express";
// import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
// import { generateOpenApiDocument } from "@asteasolutions/zod-to-openapi";

export function buildApp() {
  const app = createHttp();
  app.use(requestLogger);
  app.use("/_system", health);
  app.use("/api/users", userRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  // registry usage: register schemas & routes…
  // const registry = new OpenAPIRegistry();
  // (register zod schemas here)
  // const openapi = generateOpenApiDocument(registry.definitions, {
  //   openapi: "3.0.0",
  //   info: { title: "API", version: "1.0.0" }
  // });
  // app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  return app;
}
