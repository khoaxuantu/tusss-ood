import { describe, expect, it } from "bun:test";
import { Config, ConfigLoaderDirector, ConfigLoaderPool, IConfigLoader } from ".";
import { KeyOrString } from "../types";

describe("ConfigLoader", () => {
  type AppConfig = Config<{
    name: string;
  }>;

  class DevelopmentLoader implements IConfigLoader<AppConfig> {
    load: () => Promise<AppConfig> = async () => {
      return {
        environment: "development",
        name: "Development app",
      };
    };
  }

  class TestLoader implements IConfigLoader<AppConfig> {
    load: () => Promise<AppConfig> = async () => {
      return {
        environment: "test",
        name: "Test app",
      };
    };
  }

  const testLoader = new TestLoader();
  const devLoader = new DevelopmentLoader();

  class AppConfigLoaderPool extends ConfigLoaderPool<
    KeyOrString<"development" | "test">,
    AppConfig
  > {
    override readonly defaultLoader: IConfigLoader<AppConfig> = testLoader;
  }

  const pool = new AppConfigLoaderPool([
    ["development", devLoader],
    ["test", testLoader],
  ]);

  const configDirector = new ConfigLoaderDirector(pool);

  it.each(["development", "test"])("should load config for environment: %s", async (env) => {
    const config = await configDirector.customizeEnv(() => env).load();
    expect(config.environment).toBe(env);
  });

  it("should return default loader on unknown environment", async () => {
    const config = await configDirector.customizeEnv(() => "unknown").load();
    expect(config.environment).toBe("test");
  });
});
