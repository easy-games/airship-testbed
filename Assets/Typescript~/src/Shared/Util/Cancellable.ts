export abstract class Cancellable {
	private cancelled = false;

	SetCancelled(cancelled: boolean): void {
		this.cancelled = cancelled;
	}

	IsCancelled(): boolean {
		return this.cancelled;
	}
}
