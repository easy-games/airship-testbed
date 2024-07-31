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
	OnBroadcastFromClientAction(callback: (clientId: number, blob: BinaryBlob) => void): void;
	OnBroadcastFromServerAction(callback: (blob: BinaryBlob) => void): void;
}

interface BinaryBlob {
	Decode(): unknown;
}

interface BinaryBlobConstructor {
	new (data: unknown): BinaryBlob;
}

declare const BinaryBlob: BinaryBlobConstructor;

interface Time {
	time: number;
	deltaTime: number;
	fixedDeltaTime: number;
	frameCount: number;
	timeScale: number;
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
	IsFlying(): boolean;
	SetAllowFlight(allowed: boolean): void;
	IsAllowFlight(): boolean;
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

	moveData: CharacterMoveData;

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

interface VoxelWorld {
	OnVoxelPlaced(callback: (voxel: number, x: number, y: number, z: number) => void): EngineEventConnection;
	OnPreVoxelPlaced(callback: (voxel: number, x: number, y: number, z: number) => void): EngineEventConnection;
	OnFinishedLoading(callback: () => void): EngineEventConnection;
	OnFinishedReplicatingChunksFromServer(callback: () => void): EngineEventConnection;
}

interface VoxelWorldConstructor {
	VoxelDataToBlockId(voxel: number);
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

interface AgonesServiceConstructor {
	Agones: AgonesProxy;
}

interface AgonesProxy {
	OnConnected(callback: () => void): void;
	OnReady(callback: () => void): void;
	Connect(): void;
	Ready(): void;
	Shutdown(): void;
}

interface WindowProxy {
	OnWindowFocus(callback: (hasFocus: boolean) => void): void;
}

interface PointLight extends Component {
	color: Color;
	intensity: number;
	range: number;
	castShadows: boolean;
	highQualityLight: boolean;
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
	Jumping = 2,
	Sprinting = 3,
	Sliding = 4,
	Crouching = 5,
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

interface WorldSaveFile extends ScriptableObject {
	chunks: CSArray<SaveChunk>;
	worldPositions: CSArray<WorldPosition>;
	pointLights: CSArray<SavePointLight>;
	blockIdToScopeName: CSArray<BlockIdToScopedName>;
	cubeMapPath: string;
	globalSkySaturation: number;
	globalSunColor: Color;
	globalSunBrightness: number;
	globalAmbientLight: Color;
	globalAmbientBrightness: number;
	globalAmbientOcclusion: number;
	globalRadiosityScale: number;
	globalRadiosityDirectLightAmp: number;
	globalFogStart: number;
	globalFogEnd: number;
	globalFogColor: Color;

	// eslint-disable-next-line @typescript-eslint/no-misused-new
	constructor(): WorldSaveFile;

	CreateFromVoxelWorld(world: VoxelWorld): void;
	GetChunks(): CSArray<SaveChunk>;
	GetFileBlockIdFromStringId(blockTypeId: string): number;
	GetFileScopedBlockTypeId(fileBlockId: number): string;
	GetMapObjects(): CSArray<WorldPosition>;
	GetPointlights(): CSArray<SavePointLight>;
	LoadIntoVoxelWorld(world: VoxelWorld): void;
}

interface SavePointLight {
	name: string;
	color: Color;
	position: Vector3;
	rotation: Quaternion;
	intensity: number;
	range: number;
	castShadows: boolean;
	highQualityLight: boolean;
}

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

interface DynamicVariablesManager {
	GetVars(collectionId: string): DynamicVariables | undefined;
	RegisterCollection(collection: DynamicVariables): void;
}
interface DynamicVariablesManagerConstructor {
	Instance: DynamicVariablesManager;
}
declare const DynamicVariablesManager: DynamicVariablesManagerConstructor;

interface MeshProcessorConstructor {
	ProduceSingleBlock(
		blockIndex: number,
		world: VoxelWorld,
		triplanarMode: number,
		triplanarScale: number,
	): GameObject | undefined;
}
declare const MeshProcessor: MeshProcessorConstructor;

interface CharacterAnimationHelper extends Component {
	animator: Animator;
	SetForceLookForward(forceLookForward: boolean): void;
	SetFirstPerson(firstPerson: boolean): void;
	SetRootMovementLayer(itemInHand: boolean): void;
	ClearStatesOnNonRootLayers(): void;
	SetState(newState: CharacterState, force = false, noRootLayerFade = false);
	SetVelocity(vel: Vector3);
	SetGrounded(grounded: boolean);
	PlayAnimation(clip: AnimationClip, layer: CharacterAnimationLayer);
	StopAnimation(layer: CharacterAnimationLayer);
}

declare const enum CharacterAnimationLayer {
	/** Recommended layer for item idle animations  */
	OVERRIDE_1 = 1,
	/** Recommended layer for low-priority animations  */
	OVERRIDE_2 = 2,
	/** Recommended layer for medium-priority animations */
	OVERRIDE_3 = 3,
	/** Highest priority, recommended for high-priority animations */
	OVERRIDE_4 = 4,

	/** Layer with an upper body mask. */
	UPPER_BODY_1 = 5,
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

interface VoxelWorld extends MonoBehaviour {
	debugReloadOnScriptReloadMode: boolean;
	radiosityEnabled: boolean;
	globalSunBrightness: number;
	globalSkyBrightness: number;
	globalFogStart: number;
	globalFogEnd: number;
	globalFogColor: Color;
	globalSkySaturation: number;
	globalSunColor: Color;
	globalAmbientLight: Color;
	globalAmbientBrightness: number;
	globalAmbientOcclusion: number;
	globalRadiosityScale: number;
	globalRadiosityDirectLightAmp: number;
	showRadioistyProbes: boolean;
	focusPosition: Vector3;
	autoLoad: boolean;
	voxelWorldFile: WorldSaveFile;
	blockDefines: CSArray<TextAsset>;
	worldNetworker: VoxelWorldNetworker;
	chunksFolder: GameObject;
	lightsFolder: GameObject;
	finishedReplicatingChunksFromServer: boolean;
	sceneLights: CSDictionary<number, LightReference>;
	chunks: CSDictionary<unknown, Chunk>;
	worldPositionEditorIndicators: CSDictionary<string, Transform>;
	cubeMap: Cubemap;
	cubeMapPath: string;
	cubeMapSHData: CSArray<float3>;
	lodNearDistance: number;
	lodFarDistance: number;
	lodTransitionSpeed: number;
	pointLights: CSArray<GameObject>;
	voxelWorldMaterialCache: CSDictionary<Material, Material>;
	radiosityRaySamples: CSArray<CSArray<Vector3>>;
	blocks: VoxelBlocks;
	selectedBlockIndex: number;
	renderingDisabled: boolean;
	finishedLoading: boolean;
	globalSunDirection: Vector3;
	globalSunDirectionNormalized: Vector3;

	// eslint-disable-next-line @typescript-eslint/no-misused-new
	constructor(): VoxelWorld;

	AddChunk(key: unknown, chunk: Chunk): void;
	CalculateCheapSunAtPoint(point: Vector3, normal: Vector3): number;
	CalculateDirectLightingForWorldPoint(samplePoint: Vector3, sunPoint: unknown, normal: Vector3, chunk: Chunk): Color;
	CalculateLightingForWorldPoint(samplePoint: Vector3, normal: Vector3): unknown;
	CalculateLightingForWorldPoint(samplePoint: Vector3, sunPoint: unknown, normal: Vector3, chunk: Chunk): unknown;
	CalculatePlaneIntersection(origin: Vector3, dir: Vector3, planeNormal: Vector3, planePoint: Vector3): Vector3;
	CalculatePointLightColorAtPoint(samplePoint: Vector3, normal: Vector3, lightRef: LightReference): number;
	CalculatePointLightColorAtPointShadow(samplePoint: Vector3, normal: Vector3, lightRef: LightReference): Color;
	CalculatePointLightShadowAtPoint(samplePoint: Vector3, normal: Vector3, lightRef: LightReference): number;
	CalculateSunShadowAtPoint(point: Vector3, faceAxis: number, normal: Vector3): number;
	CanSeePoint(pos: Vector3, dest: Vector3, destNormal: Vector3): boolean;
	CreateSamples(): void;
	DeleteRenderedGameObjects(): void;
	DirtyMesh(voxel: unknown, priority: boolean): void;
	DirtyNeighborMeshes(voxel: unknown, priority: boolean): void;
	FullWorldUpdate(): void;
	GenerateWorld(populateTerrain: boolean): void;
	GetBlockDefinesContents(): CSArray<string>;
	GetChunkByChunkPos(pos: unknown): Chunk;
	GetCollisionType(voxelData: number): CollisionType;
	GetDirectWorldLightingFromRayImpact(pos: Vector3, direction: Vector3, maxDistance: number): Color;
	GetNumProcessingMeshChunks(): number;
	GetNumRadiosityProcessingChunks(): number;
	GetOrMakeRadiosityProbeFor(pos: unknown): RadiosityProbeSample;
	GetRadiosityProbeColorForWorldPoint(pos: Vector3, normal: Vector3): Color;
	GetRadiosityProbeColorIfVisible(key: unknown, pos: Vector3, normal: Vector3): Color;
	GetRadiosityProbeIfVisible(key: unknown, pos: Vector3, normal: Vector3): RadiosityProbeSample;
	GetVoxelAndChunkAt(pos: unknown): unknown;
	GetVoxelAt(pos: Vector3): number;
	GetWorldLightingFromRayImpact(
		pos: Vector3,
		direction: Vector3,
		maxDistance: number,
		debugSamples: CSArray<RadiosityProbeSample>,
	): unknown;
	InitializeLightingForChunk(chunk: Chunk): void;
	InvokeOnFinishedReplicatingChunksFromServer(): void;
	LoadEmptyWorld(cubeMapPath: string): void;
	LoadWorldFromSaveFile(file: WorldSaveFile): void;
	OnRenderObject(): void;
	PlaceGrassOnTopOfGrass(): void;
	RaycastIndirectLightingAtPoint(pos: Vector3, normal: Vector3): Color;
	RaycastVoxel(pos: Vector3, direction: Vector3, maxDistance: number): VoxelRaycastResult;
	RaycastVoxel_Internal(pos: Vector3, direction: Vector3, maxDistance: number, debug: boolean): unknown;
	RaycastVoxelForLighting(pos: Vector3, direction: Vector3, maxDistance: number, debug: boolean): number;
	RaycastVoxelForRadiosity(pos: Vector3, direction: Vector3, maxDistance: number, debug: boolean): unknown;
	ReadVoxelAt(pos: Vector3): number;
	RegenerateAllMeshes(): void;
	ReloadTextureAtlas(): void;
	SampleSphericalHarmonics(shMap: CSArray<float3>, unitVector: Vector3): Color;
	SaveToFile(): void;
	SpawnDebugSphere(pos: Vector3, col: Color, radius: number): GameObject;
	Update(): void;
	UpdateLights(): void;
	UpdatePropertiesForAllChunksForRendering(): void;
	UpdateSceneLights(): void;
	Vector3ToNearestIndex(normal: Vector3): number;
	WriteVoxelAt(pos: Vector3, num: number, priority: boolean): void;
	WriteVoxelGroupAt(positions: CSArray<Vector3>, nums: CSArray<number>, priority: boolean): void;
	WriteVoxelGroupAtTS(blob: unknown, priority: boolean): void;
	LoadWorld(): void;
}

interface VoxelWorldConstructor {
	runThreaded: boolean;
	doVisuals: boolean;
	maxActiveThreads: number;
	maxMainThreadMeshMillisecondsPerFrame: number;
	maxMainThreadThreadKickoffMillisecondsPerFrame: number;
	showDebugSpheres: boolean;
	showDebugBounds: boolean;
	chunkSize: number;
	radiositySize: number;
	lightingConvergedCount: number;
	numSoftShadowSamples: number;
	softShadowRadius: number;
	radiosityRunawayClamp: number;
	probeMaxRange: number;
	maxSamplesPerFrame: number;
	maxRadiositySamples: number;
	skyCountsAsLightForRadiosity: boolean;

	Abs(input: Vector3): Vector3;
	DeleteChildGameObjects(parent: GameObject): void;
	Floor(input: Vector3): Vector3;
	FloorInt(input: Vector3): unknown;
	GenerateRaySamples(normal: Vector3, sampleCount: number): CSArray<Vector3>;
	HashCoordinates(x: number, y: number, z: number): number;
	Sign(input: Vector3): Vector3;
	VoxelDataToBlockId(block: number): number;
	VoxelDataToBlockId(block: number): number;
	VoxelIsSolid(voxel: number): boolean;
}
declare const VoxelWorld: VoxelWorldConstructor;

interface SteamLuauAPIConstructor {
	SetGameRichPresence(gameName: string, status: string): boolean;
	SetRichPresence(key: string, tag: string): boolean;

	OnRichPresenceGameJoinRequest(callback: (connectStr: string, steamId: number) => void): EngineEventConnection;
	OnNewLaunchParams(callback: (gameId: string, serverId: string, customData: string) => void): EngineEventConnection;
	ProcessPendingJoinRequests(): void;
}
declare const SteamLuauAPI: SteamLuauAPIConstructor;

interface TagManager {
	AddTag(gameObject: GameObject, tag: string): void;
	RemoveTag(gameObject: GameObject, tag: string): void;
	HasTag(gameObject: GameObject, tag: string): boolean;
	GetTagged(tag: string): CSArray<GameObject>;
	GetAllTags(): CSArray<string>;
	GetAllTagsForGameObject(gameObject: GameObject): CSArray<string>;

	OnTagAdded(callback: (tag: string, gameObject: GameObject) => void): EngineEventConnection;
	OnTagRemoved(callback: (tag: string, gameObject: GameObject) => void): EngineEventConnection;
}
interface TagManagerConstructor {
	readonly Instance: TagManager;
}
declare const TagManager: TagManagerConstructor;

interface AirshipTags extends MonoBehaviour {
	AddTag(tag: string): void;
	HasTag(tag: string): boolean;
	RemoveTag(tag: string): void;
}

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
}

interface TerrainData {
	RemoveTree(treeIndex: number): void;
}

interface NetworkIdentity extends MonoBehaviour {
	readonly observers: CSDictionary<number, NetworkConnectionToClient>;
	sceneId: number;
	serverOnly: boolean;
	visibility: Visibility;
	readonly isClient: boolean;
	readonly isServer: boolean;
	readonly isLocalPlayer: boolean;
	readonly isServerOnly: boolean;
	readonly isClientOnly: boolean;
	readonly isOwned: boolean;
	readonly netId: number;
	readonly assetId: number;
	readonly connectionToServer: NetworkConnection;
	readonly connectionToClient: NetworkConnectionToClient;
	readonly NetworkBehaviours: CSArray<NetworkBehaviour>;
	readonly SpawnedFromInstantiate: boolean;

	AssignClientAuthority(conn: NetworkConnectionToClient): boolean;
	RemoveClientAuthority(): void;

	readonly onStartClient: MonoSignal<void>;
	readonly onStartAuthority: MonoSignal<void>;
	readonly onStopClient: MonoSignal<void>;
	readonly onStopAuthority: MonoSignal<void>;
	readonly onStartServer: MonoSignal<void>;
	readonly onStopServer: MonoSignal<void>;
}
