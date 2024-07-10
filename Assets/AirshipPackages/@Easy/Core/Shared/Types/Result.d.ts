interface ResultBase<T extends boolean> {
	success: T;
	error?: undefined;
	data?: undefined;
}

export interface SuccessResult<T> extends ResultBase<true> {
	success: true;
	data: T;
}

export interface FailureResult<E> extends ResultBase<false> {
	success: false;
	error: E;
}

export type Result<S, E> = SuccessResult<S> | FailureResult<E>;
