import request from '../request';
import { Either, error, success } from '../../errors';

export interface Props {
  id: string;
}

export interface ResponseError {
  code: 'container_does_not_exist' | 'container_already_stopped';
}

const stop = async function (props: Props): Promise<Either<ResponseError, void>> {
  const response = await request({
    method: 'POST',
    url: `/containers/${props.id}/stop`,
    validateStatus: (status): boolean =>
      status === 204 ||
      status === 304 ||
      status === 404
  });

  if (response.status === 304) {
    return error({
      code: 'container_already_stopped'
    });
  }

  if (response.status === 404) {
    return error({
      code: 'container_does_not_exist'
    });
  }

  return success(undefined);
};

export default stop;
