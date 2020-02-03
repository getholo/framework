import { KeyPair } from './types';

export interface Traefik2 {
  enable: boolean;
  http?: {
    routers?: {
      [key: string]: {
        entrypoints?: string;
        middlewares?: string;
        rule?: string;
        tls?: {
          certresolver?: string;
          'domains[0]'?: {
            main?: string;
            sans?: string;
          };
        };
      };
    };
    services?: {
      [key: string]: {
        loadbalancer?: {
          server?: {
            port?: number;
          };
        };
      };
    };
    middlewares?: {
      [key: string]: {
        redirectscheme?: {
          permanent?: boolean;
          scheme?: 'https';
        };
      };
    };
  };
}

interface Props {
  domain: string;
  subdomain: string;
  port: number;
}

export const createTraefikConfig = function (props: Props): Traefik2 {
  return {
    enable: true,
    http: {
      routers: {
        [props.subdomain]: {
          entrypoints: 'websecure',
          rule: `Host(\`${props.subdomain}.${props.domain}\`)`,
          tls: {
            certresolver: 'le',
            'domains[0]': {
              main: `*.${props.domain}`
            }
          }
        }
      },
      services: {
        [props.subdomain]: {
          loadbalancer: {
            server: {
              port: props.port
            }
          }
        }
      }
    }
  };
};

interface ConfigProps {
  subdomain: string;
  port: number;
}

interface Provider {
  name: string;
  env: {
    [key: string]: string;
  };
}

export default class Traefik {
  public domain: string | undefined;

  public provider: Provider | undefined;

  public email: string | undefined;

  public getRootCommands (): string[] {
    if (!this.domain || !this.provider?.name || !this.email) {
      return [];
    }

    return [
      '--entrypoints.web.address=:80',
      '--entrypoints.websecure.address=:443',
      '--providers.docker',
      '--certificatesresolvers.le.acme.storage=/acme/acme.json',
      `--certificatesresolvers.le.acme.email=${this.email}`,
      `--certificatesResolvers.le.acme.dnsChallenge.provider=${this.provider.name}`
    ];
  }

  public getEnv (): KeyPair {
    if (this.provider?.env) {
      return this.provider.env;
    }

    return {};
  }

  public getConfig (props: ConfigProps): Traefik2 | null {
    if (!this.domain) {
      return null;
    }

    return createTraefikConfig({
      domain: this.domain,
      subdomain: props.subdomain,
      port: props.port
    });
  }
}
