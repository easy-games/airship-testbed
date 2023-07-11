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
}

declare const Time: Time;

interface PlayerCore extends Component {
	OnPlayerAdded(callback: (clientInfo: ClientInfoDto) => void): void;
	OnPlayerRemoved(callback: (clientInfo: ClientInfoDto) => void): void;
	GetPlayers(): CSArray<ClientInfoDto>;
}

interface ClientInfoDto extends Component {
	ClientId: number;
	UserId: string;
	Username: string;
	UsernameTag: string;
	GameObject: GameObject;
}

interface EntityDriver extends Component {
	OnStateChanged(callback: (state: EntityState) => void): void;
	OnCustomDataFlushed(callback: () => void): void;
	OnDispatchCustomData(callback: (tick: number, customData: BinaryBlob) => void): void;

	SetMoveInput(direction: Vector3, jump: boolean, sprinting: boolean, crouchOrSlide: boolean): void;
	SetLookAngle(lookAngle: number): void;
	SetCustomData(customData: BinaryBlob): void;
	Teleport(position: Vector3): void;
	Impulse(impulse: Vector3): void;
	GetState(): EntityState;
	UpdateSyncTick(): void;
}

interface PhysicsConstructor {
	EasyRaycast(
		start: Vector3,
		dir: Vector3,
		distance: number,
		layerMask?: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
}

interface Screen {
	height: number;
	width: number;
}
declare const Screen: Screen;

declare const enum MobileJoystickPhase {
	Began = 0,
	Moved = 1,
	Ended = 2,
}

interface InputProxy {
	OnKeyPressEvent(callback: (key: Key, isDown: boolean) => void): void;
	OnLeftMouseButtonPressEvent(callback: (isDown: boolean) => void): void;
	OnRightMouseButtonPressEvent(callback: (isDown: boolean) => void): void;
	OnMiddleMouseButtonPressEvent(callback: (isDown: boolean) => void): void;
	OnMouseScrollEvent(callback: (scrollAmount: number) => void): void;
	OnMouseMoveEvent(callback: (location: Vector3) => void): void;
	OnMouseDeltaEvent(callback: (delta: Vector3) => void): void;
	OnTouchEvent(callback: (touchIndex: number, position: Vector3, phase: TouchPhase) => void): void;
	OnTouchTapEvent(callback: (touchIndex: number, position: Vector3, phase: InputActionPhase) => void): void;
	OnMobileJoystickEvent(callback: (position: Vector3, phase: MobileJoystickPhase) => void): void;
	OnSchemeChangedEvent(callback: (scheme: string) => void): void;

	IsMobileJoystickVisible(): boolean;
	SetMobileJoystickVisible(visible: boolean): void;
	IsKeyDown(key: Key): boolean;
	IsLeftMouseButtonDown(): boolean;
	IsRightMouseButtonDown(): boolean;
	IsMiddleMouseButtonDown(): boolean;
	GetMouseLocation(): Vector3;
	GetMouseDelta(): Vector3;
	SetMouseLocation(position: Vector3): void;
	SetMouseLocked(locked: boolean): void;
	IsMouseLocked(): boolean;
	GetScheme(): string;
	IsPointerOverUI(): boolean;
}

interface UserInputService {
	InputProxy: InputProxy;
}
declare const UserInputService: UserInputService;

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

interface PointLight extends Component {
	color: Color;
	intensity: number;
	range: number;
	castShadows: boolean;
	highQualityLight: boolean;
}

interface DestroyWatcher extends Component {
	OnDestroyedEvent(callback: () => void): void;
}

interface ProjectileNetworkBehaviour extends Component {
	OnCollide(callback: (collision: Collision) => void): void;
}

interface OcclusionCam extends Component {
	BumpForOcclusion(attachToPos: Vector3, mask: number): void;
}

interface PredictedObject extends GameObject {
	SetGraphicalObject(transform: Transform): void;
}

interface Animator extends MonoBehaviour {
	Play(stateName: string, layer?: number, normalizedTime?: number): void;
	Play(stateNameHash: number, layer?: number, normalizedTime?: number): void;
	SetBool(name: string, value: boolean): void;
	SetBool(id: number, value: boolean): void;
	SetFloat(name: string, value: number): void;
	SetFloat(name: string, value: number, dampTime: number, deltaTime: number): void;
	SetFloat(id: number, value: number): void;
	SetFloat(id: number, value: number, dampTime: number, deltaTime: number): void;
}

interface AnimatorStatic {
	StringToHash(name: string): number;
}
declare const Animator: AnimatorStatic;

declare const enum EntityState {
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
	OnPointerEvent(callback: (instanceId: number, direction: number, button: number) => void): void;
	OnHoverEvent(callback: (instanceId: number, hoverState: number) => void): void;
	OnSubmitEvent(callback: (instanceId: number) => void): void;
	OnSelectEvent(callback: (instanceId: number) => void): void;
	OnDeselectEvent(callback: (instanceId: number) => void): void;
	OnClickEvent(callback: (instanceId: number) => void): void;
	OnValueChangeEvent(callback: (instanceId: number, value: number) => void): void;
}

interface CanvasUIBridgeConstructor {
	InitializeCanvas(canvas: Canvas, pixelPerfect: boolean): void;
	HideCanvas(canvas: Canvas): void;
	CreateVector2(x: number, y: number): Vector2;
	CreateRect(x: number, y: number, w: number, h: number): Rect;
	SetSprite(go: GameObject, path: string): void;
}
declare const CanvasUIBridge: CanvasUIBridgeConstructor;

interface DebugConstructor {
	traceback(co: thread, msg?: string, level?: number): string;
	traceback(msg?: string, level?: number): string;
}
declare const debug: DebugConstructor;

interface TimeManager {
	/**
	 * Internal use only!
	 * @deprecated Use the global `OnTick` instead.
	 */
	OnOnTick(callback: () => void): void;
}

interface LayerMask {
	GetMask(layerName: string): number;
	NameToLayer(layerName: string): number;
	LayerToName(layer: number): string;
}
declare const LayerMask: LayerMask;

interface ProjectileManager {
	onProjectileCollide(callback: (projectile: EasyProjectile, collision: Collision) => void): void;
	onProjectileValidate(callback: (validateEvent: ProjectileValidateEvent) => void): void;
	onProjectileLaunched(callback: (projectile: EasyProjectile, shooter: GameObject) => void): void;
}
interface ProjectileManagerConstructor {
	Instance: ProjectileManager;
}
declare const ProjectileManager: ProjectileManagerConstructor;

interface EasyProjectile {
	onCollide(callback: (collision: Collision, velocity: Vector3) => void): void;
}

interface CoreApi {
	OnInitializedEvent(callback: () => void): void;
}

interface OnCompleteHook {
	OnCompleteEvent(callback: (operationResult: OperationResult) => void): void;
}

interface SocketIOMessageHook {
	OnEventReceived(callback: (messageName: string, message: string) => void): void;
}
