/*
 * Manually written C# typings for classes we build in C#.
 *
 * Eventually, this file will be moved to a package so all games can leverage it.
 * For now, we keep it in the bedwars project for easier iteration.
 *
 * NOTE: Errors can be ignored in this file.
 */

/** Used as a return type in observer patterns. */
type CleanupFunc = void | (() => void);

// type AirshipConnection = {
// 	Destroy(): void;
// };

type Mutable<T> = {
	-readonly [k in keyof T]: T[k];
};

interface Net {
	OnBroadcastFromClientAction(callback: (fromContext: LuauContext, clientId: number, blob: BinaryBlob) => void): void;
	OnBroadcastFromServerAction(callback: (fromContext: LuauContext, blob: BinaryBlob) => void): void;
}

interface BinaryBlob {
	Decode(): unknown;
}

interface SyncedBlob extends NetworkBehaviour {
	OnChanged(callback: (oldBlob: BinaryBlob, newBlob: BinaryBlob) => void): EngineEventConnection;
	SetBlob(blob: BinaryBlob);
	blob: BinaryBlob;
}

interface BinaryBlobConstructor {
	new (data: unknown): BinaryBlob;
}

declare const BinaryBlob: BinaryBlobConstructor;

interface PlayerManagerBridge extends Component {
	OnPlayerAdded(callback: (clientInfo: PlayerInfoDto) => void): EngineEventConnection;
	OnPlayerRemoved(callback: (clientInfo: PlayerInfoDto) => void): EngineEventConnection;
	GetPlayers(): PlayerInfoDto[];
	AddBotPlayer(username: string, userId: string, profilePictureId: string): void;
	GetPlayerInfoByClientId(clientId: number): PlayerInfoDto;
	localPlayer: PlayerInfo;
}
interface PlayerManagerConstructor {
	Instance: PlayerManagerBridge;
}
declare const PlayerManagerBridge: PlayerManagerConstructor;

interface PlayerInfo extends Component {
	connectionId: number;
	userId: string;
	username: string;
	profileImageId: string;
	orgRoleName: string;
	voiceChatAudioSource: AudioSource;
}

interface SyncVar<T> {
	Value: T;
}

interface PlayerInfoDto {
	connectionId: number;
	userId: string;
	username: string;
	profileImageId: string;
	orgRoleName: string;
	transferPacket: string;
	gameObject: GameObject;
}

interface MoveModifier {
	speedMultiplier: number;
	jumpMultiplier: number;
	blockSprint: boolean;
	blockJump: boolean;
}

declare const enum NetworkStateSystemMode {
	Input = 0,
	Authority = 1,
	Observer = 2,
}

/**
 * These events are part of the CharacterMovement API, but are not included in the default type
 * to encourage the use of the signals provided on player.character. Using the signals defined below
 * may have challenges in interacting with those signals due to the order of execution being determined
 * by C# rather than our lua runtime.
 */
interface CharacterMovementEngineEvents {
	// Processing events
	OnCreateCommand(callback: (commandNumber: number) => void): EngineEventConnection;
	OnProcessCommand(
		callback: (inputData: CharacterInputData, stateData: CharacterSnapshotData, isReplay: boolean) => void,
	): EngineEventConnection;
	OnProcessedCommand(
		callback: (inputData: CharacterInputData, stateData: CharacterSnapshotData, isReplay: boolean) => void,
	): EngineEventConnection;
	OnSetSnapshot(callback: (stateData: CharacterSnapshotData) => void): EngineEventConnection;
	OnCaptureSnapshot(callback: (commandNumber: number, time: number) => void): EngineEventConnection;
	OnInterpolateState(
		callback: (lastState: CharacterSnapshotData, nextState: CharacterSnapshotData, delta: number) => void,
	): EngineEventConnection;
	OnInterpolateReachedState(callback: (state: CharacterSnapshotData) => void): EngineEventConnection;
	OnCompareSnapshots(callback: (a: CharacterSnapshotData, b: CharacterSnapshotData) => void): EngineEventConnection;
	OnSetMode(callback: (mode: NetworkStateSystemMode) => void): EngineEventConnection;

	// Used for communicating back snapshot comparison results
	SetComparisonResult(result: boolean);
}

interface StateSnapshot {
	lastProcessedCommand: number;
	/**
	 * The time the snapshot was created. This time is local to the client/server that created it.
	 */
	// time: number;
	/**
	 * The tick the snapshot was created. This tick is local to the client/server that created it.
	 */
	tick: number;
}

interface CharacterSnapshotData extends StateSnapshot {
	position: Vector3;
	velocity: Vector3;
	currentSpeed: number;
	inputDisabled: boolean;
	isFlying: boolean;
	isSprinting: boolean;
	jumpCount: number;
	airborneFromImpulse: boolean;
	alreadyJumped: boolean;
	lastGroundedMoveDir: Vector3;
	isCrouching: boolean;
	prevStepUp: boolean;
	isGrounded: boolean;
	state: CharacterState;
	prevState: CharacterState;
	canJump: number;
	lookVector: Vector3;
	customData: BinaryBlob;
}

interface InputCommand {
	commandNumber: number;
	/**
	 * The time the input was created. This time is local to the client/server that created it.
	 */
	// time: number;
	/**
	 * The tick the input was created. This tick is local to the client/server that created it.
	 */
	tick: number;
}

interface CharacterInputData extends InputCommand {
	moveDir: Vector3;
	jump: boolean;
	crouch: boolean;
	sprint: boolean;
	lookVector: Vector3;
	customData: BinaryBlob;
}

interface CharacterNetworkedStateManager extends Component {
	serverAuth: boolean;
	serverGeneratesCommands: boolean;
}

interface CharacterMovement extends Component {
	// Interaction events
	OnStateChanged(callback: (state: CharacterState) => void): EngineEventConnection;
	OnImpactWithGround(callback: (velocity: Vector3, hitInfo: RaycastHit) => void): EngineEventConnection;
	OnMoveDirectionChanged(callback: (direction: Vector3) => void): EngineEventConnection;
	OnJumped(callback: (velocity: Vector3) => void): EngineEventConnection;
	OnNewLookVector(callback: (newLookVector: Vector3) => void): EngineEventConnection;

	// Functions
	GetLookVector(): Vector3;
	GetMoveDir(): Vector3;
	SetMoveInput(direction: Vector3, jump: boolean, sprinting: boolean, crouch: boolean, moveDirMode: number): void;
	SetMovementEnabled(isEnabled: boolean): void;
	SetLookVector(lookVector: Vector3): void;
	SetLookVectorToMoveDir(): void;
	SetCustomInputData(customData: BinaryBlob): void;
	SetCustomSnapshotData(customData: BinaryBlob): void;
	SetFlying(enabled: boolean): void;
	SetDebugFlying(enabled: boolean): void;
	IsFlying(): boolean;
	Teleport(position: Vector3): void;
	// TeleportWithoutReconcile(position: Vector3): void;
	TeleportAndLook(position: Vector3, lookVector: Vector3): void;
	// TeleportAndLookWithoutReconcile(position: Vector3, lookVector: Vector3): void;
	AddImpulse(impulse: Vector3): void;
	// AddImpulseWithoutReconcile(impulse: Vector3): void;
	SetImpulse(impulse: Vector3): void;
	// SetImpulseWithoutReconcile(impulse: Vector3): void;
	IgnoreGroundCollider(collider: Collider, ignore: boolean): void;
	IsIgnoringCollider(collider: Collider): boolean;
	SetVelocity(velocity: Vector3): void;
	GetVelocity(): Vector3;
	GetPosition(): Vector3;
	GetState(): CharacterState;
	GetTimeSinceWasGrounded(): number;
	GetTimeSinceBecameGrounded(): number;
	// GetCurrentMoveInputData(): MoveInputData;
	RequestResimulation(commandNumber: number): boolean;
	/**
	 * Get's the simulation tick that generated the provided command number. This returns the tick in the local
	 * simulation timeline.
	 *
	 * **Note: This only works for command numbers which have been completed, meaning that using this function in the OnTick and passing the input command number
	 * will result in 0 as the simulation time. The local simulation time for an input is always included with the command number in the input object.**
	 * */
	GetLocalSimulationTickFromCommandNumber(commandNumber: number): number;
	/** If this character movement has final authority on character position and values. */
	IsAuthority(): boolean;
	/**
	 * This function allows you to set the rotation of the character body and head when "rotateAutomatically" is turned off.
	 * It will use the specified look direction and respect configured visual settings. This function should be called
	 * in LateUpdate every frame with an updated look direction.
	 *
	 * Calling this only once will update the head and body rotation just enough to look in the specified direction.
	 * It will not align the rotation exactly. If you want to align the rotation exactly. First set the airshipTransform
	 * and graphicsHolder transforms to the desired look direction before calling this function. You can also use
	 * UpdateHeadRotation to set a look direction for the head directly.
	 *
	 * This function is not networked.
	 */
	UpdateCharacterRotation(lookDirection: Vector3): void;
	/**
	 * Sets the head look direction independently of the body using "Look Vector Influence". Does _NOT_ limit the
	 * amount of rotation from the body forward direction. Use UpdateCharacterRotation for rotation that takes
	 * the configured limits into account.
	 *
	 * This function is not networked.
	 */
	UpdateHeadRotation(lookDirection: Vector3): void;

	//Public
	enabled: boolean;
	disableInput: boolean;
	rb: Rigidbody;
	rootTransform: Transform; //The true position transform
	airshipTransform: Transform; //The transform controlled by the movement script
	graphicTransform: Transform; //A transform we can animate
	slopeVisualizer: Transform; //A Transform that rotates to match the slope you are standing on
	movementSettings: CharacterMovementSettings;
	animationHelper: CharacterAnimationHelper;
	mainCollider: BoxCollider;

	// Public Getters Private Setters
	currentMoveSnapshot: CharacterSnapshotData;
	currentAnimState: CharacterAnimationSyncData;
	currentCharacterHeight: number;
	standingCharacterHeight: number;
	startingLookVector: Vector3;
	characterRadius: number;
	characterHalfExtents: Vector3;
	//isGrounded: boolean;
	//isSprinting: boolean;
	groundedRaycastHit: RaycastHit;
	/** If true, the character graphics will rotate to match the look vector. */
	rotateAutomatically: boolean;
	/** If true, the character head rotates to match the look vector. rotateAutomatically must also be true. */
	rotateHeadToLookVector: boolean;
	/** Angle in degrees of allowed head movement before rotating the body. */
	headRotationThreshold: number;
	/** The amount of influence the look vector has on the head rotation. */
	lookVectorInfluence: number;
}

interface AirshipSimulationManager extends MonoBehaviour {
	replaying: boolean;
	/** Tick number of the current or last processed tick. Derived from Time.fixedTime. Will update during replays */
	tick: number;
	/** Unscaled fixed time. Generally reflects Time.unscaledFixedTime, but will update during replays */
	time: number;
	OnSetSnapshot(callback: (tick: number) => void): EngineEventConnection;
	OnTick(callback: (tick: number, time: number, replay: boolean) => void): EngineEventConnection;
	OnHistoryLifetimeReached(callback: (tick: number) => void): EngineEventConnection;
}

interface AirshipSimulationManagerWithLagCompensation {
	OnLagCompensationRequestCheck(callback: (id: string) => void): EngineEventConnection;
	OnLagCompensationRequestComplete(callback: (id: string) => void): EngineEventConnection;
	RequestLagCompensationCheck(clientId: number): string;
}

interface AirshipSimulationManagerConstructor {
	Instance: AirshipSimulationManager;
}
declare const AirshipSimulationManager: AirshipSimulationManagerConstructor;

interface Nullable<T> {
	HasValue: boolean;
	Value: T;
}

declare const enum MobileJoystickPhase {
	Began = 0,
	Moved = 1,
	Ended = 2,
}

interface InputBridge {
	OnKeyPressEvent(callback: (key: Key, isDown: boolean) => void): EngineEventConnection;
	OnLeftMouseButtonPressEvent(callback: (isDown: boolean) => void): EngineEventConnection;
	OnRightMouseButtonPressEvent(callback: (isDown: boolean) => void): EngineEventConnection;
	OnMiddleMouseButtonPressEvent(callback: (isDown: boolean) => void): EngineEventConnection;
	OnBackMouseButtonPressEvent(callback: (isDown: boolean) => void): EngineEventConnection;
	OnForwardMouseButtonPressEvent(callback: (isDown: boolean) => void): EngineEventConnection;
	OnMouseScrollEvent(callback: (scrollAmount: number) => void): EngineEventConnection;
	OnMouseMoveEvent(callback: (location: Vector2) => void): EngineEventConnection;
	OnMouseDeltaEvent(callback: (delta: Vector2) => void): EngineEventConnection;
	OnTouchEvent(callback: (touchIndex: number, position: Vector3, phase: TouchPhase) => void): EngineEventConnection;
	OnTouchTapEvent(
		callback: (touchIndex: number, position: Vector3, phase: InputActionPhase) => void,
	): EngineEventConnection;
	OnMobileJoystickEvent(callback: (position: Vector3, phase: MobileJoystickPhase) => void): EngineEventConnection;
	OnSchemeChangedEvent(callback: (scheme: string) => void): EngineEventConnection;

	IsMobileJoystickVisible(): boolean;
	SetMobileJoystickVisible(visible: boolean): void;
	IsKeyDown(key: Key): boolean;
	IsLeftMouseButtonDown(): boolean;
	IsRightMouseButtonDown(): boolean;
	IsMiddleMouseButtonDown(): boolean;
	IsForwardMouseButtonDown(): boolean;
	IsBackMouseButtonDown(): boolean;
	SetCursorVisible(isVisible: boolean): void;
	GetMousePosition(): Vector2;
	GetMouseDelta(): Vector2;
	SetMouseLocked(locked: boolean): void;
	WarpCursorPosition(pos: Vector2): void;
	IsMouseLocked(): boolean;
	GetScheme(): string;
	IsPointerOverUI(): boolean;
}

interface InputBridgeStatic {
	Instance: InputBridge;
}
declare const InputBridge: InputBridgeStatic;

declare const enum Key {
	None = 0,
	Space = 1,
	Enter = 2,
	Tab = 3,
	Backquote = 4,
	Quote = 5,
	Semicolon = 6,
	Comma = 7,
	Period = 8,
	Slash = 9,
	Backslash = 10,
	LeftBracket = 11,
	RightBracket = 12,
	Minus = 13,
	Equals = 14,
	A = 15,
	B = 16,
	C = 17,
	D = 18,
	E = 19,
	F = 20,
	G = 21,
	H = 22,
	I = 23,
	J = 24,
	K = 25,
	L = 26,
	M = 27,
	N = 28,
	O = 29,
	P = 30,
	Q = 31,
	R = 32,
	S = 33,
	T = 34,
	U = 35,
	V = 36,
	W = 37,
	X = 38,
	Y = 39,
	Z = 40,
	Digit1 = 41,
	Digit2 = 42,
	Digit3 = 43,
	Digit4 = 44,
	Digit5 = 45,
	Digit6 = 46,
	Digit7 = 47,
	Digit8 = 48,
	Digit9 = 49,
	Digit0 = 50,
	LeftShift = 51,
	RightShift = 52,
	LeftAlt = 53,
	RightAlt = 54,
	AltGr = 54,
	LeftCtrl = 55,
	RightCtrl = 56,
	LeftMeta = 57,
	LeftWindows = 57,
	LeftCommand = 57,
	LeftApple = 57,
	RightCommand = 58,
	RightMeta = 58,
	RightWindows = 58,
	RightApple = 58,
	ContextMenu = 59,
	Escape = 60,
	LeftArrow = 61,
	RightArrow = 62,
	UpArrow = 63,
	DownArrow = 64,
	Backspace = 65,
	PageDown = 66,
	PageUp = 67,
	Home = 68,
	End = 69,
	Insert = 70,
	Delete = 71,
	CapsLock = 72,
	NumLock = 73,
	PrintScreen = 74,
	ScrollLock = 75,
	Pause = 76,
	NumpadEnter = 77,
	NumpadDivide = 78,
	NumpadMultiply = 79,
	NumpadPlus = 80,
	NumpadMinus = 81,
	NumpadPeriod = 82,
	NumpadEquals = 83,
	Numpad0 = 84,
	Numpad1 = 85,
	Numpad2 = 86,
	Numpad3 = 87,
	Numpad4 = 88,
	Numpad5 = 89,
	Numpad6 = 90,
	Numpad7 = 91,
	Numpad8 = 92,
	Numpad9 = 93,
	F1 = 94,
	F2 = 95,
	F3 = 96,
	F4 = 97,
	F5 = 98,
	F6 = 99,
	F7 = 100,
	F8 = 101,
	F9 = 102,
	F10 = 103,
	F11 = 104,
	F12 = 105,
	OEM1 = 106,
	OEM2 = 107,
	OEM3 = 108,
	OEM4 = 109,
	OEM5 = 110,
	IMESelected = 111,
}

declare const enum MouseButton {
	LeftButton = 0,
	RightButton = 1,
	MiddleButton = 2,
	ForwardButton = 3,
	BackButton = 4,
}

declare const enum InputActionPhase {
	Disabled = 0,
	Waiting = 1,
	Started = 2,
	Performed = 3,
	Canceled = 4,
}

// declare const enum TouchPhase {
// 	None = 0,
// 	Began = 1,
// 	Moved = 2,
// 	Ended = 3,
// 	Canceled = 4,
// 	Stationary = 5,
// }

interface WindowProxy {
	OnWindowFocus(callback: (hasFocus: boolean) => void): void;
}

interface DestroyWatcher extends Component {
	OnDestroyedEvent(callback: () => void): EngineEventConnection;
}

interface PredictedObject extends GameObject {
	SetGraphicalObject(transform: Transform): void;
}

declare const enum CharacterState {
	Idle = 0,
	Running = 1,
	Airborne = 2,
	Sprinting = 3,
	Crouching = 4,
}

interface AccessoryHelper extends MonoBehaviour {
	RightHand: Transform;
}

interface AccessoryBuilder extends MonoBehaviour {
	rig: CharacterRig;
	firstPerson: boolean;
	currentOutfit: AccessoryOutfit;
	currentUserId: string;
	currentUserName: string;
	cancelPendingDownload: boolean;
	meshCombiner: MeshCombiner;

	/**
	 * Adds an array of accessories.
	 *
	 * **Skinned mesh accessories will not be added until you call `UpdateImmediately()`**
	 */
	// AddRange(accessoryTemplates: AccessoryComponent[]): ActiveAccessory[];
	/**
	 * Adds a single accessory.
	 *
	 * **Skinned mesh accessories will not be added until you call `UpdateImmediately()`**
	 */
	Add(accessoryTemplate: AccessoryComponent): ActiveAccessory | undefined;
	/**
	 * Sets the skin.
	 *
	 * **Will not take effect until you call `UpdateImmediately()`**
	 */
	SetSkin(skin: AccessorySkin): void;
	/**
	 *
	 * **Will not update until you call `UpdateImmediately()`**
	 */
	LoadOutfit(outfit: AccessoryOutfit): ActiveAccessory[];
	GetAccessoryRenderers(slot: AccessorySlot): Renderer[];
	GetAccessoryParticles(slot: AccessorySlot): ParticleSystem[];
	GetActiveAccessories(): ActiveAccessory[];
	GetActiveAccessoryBySlot(target: AccessorySlot): ActiveAccessory | undefined;
	GetAllAccessoryRenderers(): Renderer[];
	GetAllMeshRenderers(): MeshRenderer[];
	GetAllSkinnedMeshRenderers(): SkinnedMeshRenderer[];
	GetCombinedSkinnedMesh(): SkinnedMeshRenderer;
	GetCombinedStaticMesh(): MeshRenderer;
	/**
	 * Removes an active accessory on the given slot (if one exists).
	 *
	 * **Skinned mesh accessories will not be added until you call `UpdateCombinedMesh()`**
	 */
	RemoveBySlot(slot: AccessorySlot): void;
	/**
	 * Removes all accessories.
	 *
	 * **Skinned mesh accessories will not be added until you call `UpdateCombinedMesh()`**
	 */
	RemoveAll(): void;
	/**
	 * Removes all accessories sitting in "clothing" slots.
	 * This means everything except for the right and left hand. Clothing slots may change in the future.
	 *
	 * **Skinned mesh accessories will not be added until you call `UpdateCombinedMesh()`**
	 */
	RemoveClothingAccessories(): void;
	SetCreateOverlayMeshOnCombine(on: boolean): void;
	/**
	 *
	 * **Will not take effect until you call `UpdateCombinedMesh()`**
	 */
	SetFaceTexture(texture: Texture2D): void;
	/**
	 *
	 * **Will not take effect until you call `UpdateCombinedMesh()`**
	 */
	SetSkinColor(color: Color): void;

	/**
	 * Regenerates the combined skinned mesh. Skinned mesh accessories will not be visible until this method is called.
	 *
	 * This involves reconstructing the character mesh and LOD's which is expensive. You should limit usage of this method.
	 *
	 * **If you are only equipping a static mesh (such as a sword or hat), you do not need to call this method.** However, if you are equipping a skinned mesh shirt that bends with the character, you would need to call this method.
	 */
	UpdateCombinedMesh(): void;

	OnMeshCombined: MonoSignal<[usedMeshCombiner: boolean, skinnedMesh: SkinnedMeshRenderer, staticMesh: MeshRenderer]>;
	OnAccessoryAdded: MonoSignal<[accessories: ActiveAccessory[]]>;
	OnAccessoryRemoved: MonoSignal<[accessories: ActiveAccessory[]]>;
}

interface MeshCombiner extends MonoBehaviour {
	cacheId: string;
	DisableBaseRenderers(): void;
}
interface MeshCombinerConstructor {
	public RemoveMeshCache(cacheId: string): void;
}
declare const MeshCombiner: MeshCombinerConstructor;

interface CanvasUIEvents extends Component {
	RegisterEvents(gameObject: GameObject): void;
}

interface CanvasUIEventInterceptor extends Component {
	OnPointerEvent(callback: (instanceId: number, direction: number, button: number) => void): EngineEventConnection;
	OnHoverEvent(
		callback: (instanceId: number, hoverState: number, data: PointerEventData) => void,
	): EngineEventConnection;
	OnSubmitEvent(callback: (instanceId: number) => void): EngineEventConnection;
	OnInputFieldSubmitEvent(callback: (instanceId: number, data: string) => void): EngineEventConnection;
	OnSelectEvent(callback: (instanceId: number) => void): EngineEventConnection;
	OnDeselectEvent(callback: (instanceId: number) => void): EngineEventConnection;
	OnClickEvent(callback: (instanceId: number) => void): EngineEventConnection;
	OnValueChangeEvent(callback: (instanceId: number, value: number) => void): EngineEventConnection;
	OnToggleValueChangeEvent(callback: (instanceId: number, value: boolean) => void): EngineEventConnection;
	OnBeginDragEvent(callback: (instanceId: number, data: PointerEventData) => void): EngineEventConnection;
	OnDragEvent(callback: (instanceId: number, data: PointerEventData) => void): EngineEventConnection;
	OnScreenSizeChangeEvent(callback: (width: number, height: number) => void): EngineEventConnection;

	/**
	 * Sent to the dragged object.
	 */
	OnEndDragEvent(callback: (instanceId: number, data: PointerEventData) => void): EngineEventConnection;

	/**
	 * Sent to the dropped upon target.
	 */
	OnDropEvent(callback: (instanceId: number, data: PointerEventData) => void): EngineEventConnection;
}

interface CanvasUIBridgeConstructor {
	InitializeCanvas(canvas: Canvas, pixelPerfect: boolean): void;
	HideCanvas(canvas: Canvas): void;
	CreateVector2(x: number, y: number): Vector2;
	CreateRect(x: number, y: number, w: number, h: number): Rect;
	SetSprite(go: GameObject, path: string): void;
}
declare const CanvasUIBridge: CanvasUIBridgeConstructor;

declare namespace debug {
	function traceback(message?: string, level?: number): string;
	function traceback(thread: thread, message?: string, level?: number): string;
	function info<T extends string>(
		thread: thread,
		functionOrLevel: Callback | number,
		options: T,
	): T extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C, D, E]>>
		: T extends `${infer A}${infer B}${infer C}${infer D}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C, D]>>
		: T extends `${infer A}${infer B}${infer C}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C]>>
		: T extends `${infer A}${infer B}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B]>>
		: T extends `${infer A}${infer _}`
		? LuaTuple<TS.InfoFlags<[A]>>
		: LuaTuple<[unknown, unknown, unknown, unknown, unknown]>;
	function info<T extends string>(
		functionOrLevel: Callback | number,
		options: T,
	): T extends `${infer A}${infer B}${infer C}${infer D}${infer E}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C, D, E]>>
		: T extends `${infer A}${infer B}${infer C}${infer D}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C, D]>>
		: T extends `${infer A}${infer B}${infer C}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B, C]>>
		: T extends `${infer A}${infer B}${infer _}`
		? LuaTuple<TS.InfoFlags<[A, B]>>
		: T extends `${infer A}${infer _}`
		? LuaTuple<TS.InfoFlags<[A]>>
		: LuaTuple<[unknown, unknown, unknown, unknown, unknown]>;

	/**
	 * Sets the memory category for the current thread and any threads that spawn off of the current thread.
	 */
	function setmemorycategory(category: string): void;

	/**
	 * Gets the memory usage in bytes for the given category.
	 */
	function getmemorycategory(category: string): number;

	/**
	 * Resets the memory category for the current thread to the default category (the name of the script).
	 */
	function resetmemorycategory(): void;
}

interface TimeManager {
	/**
	 * Internal use only!
	 * @deprecated Use the global `OnTick` instead.
	 */
	OnOnTick(callback: () => void): void;
}

interface LayerMask {
	GetMask(...layers: string[]): number;
	NameToLayer(layerName: string): number;
	LayerToName(layer: number): string;
	InvertMask(mask: number): number;
	value: number;
}
declare const LayerMask: LayerMask;

interface EasyCoreAPI {
	OnInitializedEvent(callback: () => void): void;
	OnIdTokenChangedEvent(callback: (idToken: string) => void): void;
	OnGameCoordinatorEvent(callback: (messageName: string, jsonMessage: string) => void): void;
}

interface OnCompleteHook {
	OnCompleteEvent(callback: (operationResult: OperationResult) => void): void;
}

interface MeshProcessorConstructor {
	ProduceSingleBlock(
		blockIndex: number,
		world: VoxelWorld,
		triplanarMode: number,
		triplanarScale: number,
	): GameObject | undefined;
}
declare const MeshProcessor: MeshProcessorConstructor;

interface AnimationEventListener extends MonoBehaviour {
	minRepeatMessageTime: number;

	OnAnimObjEvent(callback: (data: AnimationEventData) => void): MonoSignal;
	OnAnimEvent(callback: (key: string) => void): MonoSignal;

	TriggerEvent(key: string): void;
	TriggerEventObj(obj: Object): void;
}

interface CharacterStateData {
	state: CharacterState;
	grounded: boolean;
	sprinting: boolean;
	crouching: boolean;
	localVelocity: Vector3;
}

interface CharacterAnimationHelper extends Component {
	animator: Animator;
	animationEvents?: AnimationEventListener;
	isSkidding: boolean;
	skiddingSpeed: number;
	animWalkSpeed: number;
	animRunSpeed: number;
	animCrouchSpeed: number;
	SetForceLookForward(forceLookForward: boolean): void;
	SetFirstPerson(firstPerson: boolean): void;
	SetRootMovementLayer(itemInHand: boolean): void;
	ClearStatesOnNonRootLayers(): void;
	SetState(newState: CharacterStateData);
	SetVelocity(vel: Vector3);
	SetGrounded(grounded: boolean);
	GetPlaybackSpeed(): number;
	/**
	 * Under the hood, we call `animator.CrossFadeInFixedTime()`
	 *
	 * @param clip If the clip is looping, it will play looped.
	 * @param layer
	 * @param fixedTransitionDuration The duration of the transition (in seconds).
	 */
	PlayAnimation(clip: AnimationClip, layer: CharacterAnimationLayer, fixedTransitionDuration: number): void;

	/**
	 * Under the hood, we call `animator.CrossFadeInFixedTime()`
	 *
	 * @param layer
	 * @param fixedTransitionDuration The duration of the transition (in seconds).
	 */
	StopAnimation(layer: CharacterAnimationLayer, fixedTransitionDuration: number): void;
}

declare const enum CharacterAnimationLayer {
	/** Recommended layer for idle animations  */
	OVERRIDE_1 = 1,
	/** Recommended layer for low-priority animations  */
	OVERRIDE_2 = 2,
	/** Recommended layer for medium-priority animations */
	OVERRIDE_3 = 3,
	/** Highest priority, recommended for high-priority animations */
	OVERRIDE_4 = 4,

	/** Layer with an upper body mask. */
	UPPER_BODY_1 = 5,

	/** Layer with an upper body mask. */
	UPPER_BODY_2 = 6,
}

interface AnimationClipOptions {
	fadeDuration: number;
	fadeMode: FadeMode;
	autoFadeOut: boolean;
	playSpeed: number;
	fadeOutToClip?: AnimationClip;
}

interface AnimationClipOptionsConstructor {
	new (): AnimationClipOptions;
}

declare const AnimationClipOptions: AnimationClipOptionsConstructor;

interface PoolManager {
	PreLoadPool(prefab: Object, size: number): void;
	PreLoadPool(prefab: Object, size: number, parent: Transform): void;
	SpawnObject(prefab: Object): GameObject;
	SpawnObject(prefab: Object, parent: Transform): GameObject;
	SpawnObject(prefab: Object, worldPosition: Vector3, worldRotation: Quaternion): GameObject;
	SpawnObject(prefab: Object, worldPosition: Vector3, worldPosition: Quaternion, parent: Transform): GameObject;
	ReleaseObject(clone: GameObject);
}

declare const PoolManager: PoolManager;

interface TransferManager {
	ConnectToServer(ip: string, port: number): boolean;
	/**
	 * Disconnects from server and returns to Main Menu.
	 */
	Disconnect(): void;

	KickClient(clientId: number, message: string): void;
}

interface TransferManagerConstructor {
	Instance: TransferManager;
}
declare const TransferManager: TransferManagerConstructor;

interface StateManagerStatic {
	GetString(key: string): string | undefined;
	SetString(key: string, value: string): void;
	RemoveString(key: string): void;
}
declare const StateManager: StateManagerStatic;

interface EditorSessionStateStatic {
	GetString(key: string): string | undefined;
	GetBoolean(key: string): boolean;
	SetString(key: string, value: string): void;
	RemoveString(key: string): void;
}
declare const EditorSessionState: EditorSessionStateStatic;

interface AuthSave {
	refreshToken: string;
	time: number;
}

interface AuthManagerStatic {
	GetSavedAccount(): AuthSave | undefined;
	SaveAuthAccount(refreshToken: string): void;
	ClearSavedAccount(): void;
}
declare const AuthManager: AuthManagerStatic;

interface SocketManager {
	ConnectAsyncInternal(): boolean;
	IsConnected(): boolean;
	SetScriptListening(val: boolean): void;
	EmitAsync(eventName: string, data: string): void;
	Instance: {
		OnEvent(callback: (eventName: string, data: string) => void): EngineEventConnection;
		OnDisconnected(callback: (disconnectReason: string) => void): EngineEventConnection;
	};
}
declare const SocketManager: SocketManager;

interface AirshipEventControllerBackend {
	Instance: {
		// Airship platform events can be added here
		// OnExampleEvent(callback: (eventName: string, data: string) => void): void;
	};
}

type HttpGetResponse = {
	success: boolean;
	statusCode: number;
	data: string;
	error: string;
};

interface DiskManager {
	/** Will return empty string if file not found. */
	ReadFileAsync(path: string): string | undefined;
	WriteFileAsync(path: string, content: string): boolean;
	EnsureDirectory(path: string): void;
}
declare const DiskManager: DiskManager;

interface EngineEventConnection extends Number {
	/**
	 * **NOTE**: Engine Event Connections are integer-based
	 *
	 * If you want to disconnect an engine event - use
	 * ```ts
	 * Bridge.DisconnectEvent(eventConnection)
	 * ```
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_EngineEventConnection: unique symbol;
}
/**
 * To disconnect, call `Bridge.DisconnectEvent(eventConnection)`
 */
// type EngineEventConnection = number & { /** @deprecated */ readonly _nominal_EngineEventConnection: unique symbol };

interface BridgeConstructor {
	DisconnectEvent(eventConnection: EngineEventConnection): void;
}

declare const easygg_objectrefs: unknown;

interface SteamLuauAPIConstructor {
	SetGameRichPresence(gameName: string, status: string): boolean;
	SetRichPresence(key: string, tag: string): boolean;

	OnRichPresenceGameJoinRequest(callback: (connectStr: string, steamId: number) => void): EngineEventConnection;
	OnNewLaunchParams(callback: (gameId: string, serverId: string, customData: string) => void): EngineEventConnection;
	ProcessPendingJoinRequests(): void;
	GetSteamFriends(): AirshipSteamFriendInfo[];
	GetSteamProfilePictureYielding(steamId: string): Texture2D | undefined;
	IsSteamInitialized(): boolean;
	InviteUserToGame(steamId: string, connectString: string): boolean;
}
declare const SteamLuauAPI: SteamLuauAPIConstructor;

interface AirshipLongPress extends MonoBehaviour {
	OnLongPress(callback: (pressPosition: Vector2) => void): EngineEventConnection;
}

interface RectTransform {
	IsVisibleFrom(camera: Camera): boolean;
	IsFullyVisibleFrom(camera: Camera): boolean;
}

interface CoreScriptingManager extends MonoBehaviour {
	OnClientPresenceChangeStart(
		callback: (scene: Scene, connection: NetworkConnection, added: boolean) => void,
	): EngineEventConnection;
	OnClientPresenceChangeEnd(
		callback: (scene: Scene, connection: NetworkConnection, added: boolean) => void,
	): EngineEventConnection;
}

interface AnimatorOverrideController extends RuntimeAnimatorController {
	SetClip(name: string, clip: AnimationClip): void;
	ApplyOverrides(): void;
	overridesCount: number;
}

interface ServerBootstrap {
	onProcessExit(callback: () => void): void;
	GetGameServer(): GameServer | undefined;
}

interface TerrainData {
	RemoveTree(treeIndex: number): void;
}

interface NetworkIdentity extends MonoBehaviour {
	/**
	 * The set of network connections (players) that can see this object.
	 */
	readonly observers: CSDictionary<number, NetworkConnectionToClient>;
	/**
	 * Unique identifier for NetworkIdentity objects within a scene, used for spawning scene objects.
	 */
	sceneId: number;
	/**
	 * Make this object only exist when the game is running as a server (or host).
	 */
	serverOnly: boolean;
	/**
	 * Visibility can overwrite interest management. ForceHidden can be useful to hide monsters while they respawn.
	 *
	 * ForceShown can be useful for score NetworkIdentities that should always broadcast to everyone in the world.
	 */
	visibility: Visibility;
	/**
	 * Returns true if running as a client and this object was spawned by a server.
	 */
	readonly isClient: boolean;
	/**
	 * Returns true if NetworkServer.active and server is not stopped.
	 */
	readonly isServer: boolean;
	/**
	 * Return true if this object represents the player on the local machine.
	 */
	readonly isLocalPlayer: boolean;
	/**
	 * True if this object only exists on the server
	 */
	readonly isServerOnly: boolean;
	/**
	 * True if this object exists on a client that is not also acting as a server.
	 */
	readonly isClientOnly: boolean;
	/**
	 * isOwned is true on the client if this NetworkIdentity is one of the .owned entities of our connection on the server.
	 */
	readonly isOwned: boolean;
	/**
	 * The unique network Id of this object (unique at runtime).
	 *
	 * This will be `0` if the NetworkIdentity hasn't been initialized on the network yet. This means you can check for zero to see if `onStartClient` or `onStartServer` has fired yet.
	 */
	readonly netId: number;
	readonly assetId: number;
	/**
	 * Client's network connection to the server. This is only valid for player objects on the client.
	 */
	readonly connectionToServer: NetworkConnection;
	/**
	 * Server's network connection to the client. This is only valid for client-owned objects (including the Player object) on the server.
	 */
	readonly connectionToClient: NetworkConnectionToClient | undefined;
	readonly NetworkBehaviours: NetworkBehaviour[];
	readonly SpawnedFromInstantiate: boolean;

	/**
	 * **Assign control of an object to a client via the client's NetworkConnection.**
	 *
	 * This causes `isOwned` to be set on the client that owns the object,
	 * and `NetworkBehaviour.OnStartAuthority` will be called on that client.
	 * This object then will be in the `NetworkConnection.clientOwnedObjects`
	 * list for the connection.
	 * Authority can be removed with `RemoveClientAuthority`. Only one client
	 * can own an object at any time. This does not need to be called for
	 * player objects, as their authority is setup automatically.
	 */
	AssignClientAuthority(conn: NetworkConnectionToClient): boolean;
	/**
	 * **Removes ownership for an object.**
	 *
	 * Applies to objects that had authority set by `AssignClientAuthority`,
	 * or `NetworkServer.Spawn` with a NetworkConnection parameter included.
	 * Authority cannot be removed for player objects.
	 */
	RemoveClientAuthority(): void;

	/**
	 * Called when this `NetworkIdentity` is started on the client
	 */
	readonly onStartClient: MonoSignal<void>;
	/**
	 * Called when this `NetworkIdentity` is given ownership, to the client who owns it
	 */
	readonly onStartAuthority: MonoSignal<void>;
	/**
	 * Called when this `NetworkIdentity` is stopped on the client
	 */
	readonly onStopClient: MonoSignal<void>;
	/**
	 * Called when this `NetworkIdentity` loses ownership, to the client who owned it
	 */
	readonly onStopAuthority: MonoSignal<void>;
	/**
	 * Called when this `NetworkIdentity` is started on the server
	 */
	readonly onStartServer: MonoSignal<void>;
	/**
	 * Called when this `NetworkIdentity` is stopped on the server
	 */
	readonly onStopServer: MonoSignal<void>;
}

interface NetworkTime {}

interface NetworkTimeConstructor {
	// PingInterval: number;
	// PingWindowSize: number;

	/**
	 * Returns double precision clock time _in this system_, unaffected by the network
	 */
	readonly localTime: number;
	/**
	 * The time in seconds since the server started.
	 */
	readonly time: number;
	// readonly predictionErrorUnadjusted: number;
	// readonly predictionErrorAdjusted: number;

	/**
	 * Predicted timeline in order for client inputs to be timestamped with the exact time when they will most likely arrive on the server. This is the basis for all prediction like PredictedRigidbody.
	 */
	readonly predictedTime: number;
	/**
	 * Clock difference in seconds between the client and the server. Always 0 on server.
	 */
	readonly offset: number;

	/**
	 * Round trip time (in seconds) that it takes a message to go client->server->client.
	 */
	readonly rtt: number;

	/**
	 * Round trip time variance aka jitter, in seconds.
	 */
	readonly rttVariance: number;

	// ResetStatics(): void;
}
/**
 * Synchronizes server time to clients.
 */
declare const NetworkTime: NetworkTimeConstructor;

interface VolumeProfile extends ScriptableObject {}

interface Volume extends MonoBehaviour {
	/**
	 * A value which determines which Volume is being used when Volumes have an equal amount of influence on the Scene.
	 * Volumes with a higher priority will override lower ones.
	 */
	priority: number;
	/**
	 * The total weight of this volume in the Scene. 0 means no effect and 1 means full effect.
	 */
	weight: number;
	/**
	 * Specifies whether to apply the Volume to the entire Scene or not.
	 */
	isGlobal: boolean;

	profile: VolumeProfile;
	sharedProfile: VolumeProfile;
}

interface TubeRendererCS extends MonoBehaviour {
	SetPositions(positions: Vector3[]): void;
	SetStartRadius(radius: number): void;
	GetStartRadius(): number;
	SetEndRadius(radius: number): void;
	GetEndRadius(): number;
	SetSides(sides: number): void;
}

interface TubeRendererCSConstructor {
	new (): TubeRendererCS;
}
declare const TubeRendererCS: TubeRendererCSConstructor;

interface NetworkBehaviour extends MonoBehaviour {}

interface LagCompensator extends NetworkBehaviour {
	RaycastCheck(
		viewer: NetworkConnectionToClient,
		originPoint: Vector3,
		hitPoint: Vector3,
		tolerancePercent = 0,
		layerMask = -1,
	): RaycastHit | undefined;
}

interface AccessoryComponent extends MonoBehaviour {
	accessorySlot: AccessorySlot;
	visibilityMode: VisibilityMode;
	skinnedToCharacter: boolean;
	canMeshCombine: boolean;
	bodyMask: number;
	localPosition: Vector3;
	localRotation: Quaternion;
	localScale: Vector3;

	Copy(other: AccessoryComponent): void;
	GetServerInstanceId(): string;
	GetServerClassId(): string;
	GetSlotNumber(): number;
	HasFlag(flag: BodyMask): boolean;
	SetInstanceId(id: string): void;
}

interface AnimationClipReplacementEntry {
	baseClipName: string;
	replacementClip: AnimationClip;
}

interface AnimatorClipReplacer extends MonoBehaviour {
	AnimatorController: Object | undefined;
	clipReplacements: AnimationClipReplacementEntry[];
	baseClipSelectionPresets: any[];

	/**
	 * Directly remove clip replacements to the given AnimatorOverrideController.
	 * @param controller - The AnimatorOverrideController to apply the replacements to.
	 */
	RemoveClips(controller: Object): void;
	/**
	 * Applies the animation clip replacements to the provided Animator or AnimatorOverrideController.
	 * @param controller - The Animator or AnimatorOverrideController to apply the replacements to.
	 */
	ReplaceClips(controller: Object): void;
	/**
	 * Directly applies clip replacements to the given AnimatorOverrideController.
	 * @param overrideController - The AnimatorOverrideController to apply the replacements to.
	 */
	ReplaceClips(overrideController: AnimatorOverrideController): void;
	/**
	 * Returns the RuntimeAnimatorController from the AnimatorController property.
	 * It supports Animator, GameObject, and AnimatorOverrideController types,
	 * returning the associated RuntimeAnimatorController or null if none is found.
	 */
	RuntimeAnimator: RuntimeAnimatorController | null;
}

interface PlatformGear {
	classId: string;
	accessoryPrefabs: AccessoryComponent[];
	face: AccessoryFace | undefined;
}
interface PlatformGearConstructor {
	DownloadYielding(classId: string, airId: string): PlatformGear | undefined;
}
declare const PlatformGear: PlatformGearConstructor;

interface AirAssetBundle {
	airId: string;
	LoadAsync<T extends Object = Object>(path: string): T | undefined;
	GetPaths(): string[];
}
interface AirAssetBundleStatic {
	DownloadYielding(airId: string): AirAssetBundle | undefined;
}
declare const AirAssetBundle: AirAssetBundleStatic;

interface OcclusionCam extends MonoBehaviour {
	targetCamera: Camera;
	adjustToHead: boolean;
	adjustToHeadHeightThreshold: number;

	BumpForOcclusion(targetPos: Vector3, lineOfSightCheckPos: Vector3, mask: number): number;
	Init(camera: Camera): void;
}
interface OcclusionCamConstructor {
	new (): OcclusionCam;
}
declare const OcclusionCam: OcclusionCamConstructor;

interface InternalCameraScreenshotRecorderConstructor {
	onPictureTaken: OnPictureTaken;
	readonly GetScreenshotTexture: Texture2D;

	new (): CameraScreenshotRecorder;

	TakeScreenshot(fileName: string, superSampleSize: number, png: boolean): void;
	TakeCameraScreenshot(camera: Camera, fileName: string, superSampleSize: number): void;
}
declare const InternalCameraScreenshotRecorder: InternalCameraScreenshotRecorderConstructor;

interface CameraScreenshotRecorder extends MonoBehaviour {
	saveFolder: SaveFolder;
	shouldSaveCaptures: boolean;
	resWidth: number;
	resHeight: number;
	readonly FolderName: string;
}

interface CameraScreenshotResponse {
	path: string;
	filesize: number;
	extension: string;
}

interface CameraScreenshotResponseConstructor {
	new (): CameraScreenshotResponse;
}
declare const CameraScreenshotResponse: CameraScreenshotResponseConstructor;

interface AirshipUniVoiceNetworkConstructor {
	new (): AirshipUniVoiceNetwork;
}
declare const AirshipUniVoiceNetwork: AirshipUniVoiceNetworkConstructor;

interface AirshipUniVoiceNetwork extends NetworkBehaviour, IChatroomNetwork {
	agent: ChatroomAgent;
	readonly OwnID: number;
	readonly PeerIDs: Readonly<number[]>;

	onPlayerSpeakingLevel: MonoSignal<[connectionId: number, speakingLevel: number]>;
	onLocalSpeakingLevel: MonoSignal<[connectionId: number, speakingLevel: number]>;
	readonly OnCreatedChatroom: MonoSignal<void>;
	readonly OnChatroomCreationFailed: MonoSignal<unknown>;
	readonly OnClosedChatroom: MonoSignal<void>;
	readonly OnJoinedChatroom: MonoSignal<number>;
	readonly OnChatroomJoinFailed: MonoSignal<unknown>;
	readonly OnLeftChatroom: MonoSignal<void>;
	readonly OnPeerJoinedChatroom: MonoSignal<number, number, AudioSource>;
	readonly OnPeerLeftChatroom: MonoSignal<number>;
	readonly OnAudioReceived: MonoSignal<number, ChatroomAudioSegment>;
	readonly OnAudioBroadcasted: MonoSignal<ChatroomAudioSegment>;

	BroadcastAudioSegment(data: ChatroomAudioSegment): void;
	CloseChatroom(data: unknown): void;
	Dispose(): void;
	FromByteArray<T>(data: Readonly<number[]>): T;
	GetSpeakingLevel(connectionId: number): number;
	HostChatroom(data: unknown): void;
	JoinChatroom(data: unknown): void;
	LeaveChatroom(data: unknown): void;
	NetworkServer_OnDisconnected(connection: NetworkConnectionToClient): void;
	OnReadyCommand(sender: NetworkConnectionToClient): void;
	OnStartServer(): void;
	ToByteArray<T>(obj: T): Readonly<number[]>;
	Weaved(): boolean;
	SetConnectionMuted(connectionId: number, muted: boolean): void;
	SetDeafened(deafened: boolean): void;
}

interface IChatroomNetwork {
	readonly OwnID: number;
	readonly PeerIDs: Readonly<number[]>;

	readonly OnCreatedChatroom: MonoSignal<void>;
	readonly OnChatroomCreationFailed: MonoSignal<unknown>;
	readonly OnClosedChatroom: MonoSignal<void>;
	readonly OnJoinedChatroom: MonoSignal<number>;
	readonly OnChatroomJoinFailed: MonoSignal<unknown>;
	readonly OnLeftChatroom: MonoSignal<void>;
	readonly OnPeerJoinedChatroom: MonoSignal<number, number, AudioSource>;
	readonly OnPeerLeftChatroom: MonoSignal<number>;
	readonly OnAudioReceived: MonoSignal<number, ChatroomAudioSegment>;
	readonly OnAudioBroadcasted: MonoSignal<ChatroomAudioSegment>;

	BroadcastAudioSegment(data: ChatroomAudioSegment): void;
	CloseChatroom(data: unknown): void;
	HostChatroom(data: unknown): void;
	JoinChatroom(data: unknown): void;
	LeaveChatroom(data: unknown): void;
}

interface ChatroomAudioSegment {
	segmentIndex: number;
	frequency: number;
	channelCount: number;
	samples: Readonly<number[]>;
}

interface ChatroomAgent {
	PeerOutputs: CSDictionary<number, IAudioOutput>;
	OnModeChanged: unknown;
	PeerSettings: CSDictionary<number, ChatroomPeerSettings>;
	readonly Network: IChatroomNetwork;
	readonly AudioInput: IAudioInput;
	readonly AudioOutputFactory: IAudioOutputFactory;
	readonly CurrentMode: ChatroomAgentMode;
	MuteOthers: boolean;
	MuteSelf: boolean;

	Dispose(): void;
}

enum Scope {
	Game = 0,
	Server = 1,
}

interface TopicDescription {
	scope: Scope;
	topicNamespace: string;
	topicName: string;
}

interface MessagingManager {
	ConnectAsyncInternal(): boolean;
	IsConnected(): boolean;
	SubscribeAsync(scope: Scope, topicNamespace: string, topicName: string): boolean;
	UnsubscribeAsync(scope: Scope, topicNamespace: string, topicName: string): boolean;
	PublishAsync(scope: Scope, topicNamespace: string, topicName: string, data: string): boolean;
	Instance: {
		OnEvent(callback: (topic: TopicDescription, data: string) => void): EngineEventConnection;
		OnDisconnected(callback: (disconnectReason: string) => void): EngineEventConnection;
	};
}
declare const MessagingManager: MessagingManager;

const enum FrameHealth {
	Ok = 0,
	Unhealthy = 1,
}

interface QualityReport {
	/** Average GPU time over numFrames. */
	gpuAvg: number;
	/** Average CPU main thread time over numFrames. */
	cpuMainAvg: number;
	/** Average CPU render thread time over numFrames. */
	cpuRenderAvg: number;

	/** Number of frames recorded in quality report. This will be zero if unsupported on device. */
	numFrames: number;
}

interface QualityManager {
	/**
	 * Quality check is fired 15 seconds after a client joins the game. If the report's
	 * frame health is unhealthy you should reduce quality settings.
	 */
	OnQualityCheck(callback: (frameHealth: FrameHealth, report: QualityReport) => void): EngineEventConnection;
}
declare const QualityManager: QualityManager;
