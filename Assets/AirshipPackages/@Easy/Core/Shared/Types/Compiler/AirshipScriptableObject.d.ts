/**
 * A class you can derive from if you want to create objects that live independently of GameObjects.
 * Use ScriptableObjects to centralise data in a way that can be conveniently accessed from scenes and assets within a project.
 *
 * You can save scriptable assets to asset files from the Editor UI via the {@link CreateAssetMenu} decorator, or by using the `Assets -> Create -> Airship -> Airship Scriptable Object Asset...` menu
 *
 * If the scriptable
 */
declare abstract class AirshipScriptableObject {
	/**@internal @hidden Internal Nominal Marker for ScriptableObject - Do not use  */
	private _nominal_ScriptableObject: never;

	/**
	 * Awake is called when an enabled script instance is being loaded.
	 */
	protected Awake?(): void;
	protected OnEnable?(): void;
	protected OnDisable?(): void;
	protected OnDestroy?(): void;

	/**
	 * Creates an instance of a scriptable object - can be useful for creating sd
	 */
	public static CreateInstance<T extends AirshipScriptableObject>(): T;
}
