import { ExposedPortMapping, KeyPair, Paths, Port, PortMapping, RecursiveKeyPair } from './types';

// Env

export const toEnv = function (input: KeyPair): string[] {
  return Object.entries(input).map(
    ([ key, value ]): string => `${key}=${value}`
  );
};

// Paths

export const toPaths = function (input: Paths): string[] {
  return Object.entries(input).map(
    ([ key, { container, host, readOnly }]): string => `${host}:${container}:${readOnly ? 'ro' : 'rw'}`
  );
};

// Labels

export const toLabelsRecursive = function (input: object, prefix?: string): KeyPair[] {
  return Object.entries(input).flatMap(([ key, value ]): KeyPair[] => {
    const name = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object') {
      return toLabelsRecursive(value, name);
    }

    return [{
      [name]: `${value}`
    }];
  });
};

export const toLabels = function (input: RecursiveKeyPair, prefix?: string): KeyPair {
  return toLabelsRecursive(input, prefix).reduce(
    (acc, current): KeyPair => ({
      ...acc,
      ...current
    }),
    {} as KeyPair
  );
};

// Ports

export const toPorts = function (ports: Port[]): PortMapping {
  return ports.reduce(
    (acc, port): PortMapping => ({
      ...acc,
      [`${port.container}/${port.protocol ?? 'tcp'}`]: [
        {
          HostPort: `${port.host}`
        }
      ]
    }),
    {} as PortMapping
  );
};

export const toExposedPorts = function (ports: Port[]): ExposedPortMapping {
  return ports.reduce(
    (acc, port): ExposedPortMapping => ({
      ...acc,
      [`${port.container}/${port.protocol ?? 'tcp'}`]: {}
    }),
    {} as ExposedPortMapping
  );
};
