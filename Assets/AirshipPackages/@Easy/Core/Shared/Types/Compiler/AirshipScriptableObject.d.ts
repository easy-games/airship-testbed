/**
 * A class you can derive from if you want to create objects that live independently of GameObjects.
 * Use ScriptableObjects to centralise data in a way that can be conveniently accessed from scenes and assets within a project.
 *
 * You can use the {@link CreateAssetMenu} decorator to create it from the Editor UI, or by using the `Assets -> Create -> Airship -> Airship Scriptable Object Asset...` menu
 *
 * ```ts
 * export default class ExampleScriptableObject extends AirshipScriptableObject {
 * 	public greetingTarget = "world";

 *		public Awake() {
 *			print("Hello, ", this.greetingTarget + "!");
 *		}
 * }
 * ```
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
	 * Creates an instance of a scriptable object.
	 *
	 * To easily create a ScriptableObject instance that is bound to a .asset file via the Editor user interface, consider using {@link CreateAssetMenu}.
	 */
	public static CreateInstance<T extends AirshipScriptableObject>(): T;
}

type AirshipScriptableObjectDecorator<T extends ReadonlyArray<unknown>> = (
	...args: T
) => AirshipDecorator<(target: typeof AirshipScriptableObject) => void>;

declare const CreateAssetMenu: AirshipScriptableObjectDecorator<[menuName?: string, fileName?: string, order?: number]>;
