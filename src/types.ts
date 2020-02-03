export interface Multiple<T> {
  [key: string]: T;
}

export type MaybePromise<T> = Promise<T> | T;

export type KeyPair = Multiple<string | boolean | number>;

export type RecursiveKeyPair = Multiple<string | boolean | number | RecursiveKeyPair>;

export interface Path {
  host: string;
  container: string;
  readOnly?: boolean;
}

export type Paths = Multiple<Path>;

export interface TraefikConfig {
  domain: string;
  provider: string;
}

export interface Port {
  host: number;
  container: number;
  protocol?: 'tcp' | 'udp';
}

// Docker

export type Action = 'create' | 'start' | 'kill' | 'die' | 'destroy';

export interface Event {
  status: Action;
  id: string;
  from: string;
  Type: 'container';
  Action: Action;
  Actor: {
    ID: string;
    Attributes: {
      name: string;
      image: string;
    };
  };
}

export interface PortMapping {
  [key: string]: {
    HostPort: string;
  }[];
}

export interface ExposedPortMapping {
  [key: string]: {};
}
