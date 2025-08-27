import { createHttp } from "@core/http";
import { health } from "@infra/health/healthRoutes";
import userRouter from "@modules/users/user.routes";
import { requestLogger } from "@infra/observability/requestLogger";
import { notFoundHandler, errorHandler } from "@core/errors/errorMiddleware";

export function buildApp() {
  const app = createHttp();
  app.use(requestLogger);

  //* start of routes
  app.use("/_system", health);
  app.use("/api/users", userRouter);

  //* end of routes
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
