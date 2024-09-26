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

interface BinaryBlobConstructor {
	new (data: unknown): BinaryBlob;
}

declare const BinaryBlob: BinaryBlobConstructor;

interface Time {
	/**
	 * The time at the beginning of the current frame in seconds since the start of the application (Read Only).
	 *
	 * This is the time in seconds since the start of the application, which Time.timeScale scales and Time.maximumDeltaTime adjusts. When called from inside AirshipBehaviour.FixedUpdate, it returns Time.fixedTime.
	 *
	 * This value is undefined during Awake messages and starts after all of these messages are finished. This value does not update if the Editor is paused. See Time.realtimeSinceStartup for a time value that is unaffected by pausing.
	 */
	time: number;

	/**
	 * The interval in seconds from the last frame to the current one (Read Only).
	 *
	 * When this is called from inside AirshipBehaviour.FixedUpdate, it returns Time.fixedDeltaTime. The maximum value for deltaTime is defined by Time.maximumDeltaTime.
	 */
	deltaTime: number;
	fixedDeltaTime: number;

	/**
	 * The total number of frames since the start of the game (Read Only).
	 *
	 * This value starts at 0 and increases by 1 on each Update phase.
	 *
	 * Internally, Unity uses a 64 bit integer which it downcasts to 32 bits when this is called, and discards the most significant (i.e. top) 32 bits.
	 */
	frameCount: number;
	timeScale: number;
	unscaledDeltaTime: number;
	unscaledTime: number;
}

declare const Time: Time;

interface PlayerManagerBridge extends Component {
	OnPlayerAdded(callback: (clientInfo: PlayerInfoDto) => void): EngineEventConnection;
	OnPlayerRemoved(callback: (clientInfo: PlayerInfoDto) => void): EngineEventConnection;
	GetPlayers(): CSArray<PlayerInfoDto>;
	AddBotPlayer(username: string, tag: string, userId: string): void;
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
	gameObject: GameObject;
}

interface MoveModifier {
	speedMultiplier: number;
	jumpMultiplier: number;
	blockSprint: boolean;
	blockJump: boolean;
}

interface CharacterMovement extends Component {
	OnStateChanged(callback: (state: CharacterState) => void): EngineEventConnection;
	OnSetCustomData(callback: () => void): EngineEventConnection;
	OnBeginMove(callback: (inputData: MoveInputData, isReplay: boolean) => void): EngineEventConnection;
	OnEndMove(callback: (inputData: MoveInputData, isReplay: boolean) => void): EngineEventConnection;
	OnDispatchCustomData(callback: (tick: number, customData: BinaryBlob) => void): EngineEventConnection;
	OnImpactWithGround(callback: (velocity: Vector3) => void): EngineEventConnection;
	OnAdjustMove(callback: (modifier: MoveModifier) => void): EngineEventConnection;
	OnMoveDirectionChanged(callback: (direction: Vector3) => void): EngineEventConnection;
	OnJumped(callback: (velocity: Vector3) => void): EngineEventConnection;

	GetLookVector(): Vector3;
	IsSprinting(): boolean;
	IsGrounded(): boolean;
	enabled: boolean;

	SetMoveInput(
		direction: Vector3,
		jump: boolean,
		sprinting: boolean,
		crouch: boolean,
		moveDirWorldSpace: boolean,
	): void;
	SetLookVector(lookVector: Vector3): void;
	SetCustomData(customData: BinaryBlob): void;
	SetFlying(enabled: boolean): void;
	SetDebugFlying(enabled: boolean): void;
	IsFlying(): boolean;
	Teleport(position: Vector3): void;
	TeleportAndLook(position: Vector3, lookVector: Vector3): void;
	AddImpulse(impulse: Vector3): void;
	SetImpulse(impulse: Vector3): void;
	IgnoreGroundCollider(collider: Collider, ignore: boolean): void;
	IsIgnoringCollider(collider: Collider): boolean;
	SetVelocity(velocity: Vector3): void;
	GetVelocity(): Vector3;
	DisableMovement();
	EnableMovement();
	GetState(): CharacterState;
	UpdateSyncTick(): void;
	GetNextTick(): number;
	GetPrevTick(): number;
	GetTimeSinceWasGrounded(): number;
	GetTimeSinceBecameGrounded(): number;
	GetCurrentMoveInputData(): MoveInputData;

	rootTransform: Transform; //The true position transform
	networkTransform: Transform; //The interpolated network transform
	graphicTransform: Transform; //A transform we can animate

	moveData: CharacterMovementData;

	groundedBlockId: number;
	groundedBlockPos: Vector3;
	groundedRaycastHit: RaycastHit;
	replicatedLookVector: Vector3;
	disableInput: boolean;

	animationHelper: CharacterAnimationHelper;

	standingCharacterHeight: number;
	currentCharacterHeight: number;
	characterRadius: number;
	characterHalfExtents: Vector3;
	mainCollider: BoxCollider;
}

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

interface ProjectileNetworkBehaviour extends Component {
	OnCollide(callback: (collision: Collision) => void): EngineEventConnection;
}

interface OcclusionCam extends Component {
	targetCamera: Camera;
	Init(camera: Camera);
	BumpForOcclusion(attachToPos: Vector3, mask: number): void;
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

interface ProjectileManager {
	OnProjectileCollide(callback: (projectile: AirshipProjectile, collision: Collision) => void): void;
	OnProjectileValidate(callback: (validateEvent: ProjectileValidateEvent) => void): void;
	OnProjectileLaunched(callback: (projectile: AirshipProjectile, shooter: GameObject) => void): void;
}
interface ProjectileManagerConstructor {
	Instance: ProjectileManager;
}
declare const ProjectileManager: ProjectileManagerConstructor;


interface AirshipProjectile {
	OnHit(callback: (event: ProjectileHitEvent) => void): EngineEventConnection;
}

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

    OnAnimObjEvent(callback: (data: AnimationEventData) => void): EngineEventConnection;
    OnAnimEvent(callback: (key: string) => void): EngineEventConnection;

    TriggerEvent(key: string): void;
    TriggerEventObj(obj: Object): void;
}

interface CharacterAnimationHelper extends Component {
	animator: Animator;
	animationEvents?: AnimationEventListener;
	SetForceLookForward(forceLookForward: boolean): void;
	SetFirstPerson(firstPerson: boolean): void;
	SetRootMovementLayer(itemInHand: boolean): void;
	ClearStatesOnNonRootLayers(): void;
	SetState(newState: CharacterState, force = false, noRootLayerFade = false);
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
	PlayAnimation(clip: AnimationClip, layer: CharacterAnimationLayer, fixedTransitionDuration: number);

	/**
	 * Under the hood, we call `animator.CrossFadeInFixedTime()`
	 *
	 * @param layer
	 * @param fixedTransitionDuration The duration of the transition (in seconds).
	 */
	StopAnimation(layer: CharacterAnimationLayer, fixedTransitionDuration: number);
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
	SpawnObject(prefab: Object, localPosition: Vector3, localRotation: Quaternion, parent: Transform): GameObject;
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
}
declare const DiskManager: DiskManager;

/**
 * To disconnect, call `Bridge.DisconnectEvent(eventConnection)`
 */
type EngineEventConnection = number;

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
	GetSteamFriends(): CSArray<AirshipSteamFriendInfo>;
	IsSteamInitialized(): boolean;
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
	readonly NetworkBehaviours: CSArray<NetworkBehaviour>;
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
