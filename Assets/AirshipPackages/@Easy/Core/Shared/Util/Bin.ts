interface ConnectionLike {
	Disconnect(this: ConnectionLike): void;
}

interface SignalLike<T extends Callback = Callback> {
	Connect(this: SignalLike, callback: T): () => void;
}

type Trackable =
	| GameObject
	| ConnectionLike
	// | AirshipConnection
	| MonoSignalConnection
	| Promise<unknown>
	| thread
	| ((...args: unknown[]) => unknown)
	| { destroy: () => void }
	| { disconnect: () => void }
	| { Destroy: () => void }
	| { Disconnect: () => void };

const FN_MARKER = "__bin_fn_marker__";
const THREAD_MARKER = "__bin_thread_marker__";
const MONO_SIGNAL_CONN_MARKER = "__bin_mono_conn_marker__";

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
	} else if ((t as unknown) === "MonoSignalConnection") {
		return MONO_SIGNAL_CONN_MARKER;
	}
	if (cleanupMethod !== undefined) {
		return cleanupMethod;
	}
	if (t === "userdata") {
		return "Destroy";
	} else if (t === "table") {
		if ("Destroy" in obj) {
			return "Destroy";
		} else if ("Disconnect" in obj) {
			return "Disconnect";
		} else if ("destroy" in obj) {
			return "destroy";
		} else if ("disconnect" in obj) {
			return "disconnect";
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
			(track.obj as () => void)();
		} else if (track.cleanup === THREAD_MARKER) {
			coroutine.close(track.obj as thread);
		} else if (track.cleanup === MONO_SIGNAL_CONN_MARKER) {
			(track.obj as MonoSignalConnection).Disconnect();
		} else {
			(track.obj as Record<string, (self: unknown) => void>)[track.cleanup](track.obj);
		}
	}
}
