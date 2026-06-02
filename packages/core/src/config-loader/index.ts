import { EnvironmentType } from "../types";

/**
 * Represents the application configuration structure, enclosing environment metadata.
 *
 * @template TConfig Additional configuration properties.
 */
export type Config<TConfig = Record<string, unknown>> = TConfig & {
  /**
   * The active application environment (e.g., 'development', 'production').
   */
  environment: EnvironmentType;
};

/**
 * Interface for config loaders responsible for retrieving configuration objects.
 *
 * @template TConfig The type of configuration object returned by the loader.
 */
export interface IConfigLoader<TConfig = Config> {
  /**
   * Loads the configuration asynchronously.
   *
   * @returns A promise resolving to the configuration object.
   */
  load: () => Promise<TConfig>;
}

/**
 * An abstract pool managing configuration loaders mapped to specific environments.
 * Extends the native `Map` to associate environments with their corresponding loaders.
 *
 * @template TEnv The type of the environment key. Defaults to {@link EnvironmentType}.
 * @template TConfig The configuration object type. Defaults to {@link Config}.
 */
export abstract class ConfigLoaderPool<TEnv = EnvironmentType, TConfig = Config> {
  /**
   * @hidden
   */
  private pool: Map<TEnv, IConfigLoader<TConfig>>;

  constructor(iterable: Iterable<readonly [TEnv, IConfigLoader<TConfig>]>) {
    this.pool = new Map(iterable);
  }

  /**
   * The default configuration loader to use when a requested environment is not in the pool.
   *
   * @readonly
   */
  abstract readonly defaultLoader: IConfigLoader<TConfig>;

  /**
   * Retrieves the configuration loader for the specified environment.
   * If no loader is configured for the given environment, falls back to the {@link defaultLoader}.
   *
   * @param key The environment key to retrieve the loader for.
   * @returns The configuration loader associated with the environment, or the default loader.
   */
  get(key: TEnv) {
    const loader = this.pool.get(key);
    if (!loader) return this.defaultLoader;
    return loader;
  }
}

/**
 * Coordinates the configuration loading process by querying the loader pool
 * based on the resolved environment.
 *
 * @template TEnv The environment key type. Defaults to {@link EnvironmentType}.
 * @template TConfig The configuration object type. Defaults to {@link Config}.
 *
 * @example
 * Basic usage of ConfigLoaderDirector and ConfigLoaderPool to load configuration for a given environment
 * ```ts
 * import {
 *   Config,
 *   IConfigLoader,
 *   ConfigLoaderPool,
 *   ConfigLoaderDirector
 * } from './config-loader';
 *
 * type AppConfig = Config<{ apiEndpoint: string }>;
 *
 * class LoaderDev implements IConfigLoader<AppConfig> {
 *   async load() {
 *     return {
 *       environment: 'development',
 *       apiEndpoint: 'http://localhost:3000'
 *     };
 *   }
 * }
 *
 * class LoaderProd implements IConfigLoader<AppConfig> {
 *   async load() {
 *     return {
 *       environment: 'production',
 *       apiEndpoint: 'https://api.example.com'
 *     };
 *   }
 * }
 *
 * const loaderDev = new LoaderDev();
 * const loaderProd = new LoaderProd();
 *
 * class AppConfigPool extends ConfigLoaderPool<string, AppConfig> {
 *   override readonly defaultLoader = loaderDev;
 * }
 *
 * const pool = new AppConfigPool([
 *   ['development', loaderDev],
 *   ['production', loaderProd]
 * ]);
 *
 * const director = new ConfigLoaderDirector(pool);
 *
 * // Load configuration (reads process.env.NODE_ENV)
 * const config = await director.load();
 *
 * // Customize environment resolution manually
 * const customConfig = await director
 *   .customizeEnv(() => 'production')
 *   .load();
 * ```
 */
export class ConfigLoaderDirector<TEnv = EnvironmentType, TConfig = Config> {
  /**
   * Creates an instance of ConfigLoaderDirector.
   *
   * @param pool The pool of configuration loaders to select from.
   */
  constructor(readonly pool: ConfigLoaderPool<TEnv, TConfig>) {}

  /**
   * Resolves the current environment. By default, it reads `process.env.NODE_ENV`.
   *
   * @returns The current environment value.
   */
  getEnv(): TEnv {
    return (process.env.NODE_ENV ?? "development") as TEnv;
  }

  /**
   * Resolves the loader from the pool and loads the configuration.
   *
   * @returns A promise resolving to the loaded configuration.
   */
  load() {
    const loader = this.pool.get(this.getEnv());
    return loader.load();
  }

  /**
   * Customizes the logic to determine the current environment.
   *
   * @param getter A callback function returning the environment.
   * @returns The current director instance for method chaining.
   */
  customizeEnv(getter: () => TEnv) {
    this.getEnv = getter;
    return this;
  }
}
