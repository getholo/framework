import request from '../request';
import { Either, error, success } from '../../errors';

export interface Props {
  id: string;
  force?: boolean;
  removeVolumes?: boolean;
  removeLinks?: boolean;
}

export interface ResponseError {
  code: 'container_does_not_exist';
}

const remove = async function (props: Props): Promise<Either<ResponseError, void>> {
  const response = await request({
    method: 'DELETE',
    url: `/containers/${props.id}`,
    params: {
      force: props.force ?? false,
      v: props.removeVolumes ?? false, // eslint-disable-line id-length
      link: props.removeLinks ?? false
    },
    validateStatus: (status): boolean =>
      status === 204 ||
      status === 404
  });

  if (response.status === 404) {
    return error({
      code: 'container_does_not_exist'
    });
  }

  return success(undefined);
};

export default remove;
