/// <reference no-default-lib="true"/>

/**
 * A TypeScript parallel to the C# MonoBehaviour for Airship.
 *
 * - To expose the serializable properties to the inspector, it must be exported as `default`.
 *
 * Example declaration:
 * ```ts
 * export default class ExampleBehaviour extends AirshipBehaviour {
 * 	public OnStart() {
 * 		print("Hello, World!");
 * 	}
 * }
 * ```
 */
declare abstract class AirshipBehaviour {
	/**
	 * The `GameObject` this behaviour is attached to.
	 */
	public readonly gameObject: GameObject;

	/**
	 * The `Transform` this behaviour is attached to.
	 */
	public readonly transform: Transform;

	/**
	 * ## Use {@link Awake} instead of overloading the constructor!
	 * - You can specify non-optional properties using the null-assertion operator - `!`
	 *
	 * ```ts
	 * export default class ExampleBehaviour extends AirshipBehaviour {
	 * 	textComponent!: TMP_Text;
	 * 	Awake() {
	 * 		this.textComponent = this.gameObject.GetComponent<TMP_Text>();
	 * 	}
	 * }
	 * ```
	 *
	 * @deprecated
	 */
	protected constructor();

	/**
	 * Awake is called when an enabled script instance is being loaded.
	 */
	public Awake(): void;
	/**
	 * This function is called when the object becomes enabled and active.
	 */
	public OnEnable(): void;
	/**
	 * This function is called when the behaviour becomes disabled.
	 */
	public OnDisable(): void;
	/**
	 * OnStart is called on the frame when a script is enabled just before any of the Update methods are called the first time.
	 */
	public Start(): void;
	/**
	 * Destroying the attached Behaviour will result in the game or Scene receiving OnDestroy.
	 */
	public OnDestroy(): void;
	/**
	 * Update is called every frame, if the AirshipBehaviour is enabled.
	 */
	public Update(dt: number): void;
	/**
	 * LateUpdate is called every frame, if the AirshipBehaviour is enabled.
	 */
	public LateUpdate(dt: number): void;
	/**
	 * Frame-rate independent AirshipBehaviour.FixedUpdate message for physics calculations.
	 */
	public FixedUpdate(dt: number): void;

	/**
	 * Called when this collider/rigidbody starts touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionEnter.html
	 */
	public OnCollisionEnter(collision: Collision): void;

	/**
	 * Called once per frame while this collider/rigidbody is touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionStay.html
	 */
	public OnCollisionStay(collision: Collision): void;

	/**
	 * Called when this collider/rigidbody stops touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionExit.html
	 */
	public OnCollisionExit(collision: Collision): void;

	/**
	 * Called when this collider/rigidbody starts touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionEnter2D.html
	 */
	public OnCollisionEnter2D(collision2D: Collision2D): void;

	/**
	 * Called once per frame while this collider/rigidbody is touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionStay2D.html
	 */
	public OnCollisionStay2D(collision2D: Collision2D): void;

	/**
	 * Called when this collider/rigidbody stops touching another collider/rigidbody.
	 * @param collision Collision data.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnCollisionExit2D.html
	 */
	public OnCollisionExit2D(collision2D: Collision2D): void;

	/**
	 * Called when this collider/rigidbody starts touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerEnter.html
	 */
	public OnTriggerEnter(collider: Collider): void;

	/**
	 * Called once per frame while this collider/rigidbody is touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerStay.html
	 */
	public OnTriggerStay(collider: Collider): void;

	/**
	 * Called when this collider/rigidbody stops touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerExit.html
	 */
	public OnTriggerExit(collider: Collider): void;

	/**
	 * Called when this collider/rigidbody starts touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerEnter2D.html
	 */
	public OnTriggerEnter2D(collider2D: Collider2D): void;

	/**
	 * Called once per frame while this collider/rigidbody is touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerStay2D.html
	 */
	public OnTriggerStay2D(collider2D: Collider2D): void;

	/**
	 * Called when this collider/rigidbody stops touching another collider/rigidbody.
	 * @param collider Collider.
	 * @see https://docs.unity3d.com/ScriptReference/Collider.OnTriggerExit2D.html
	 */
	public OnTriggerExit2D(collider2D: Collider2D): void;
}

type AirshipDecorator<T> = T & {
	__airship_Decorator: never;
};

type AirshipBehaviourFieldDecorator<T extends ReadonlyArray<unknown>> = (
	...args: T
) => AirshipDecorator<(target: AirshipBehaviour, property: string) => void>;
type AirshipBehaviourClassDecorator<T extends ReadonlyArray<unknown>> = (...args: T) => AirshipDecorator<(target: typeof AirshipBehaviour) => void>;

/**
 * Marks this property to not be serialized in an AirshipBehaviour
 *
 * @see https://docs.unity3d.com/ScriptReference/NonSerialized.html
 */
declare const NonSerialized: AirshipBehaviourFieldDecorator<[]>;

/**
 * Marks this property to be serialized in an AirshipBehaviour (exposing private or protected properties)
 *
 * @see https://docs.unity3d.com/ScriptReference/SerializeField.html
 */
declare const SerializeField: AirshipBehaviourFieldDecorator<[]>;

/**
 * Use this to add a header above some fields in the Inspector.
 */
declare const Header: AirshipBehaviourFieldDecorator<[header: string]>;
/**
 * Specify a tooltip for a field in the Inspector window.
 */
declare const Tooltip: AirshipBehaviourFieldDecorator<[tooltip: string]>;
/**
 * Attribute used to make a float or int variable in a script be restricted to a specific range.
 */
declare const Range: AirshipBehaviourFieldDecorator<[min: number, max: number]>;
/**
 * @deprecated Not yet implemented
 */
declare const Min: AirshipBehaviourFieldDecorator<[min: number]>;
/**
 * @deprecated Not yet implemented
 */
declare const Max: AirshipBehaviourFieldDecorator<[max: number]>;
/**
 * Attribute used to make a string value be shown in a multiline textarea.
 */
declare const Multiline: AirshipBehaviourFieldDecorator<[lines?: number]>;
/**
 * @deprecated Not yet implemented
 */
declare const TextArea: AirshipBehaviourFieldDecorator<[]>;
/**
 * @deprecated Not yet implemented
 */
declare const HideInInspector: AirshipBehaviourFieldDecorator<[]>;
/**
 * Use this to add some spacing in the Inspector.
 */
declare const Spacing: AirshipBehaviourFieldDecorator<[height?: number]>;
/**
 * @deprecated Not yet implemented
 */
declare const InspectorName: AirshipBehaviourFieldDecorator<[name: string]>;
/**
 * @deprecated Not yet implemented
 */
declare const ColorUsage: AirshipBehaviourFieldDecorator<[hdr: boolean, showAlpha: boolean]>;

declare const AirshipComponentMenu: AirshipBehaviourClassDecorator<[path: string]>;
