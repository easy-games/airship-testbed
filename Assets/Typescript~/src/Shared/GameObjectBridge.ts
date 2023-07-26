import { CollectionTag } from "./Util/CollectionTag";
import { RunUtil } from "./Util/RunUtil";

/** Wrapper around `Object` functionality. */
export class GameObjectUtil {
	/**
	 * Instantiate an Object.
	 * @param original The object being instantiated.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 * @returns The instantiated GameObject.
	 */
	public static Instantiate(original: Object, tag?: CollectionTag): GameObject {
		/** Fire `GameObjectInstantiated` event if tagged. */
		const go = Object.Instantiate(original) as GameObject;
		if (tag) {
			GameObjectUtil.FireTaggedGameObjectInstantiatedSignal(go, tag);
		}
		return go;
	}

	/**
	 * Instantiate an Object positionally.
	 * @param original The object being instantiated.
	 * @param position The position to instantiate object at.
	 * @param rotation The rotation with instantiate object with.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 * @returns The instantiated GameObject.
	 */
	public static InstantiateAt(
		original: Object,
		position: Vector3,
		rotation: Quaternion,
		tag?: CollectionTag,
	): GameObject {
		/** Fire `GameObjectInstantiated` event if tagged. */
		const go = Object.Instantiate(original, position, rotation) as GameObject;
		if (tag) {
			GameObjectUtil.FireTaggedGameObjectInstantiatedSignal(go, tag);
		}
		return go;
	}

	/**
	 * Instantiate an Object as a child of `parent`.
	 * @param original The object being instantiated.
	 * @param parent The object to instantiate as a child of.
	 * @param tag An optional tag to register `GameObject` with `CollectionManager`.
	 * @returns The instantiated GameObject.
	 */
	public static InstantiateIn(original: Object, parent: Transform, tag?: CollectionTag): GameObject {
		/** Fire `GameObjectInstantiated` event if tagged. */
		const go = Object.Instantiate(original, parent) as GameObject;
		if (tag) {
			GameObjectUtil.FireTaggedGameObjectInstantiatedSignal(go, tag);
		}
		return go;
	}

	/**
	 * Destroys a GameObject.
	 * @param gameObject GameObject to destroy.
	 * @param delay The optional amount of time to delay before destroying the object.
	 */
	public static Destroy(gameObject: GameObject, delay?: number): void {
		if (delay !== undefined) {
			Object.Destroy(gameObject, delay);
		} else {
			Object.Destroy(gameObject);
		}
	}

	/** Fire relevant `GameObjectInstantiated` event based on runtime. */
	private static FireTaggedGameObjectInstantiatedSignal(gameObject: GameObject, tag: CollectionTag): void {
		if (RunUtil.IsServer()) {
			import("Server/ServerSignals").then((serverSignalsRef) => {
				const tagAddedSignal = serverSignalsRef.ServerSignals.CollectionManagerTagAdded;
				tagAddedSignal.Fire({ go: gameObject, tag: tag });
			});
		} else if (RunUtil.IsClient()) {
			import("Client/ClientSignals").then((clientSignalsRef) => {
				const tagAddedSignal = clientSignalsRef.ClientSignals.CollectionManagerTagAdded;
				tagAddedSignal.Fire({ go: gameObject, tag: tag });
			});
		}
	}
}
