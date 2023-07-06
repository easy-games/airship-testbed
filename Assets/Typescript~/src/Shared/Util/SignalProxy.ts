import { Signal, SignalCallback, SignalPriority } from "./Signal";

interface CallbackItem<T> {
	id: number;
	callback: SignalCallback<T>;
}

let idCounter = 1;
export class SignalProxy<T extends unknown | unknown[]> extends Signal<T> {
	private readonly proxyConnections: Map<number, Array<CallbackItem<T>>> = new Map();

	constructor(private readonly source: Signal<T>) {
		super();
	}

	public Connect(callback: SignalCallback<T>): () => void {
		return this.ConnectWithPriority(SignalPriority.NORMAL, callback);
	}

	public ConnectWithPriority(priority: SignalPriority, callback: SignalCallback<T>): () => void {
		let id = idCounter;
		idCounter++;
		const item: CallbackItem<T> = {
			callback,
			id,
		};
		if (this.proxyConnections.has(priority)) {
			this.proxyConnections.get(priority)!.push(item);
		} else {
			this.proxyConnections.set(priority, [item]);
		}
		const disconnect = this.source.ConnectWithPriority(priority, callback);
		return () => {
			disconnect();
			this.proxyConnections.forEach((items) => {
				items.forEach((item, i) => {
					if (item.id === id) {
						items.remove(i);
						return;
					}
				});
			});
		};
	}

	public DisconnectAll() {
		this.proxyConnections.clear();
	}

	public Destroy() {
		this.DisconnectAll();
	}
}
