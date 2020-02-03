import { Event } from '../../types';
import request from '../request';

import { Stream } from 'stream';
import { Subject } from 'rxjs';

import { Either, success } from '../../errors';

export interface Props {
  id: string;
}

const events = async function (props: Props): Promise<Either<void, Subject<Event>>> {
  const response = await request<Stream>({
    method: 'GET',
    url: '/events',
    responseType: 'stream',
    params: {
      filters: JSON.stringify(
        {
          container: [ props.id ],
          type: [ 'container' ]
        }
      )
    }
  });

  const subject = new Subject<Event>();

  response.data.on('data', (data: Buffer): void => {
    const event: Event = JSON.parse(data.toString('utf8'));

    subject.next(event);
  });

  return success(subject);
};

export default events;
