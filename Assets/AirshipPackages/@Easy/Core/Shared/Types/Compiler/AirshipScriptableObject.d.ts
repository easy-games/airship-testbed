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
}
