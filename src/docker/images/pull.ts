import request from '../request';
import { Either, error, success } from '../../errors';

export interface Props {
  image: string;
}

export interface ResponseError {
  code: 'remote_image_does_not_exist';
}

const pull = async function (props: Props): Promise<Either<ResponseError, void>> {
  const response = await request({
    method: 'POST',
    url: '/images/create',
    params: {
      fromImage: props.image
    },
    validateStatus: (status): boolean =>
      status === 200 ||
      status === 404
  });

  if (response.status === 404) {
    return error({
      code: 'remote_image_does_not_exist'
    });
  }

  return success(undefined);
};

export default pull;
