import request from '../request';

import { Either, error, success } from '../../errors';
import { KeyPair, Paths, Port, RecursiveKeyPair } from '../../types';
import { toEnv, toExposedPorts, toLabels, toPaths, toPorts } from '../../utils';

export interface Props {
  id: string;
  image: string;
  commands?: string[];
  env?: KeyPair;
  labels?: RecursiveKeyPair;
  paths?: Paths;
  restartPolicy?: 'always' | 'unless-stopped' | 'on-failure';
  ports?: Port[];
}

interface DockerResponse {
  Id: string;
}

export interface Response {
  id: string;
}

export interface ResponseError {
  code: 'container_already_exists' | 'local_image_does_not_exist';
}

const create = async function (props: Props): Promise<Either<ResponseError, Response>> {
  const env = props.env && toEnv(props.env);
  const labels = props.labels && toLabels(props.labels);
  const paths = props.paths && toPaths(props.paths);
  const ports = props.ports && toPorts(props.ports);
  const exposedPorts = props.ports && toExposedPorts(props.ports);

  const response = await request<DockerResponse>({
    method: 'POST',
    url: '/containers/create',
    params: {
      name: props.id
    },
    data: {
      Image: props.image,
      Cmd: props.commands,
      Env: env,
      Labels: labels,
      ExposedPorts: exposedPorts,
      HostConfig: {
        Binds: paths,
        PortBindings: ports,
        RestartPolicy: {
          Name: props.restartPolicy
        }
      }
    },
    validateStatus: (status): boolean =>
      (status >= 200 && status < 300) ||
      status === 409 ||
      status === 404
  });

  if (response.status === 409) {
    return error({
      code: 'container_already_exists'
    });
  }

  if (response.status === 404) {
    return error({
      code: 'local_image_does_not_exist'
    });
  }

  return success({
    id: response.data.Id
  });
};

export default create;
