---
title: nestjs/config-loader
---

# Use config loader in NestJS

This recipe shows how to integrate `ConfigLoaderDirector` and `ConfigLoaderPool` from
`@tusss/ood` with the [`@nestjs/config`](https://docs.nestjs.com/techniques/configuration)
module to manage environment-specific configuration in a type-safe way.

## Prerequisites

```bash
npm install @nestjs/config
```

## Define your config type

Extend `Config` with your application-specific fields.

```ts
// src/config/types.ts
import { Config } from "@tusss/ood";

export type AppConfig = Config<{
  port: number;
  dbUrl: string;
}>;
```

## Implement loaders per environment

Each environment gets its own `IConfigLoader` implementation.

```ts
// src/config/loader.development.ts
import { IConfigLoader } from "@tusss/ood";
import { AppConfig } from "../types";

export class LoaderDevelopment implements IConfigLoader<AppConfig> {
  async load(): Promise<AppConfig> {
    return {
      environment: "development",
      port: 3000,
      dbUrl: process.env.DATABASE_URL ?? "postgres://localhost:5432/dev",
    };
  }
}
```

```ts
// src/config/loader.production.ts
import { IConfigLoader } from "@tusss/ood";
import { AppConfig } from "../types";

export class LoaderProduction implements IConfigLoader<AppConfig> {
  async load(): Promise<AppConfig> {
    return {
      environment: "production",
      port: Number(process.env.PORT),
      dbUrl: process.env.DATABASE_URL || "postgres://localhost:5432/prod",
    };
  }
}
```

## Create a ConfigLoaderPool

Create a pool that maps environment names to their loaders and declares a
default fallback loader.

```ts
// src/config/loader.pool.ts
import { ConfigLoaderPool, IConfigLoader, KeyOrString } from "@tusss/ood";
import { AppConfig } from "./app.config";
import { LoaderDevelopment } from "./loader.development";
import { LoaderProduction } from "./loader.production";

type AppEnv = KeyOrString<"development" | "production">;

export class AppConfigLoaderPool extends ConfigLoaderPool<AppEnv, AppConfig> {
  override readonly defaultLoader: IConfigLoader<AppConfig> = new LoaderDevelopment();
}

export const appConfigLoaderPool = new AppConfigLoaderPool([
  ["development", new LoaderDevelopment()],
  ["production", new LoaderProduction()],
]);
```

## Wire up with @nestjs/config

Use `ConfigModule.forRoot` to load the configuration via
`ConfigLoaderDirector`, then make it available to `ConfigService`.

```ts
// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigLoaderDirector } from "@tusss/ood";
import { appConfigLoaderPool } from "./config/app-config-loader.pool";

const director = new ConfigLoaderDirector(appConfigLoaderPool);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          return director.load();
        },
      ],
    }),
  ],
})
export class AppModule {}
```

`NODE_ENV` is read automatically by `ConfigLoaderDirector.getEnv()`, so setting
`NODE_ENV=production` before starting the app is all that is needed to switch
loaders.

## Inject and use the config

```ts
// src/app.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./config/app.config";

@Injectable()
export class AppService {
  constructor(private readonly config: ConfigService<AppConfig>) {}

  getDatabaseUrl(): string {
    return this.config.get("dbUrl", { infer: true });
  }

  getPort(): number {
    return this.config.get("port", { infer: true });
  }
}
```

## Customising environment resolution

If you need to derive the environment from somewhere other than `NODE_ENV`,
use `customizeEnv`:

```ts
const director = new ConfigLoaderDirector(appConfigLoaderPool);
director.customizeEnv(() => myCustomEnvResolver());

const config = await director.load();
```

This is useful for multi-tenant setups or when the environment is stored in a
database or remote configuration service.
