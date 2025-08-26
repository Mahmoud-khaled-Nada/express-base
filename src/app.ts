import { createHttp } from "@core/http";
import { requestLogger } from "@infra/observability/requestLogger";
import { health } from "@infra/health/healthRoutes";
import { userRouter } from "@modules/users/user.routes";
import { notFoundHandler, errorHandler } from "@core/errors/errorMiddleware";


export function buildApp() {
  const app = createHttp();
  app.use(requestLogger);
  app.use("/_system", health);
  app.use("/api/users", userRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);


  return app;
}
