import request from '../request';
import { Either, error, success } from '../../errors';

export interface Props {
  id: string;
}

export interface ResponseError {
  code: 'container_does_not_exist' | 'container_already_started';
}

const start = async function (props: Props): Promise<Either<ResponseError, void>> {
  const response = await request({
    method: 'POST',
    url: `/containers/${props.id}/start`,
    validateStatus: (status): boolean =>
      status === 204 ||
      status === 304 ||
      status === 404
  });

  if (response.status === 304) {
    return error({
      code: 'container_already_started'
    });
  }

  if (response.status === 404) {
    return error({
      code: 'container_does_not_exist'
    });
  }

  return success(undefined);
};

export default start;
