/* eslint class-methods-use-this: 0 */

export type Either<TError, TSuccess> = Error<TError, TSuccess> | Success<TError, TSuccess>;

export class Error<TError, TSuccess> {
  public readonly value: TError;

  public constructor (value: TError) {
    this.value = value;
  }

  public isError (): this is Error<TError, TSuccess> {
    return true;
  }

  public isSuccess (): this is Success<TError, TSuccess> {
    return false;
  }
}

export class Success<TError, TSuccess> {
  public readonly value: TSuccess;

  public constructor (value: TSuccess) {
    this.value = value;
  }

  public isError (): this is Error<TError, TSuccess> {
    return false;
  }

  public isSuccess (): this is Success<TError, TSuccess> {
    return true;
  }
}

export const error = <TError, TSuccess>(err: TError): Either<TError, TSuccess> => new Error(err);

export const success = <TError, TSuccess>(suc: TSuccess): Either<TError, TSuccess> => new Success(suc);
