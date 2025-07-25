interface ConnectionLike {
	Disconnect(this: ConnectionLike): void;
}

interface SignalLike<T extends Callback = Callback> {
	Connect(this: SignalLike, callback: T): () => void;
}

type Trackable =
	| GameObject
	| ConnectionLike
	| MonoSignalConnection
	| Promise<unknown>
	| thread
	| ((...args: unknown[]) => unknown)
	| { destroy: () => void }
	| { disconnect: () => void }
	| { unsubscribe: () => void }
	| { Destroy: () => void }
	| { Disconnect: () => void }
	| { Unsubscribe: () => void };

const FN_MARKER = "__bin_fn_marker__";
const THREAD_MARKER = "__bin_thread_marker__";
// const MONO_SIGNAL_CONN_MARKER = "__bin_mono_conn_marker__";

const DISCONNECT_MARKER = "__bin_disconnect__";
const DESTROY_MARKER = "__bin_destroy__";

interface Track {
	obj: Trackable;
	cleanup: string;
}

function getObjCleanupFn<T extends Trackable>(obj: T, cleanupMethod?: string): string {
	const t = typeOf(obj);
	if (t === "function") {
		return FN_MARKER;
	} else if (t === "thread") {
		return THREAD_MARKER;
	}
	if (cleanupMethod !== undefined) {
		return cleanupMethod;
	}
	if (t === "UnityObject") {
		return DESTROY_MARKER;
	} else if (t === "MonoSignalConnection") {
		return DISCONNECT_MARKER;
	} else if (t === "userdata") {
		if (tostring(obj) === "MonoSignalConnection") {
			return DISCONNECT_MARKER;
		}
		return DESTROY_MARKER;
	} else if (t === "table") {
		if ("Destroy" in obj) {
			return "Destroy";
		} else if ("Disconnect" in obj) {
			return "Disconnect";
		} else if ("Unsubscribe" in obj) {
			return "Unsubscribe";
		} else if ("destroy" in obj) {
			return "destroy";
		} else if ("disconnect" in obj) {
			return "disconnect";
		} else if ("unsubscribe" in obj) {
			return "unsubscribe";
		}
	}
	error(`failed to get cleanup function for object ${typeOf(obj)}: ${tostring(obj)}`, 3);
}

/**
 * Class for tracking and cleaning up resources.
 */
export class Bin {
	private objects = new Array<Track>();
	private cleaning = false;

	/** Add an object to the bin. */
	public Add<T extends Trackable>(obj: T, cleanupMethod?: string): T {
		if (this.cleaning) {
			error("cannot call bin.Add() while cleaning", 2);
		}
		const cleanup = getObjCleanupFn(obj, cleanupMethod);
		this.objects.push({ obj, cleanup });
		return obj;
	}

	/**
	 * Shortcut for cleaning up EngineEventConnections.
	 *
	 * For example: cleaning up a `CanvasAPI` event connection.
	 *
	 * This will automatically call `Bridge.DisconnectEvent()`
	 *
	 * @param connection
	 */
	public AddEngineEventConnection(connection: EngineEventConnection): void {
		this.Add(() => Bridge.DisconnectEvent(connection));
	}

	/** Connect a callback to a given signal. */
	public Connect<T extends Callback>(
		signal: SignalLike<T>,
		handler: (...args: Parameters<T>) => void,
	): ReturnType<typeof signal.Connect> {
		if (this.cleaning) {
			error("cannot call bin.Connect() while cleaning", 2);
		}
		return this.Add((signal as SignalLike).Connect(handler));
	}

	/** Create a new Bin which will be immediately added to this bin. */
	public Extend() {
		if (this.cleaning) {
			error("cannot call bin.Extend() while cleaning", 2);
		}
		return this.Add(new Bin());
	}

	/** Clean up all tracked objects. */
	public Clean() {
		if (this.cleaning) return;
		this.cleaning = true;
		this.objects.forEach((obj) => this.cleanupObj(obj));
		this.objects.clear();
		this.cleaning = false;
	}

	/**
	 * @deprecated use {@link Clean} instead.
	 *
	 * Alias for `Bin.Clean()`.
	 *
	 **/
	public Destroy() {
		this.Clean();
	}

	private cleanupObj(track: Track) {
		if (track.cleanup === FN_MARKER) {
			task.spawnDetached(track.obj as () => void);
		} else if (track.cleanup === THREAD_MARKER) {
			coroutine.close(track.obj as thread);
		} else if (track.cleanup === DISCONNECT_MARKER) {
			(track.obj as ConnectionLike).Disconnect();
		} else if (track.cleanup === DESTROY_MARKER) {
			Object.Destroy(track.obj);
		} else {
			task.spawnDetached(() => {
				(track.obj as Record<string, (self: unknown) => void>)[track.cleanup](track.obj);
			});
		}
	}
}
