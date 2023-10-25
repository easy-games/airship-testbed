/** Wrapper around `Object` functionality. */
export class GameObjectUtil {
	/**
	 * Instantiate an Object.
	 * @param original The object being instantiated.
	 * @returns The instantiated GameObject.
	 */
	public static Instantiate(original: Object): GameObject {
		/** Fire `GameObjectInstantiated` event if tagged. */
		const go = Object.Instantiate(original) as GameObject;
		return go;
	}

	/**
	 * Instantiate an Object positionally.
	 * @param original The object being instantiated.
	 * @param position The position to instantiate object at.
	 * @param rotation The rotation with instantiate object with.
	 * @returns The instantiated GameObject.
	 */
	public static InstantiateAt(original: Object, position: Vector3, rotation: Quaternion): GameObject {
		const go = Object.Instantiate(original, position, rotation) as GameObject;
		return go;
	}

	/**
	 * Instantiate an Object as a child of `parent`.
	 * @param original The object being instantiated.
	 * @param parent The object to instantiate as a child of.
	 * @returns The instantiated GameObject.
	 */
	public static InstantiateIn(original: Object, parent: Transform): GameObject {
		const go = Object.Instantiate(original, parent) as GameObject;
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
}
