import { getLocalContentResponse } from "./content-data";
import type { fixtures as ContentFixtures } from "./server-content";

interface DevServer {
  ssrLoadModule(id: string): Promise<{ fixtures: typeof ContentFixtures }>;
  middlewares: {
    use(
      handler: (
        request: { url?: string; method?: string },
        response: {
          statusCode?: number;
          setHeader(name: string, value: string): void;
          end(value?: string | Uint8Array): void;
        },
        next: (error?: Error) => void,
      ) => void,
    ): void;
  };
}

export function contentDevApi() {
  return {
    name: "mimifuwa-content-dev-api",
    configureServer(server: DevServer) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== "GET") return next();
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        try {
          const { fixtures } = await server.ssrLoadModule("/src/server-content.ts");
          const result = getLocalContentResponse(pathname, fixtures);
          if (!result) return next();
          response.statusCode = result.status ?? 200;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify(result.body));
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
  };
}
