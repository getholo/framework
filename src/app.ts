import containerCreate from './docker/containers/create';
import containerEvents from './docker/containers/events';
import containerPull from './docker/images/pull';
import containerRemove from './docker/containers/remove';
import containerStart from './docker/containers/start';
import containerStop from './docker/containers/stop';

import globalConfig from './config';
import { join } from 'path';
import { toLabels } from './utils';
import { Event, KeyPair, MaybePromise, Path, Paths, Port, RecursiveKeyPair } from './types';
import { Subject, Subscription } from 'rxjs';

type SingleFunction = (...args: any) => any | Promise<any>;

export interface Functions {
  [name: string]: SingleFunction;
}

export interface Api {
  [name: string]: SingleFunction | Api;
}

export type Env = KeyPair;

export type Labels = RecursiveKeyPair;

type EventType = 'start' | 'stop' | 'remove' | 'create';

export default class App<
  TAppName extends string,
  TAppImage extends string,
  TAppPort extends number,
  TAppSubdomain extends string,
  TAppPaths extends Paths,
  TAppFunctions extends Functions,
  TAppApi extends Api
> {
  /**
   * The unique id and name of the container
   */
  public readonly name: TAppName;

  /**
   * Multiple helper functions this container provides
   */
  public readonly functions: TAppFunctions;

  /**
   * Multiple helper functions this container provides
   */
  public readonly api: TAppApi;

  /**
   * A keypair of paths between the host system and the container
   */
  public readonly paths: TAppPaths;

  /**
   * Internal observables for events
   */
  private readonly subjects = {
    create: new Subject(),
    start: new Subject(),
    stop: new Subject(),
    remove: new Subject()
  };

  private readonly events = new Subject<Event>();

  public constructor (
    private readonly config: {
      name: TAppName;
      image: TAppImage;
      network?: {
        port: TAppPort;
        subdomain?: TAppSubdomain;
        exposePorts?: Port[];
      };
      paths?: TAppPaths;
      commands?: (() => MaybePromise<string[]>) | string[];
      env?: (() => MaybePromise<Env>) | Env;
      labels?: Labels;
      functions?: TAppFunctions;
      api?: TAppApi;
    }
  ) {
    this.name = config.name;
    this.functions = config.functions ?? {} as TAppFunctions;
    this.api = config.api ?? {} as TAppApi;

    const paths = Object.fromEntries(
      Object.entries(config.paths ?? {}).map(
        ([ key, path ]): [string, Path ] => {
          let { host } = path;

          if (path.host === 'appdata') {
            host = join(globalConfig.paths.appdata, this.name, key);
          }

          if (path.host === 'media') {
            host = globalConfig.paths.media;
          }

          if (path.host === 'downloads') {
            host = globalConfig.paths.downloads;
          }

          return [ key, { host, container: path.container }];
        }
      )
    ) as TAppPaths;

    this.paths = paths;
    this.config.paths = paths;

    this.events.subscribe(
      (event): void => {
        if (event.status === 'create') {
          this.subjects.create.next();
        } else if (event.status === 'die') {
          this.subjects.stop.next();
        } else if (event.status === 'destroy') {
          this.subjects.remove.next();
        } else if (event.status === 'start') {
          this.subjects.start.next();
        }
      }
    );

    containerEvents({
      id: this.name
    }).then(
      (result): void => {
        if (result.isSuccess()) {
          result.value.subscribe(
            (event): void => {
              this.events.next(event);
            }
          );
        }
      },
      (): null => null
    );
  }

  public on (
    event: EventType,
    callback: () => void
  ): Subscription {
    return this.subjects[event].subscribe((): void => callback());
  }

  public async create (): ReturnType<typeof containerCreate> {
    const env = typeof this.config.env === 'function' ?
      await this.config.env() :
      this.config.env;

    const traefikLabels = (this.config.network?.port && globalConfig.traefik.getConfig({
      subdomain: this.config.network.subdomain ?? this.name,
      port: this.config.network.port
    })) ?? {};

    const labels = {
      ...toLabels(traefikLabels, 'traefik'),
      ...this.config.labels,
      'holo.app': this.name
    };

    const commands = typeof this.config.commands === 'function' ?
      await this.config.commands() :
      this.config.commands;

    return containerCreate({
      id: this.name,
      image: this.config.image,
      paths: this.config.paths,
      ports: this.config.network?.exposePorts,
      restartPolicy: 'unless-stopped',
      commands,
      labels,
      env
    });
  }

  public async start (): ReturnType<typeof containerStart> {
    return containerStart({
      id: this.name
    });
  }

  public async stop (): ReturnType<typeof containerStop> {
    return containerStop({
      id: this.name
    });
  }

  public async remove (): ReturnType<typeof containerRemove> {
    return containerRemove({
      id: this.name,
      force: true
    });
  }

  public async pull (): ReturnType<typeof containerPull> {
    return containerPull({
      image: this.config.image
    });
  }
}
