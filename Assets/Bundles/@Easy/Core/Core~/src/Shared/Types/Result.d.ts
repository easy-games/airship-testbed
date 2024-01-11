interface ResultBase<T extends boolean, R> {
	success: T;
	data: R;
}

export interface SuccessResult<T> extends ResultBase<true, T> {
	success: true;
	data: T;
}

export interface FailureResult<E> extends ResultBase<false, E> {
	success: false;
	data: E;
}

export type Result<S, E> = SuccessResult<S> | FailureResult<E>;
