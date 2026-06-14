import { describe, expect, it } from "#test";
import { KeyOrString } from "../types";
import { Config, ConfigLoaderDirector, ConfigLoaderPool, IConfigLoader } from "./index";

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

  for (const env of ["development", "test"].values()) {
    it(`should load config for environment: ${env}`, async () => {
      const config = await configDirector.customizeEnv(() => env).load();
      expect(config.environment).toBe(env);
    });
  }

  it("should return default loader on unknown environment", async () => {
    const config = await configDirector.customizeEnv(() => "unknown").load();
    expect(config.environment).toBe("test");
  });
});
