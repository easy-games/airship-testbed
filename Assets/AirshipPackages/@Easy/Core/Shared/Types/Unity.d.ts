/* eslint-disable */

/**
 * Manual typings for native Unity classes.
 *
 * Proprietary EasyEngine types belong in EasyEngine.d.ts
 */

// declare namespace task {
// 	/** Queues the calling script to be run during the parallel execution phase of the frame. */
// 	function desynchronize(): void;
// 	/** Yields the calling script and queues it for serial execution following the completion of the parallel execution phase of the frame. */
// 	function synchronize(): void;
// 	/** Defers the passed thread or function to be resumed at the end of the current resumption cycle. */
// 	function defer<T extends Array<any>>(callback: (...args: T) => void, ...args: T): thread;
// 	function defer(thread: thread, ...args: Array<unknown>): thread;
// 	/** Delays the passed thread or function until the given duration has elapsed. Resumes on engine Heartbeat. */
// 	function delay<T extends Array<any>>(duration: number, callback: (...args: T) => void, ...args: T): thread;
// 	function delay(duration: number, thread: thread, ...args: Array<unknown>): thread;
// 	/** Resumes the passed thread or function instantly using the engine's scheduler. */
// 	function spawn<T extends Array<any>>(callback: (...args: T) => void, ...args: T): thread;
// 	function spawn(thread: thread, ...args: Array<unknown>): thread;
// 	/** Delay the current thread until the given duration has elasped. Resumes on engine Heartbeat. */
// 	function wait(duration?: number): number;
// 	/** Cancels a thread, preventing it from being resumed. */
// 	function cancel(thread: thread): void;
// }

// math functions
declare namespace math {
	/** Returns a perlin noise value between -0.5 and 0.5. If you leave arguments out, they will be interpreted as zero, so math.noise(1.158) is equivalent to math.noise(1.158, 0, 0) and math.noise(1.158, 5.723) is equivalent to math.noise(1.158, 5.723, 0).
	 * The function uses a perlin noise algorithm to assign fixed values to coordinates. For example, math.noise(1.158, 5.723) will always return 0.48397532105446 and math.noise(1.158, 6) will always return 0.15315161645412.
	 * If x, y and z are all integers, the return value will be 0. For fractional values of x, y and z, the return value will gradually fluctuate between -0.5 and 0.5. For coordinates that are close to each other, the return values will also be close to each other. */
	function noise(x?: number, y?: number, z?: number): number;

	/** Returns a number between min and max, inclusive. */
	function clamp(n: number, min: number, max: number): number;
}

declare namespace utf8 {
	/** Receives zero or more codepoints as integers, converts each one to its corresponding UTF-8 byte sequence and returns a string with the concatenation of all these sequences. */
	function char(...codepoints: Array<number>): string;
	/** Returns an iterator function that will iterate over all codepoints in string str. It raises an error if it meets any invalid byte sequence. */
	function codes(str: string): IterableFunction<LuaTuple<[number, number]>>;
	/** Returns the codepoints (as integers) from all codepoints in the provided string (str) that start between byte positions i and j (both included). The default for i is 0 and for j is i. It raises an error if it meets any invalid byte sequence. Similar to `string.byte`.*/
	function codepoint(str: string, i?: number, j?: number): LuaTuple<Array<number>>;
	/** Returns the number of UTF-8 codepoints in the string str that start between positions i and j (both inclusive). The default for i is 0 and for j is -1. If it finds any invalid byte sequence, returns a false value plus the position of the first invalid byte. */
	function len(s: string, i?: number, j?: number): LuaTuple<[number, undefined] | [false, number]>;
	/** Returns the position (in bytes) where the encoding of the n-th codepoint of s (counting from byte position i) starts. A negative n gets characters before position i. The default for i is 0 when n is non-negative and #s + 1 otherwise, so that utf8.offset(s, -n) gets the offset of the n-th character from the end of the string. If the specified character is neither in the subject nor right after its end, the function returns nil. */
	function offset(s: string, n: number, i?: number): number | undefined;
	/** Returns an iterator function that will iterate the grapheme clusters of the string. */
	function graphemes(s: string, i?: number, j?: number): IterableFunction<LuaTuple<[number, number]>>;
	/** Converts the input string to Normal Form C, which tries to convert decomposed characters into composed characters. */
	function nfcnormalize(str: string): string;
	/** Converts the input string to Normal Form D, which tries to break up composed characters into decomposed characters. */
	function nfdnormalize(str: string): string;
	/** The pattern which matches exactly one UTF-8 byte sequence, assuming that the subject is a valid UTF-8 string. */
	const charpattern: "[%z\x01-\x7F\xC2-\xF4][\x80-\xBF]*";
}

/** Yields the current thread until the specified amount of seconds have elapsed.
The delay will have a minimum duration of 29 milliseconds, but this minimum may be higher depending on the target framerate and various throttling conditions. If the seconds parameter is not specified, the minimum duration will be used.
This function returns:
Actual time yielded (in seconds)
Total time since the software was initialized (in seconds) */

/**
 * Waits for a single frame.
 * @deprecated Use `task.wait()` instead.
 */
declare function wait(duration?: number): void;
/** Behaves identically to Lua’s print function, except the output is styled as a warning, with yellow text and a timestamp.
This function accepts any number of arguments, and will attempt to convert them into strings which will then be joined together with spaces between them. */
declare function warn(...params: Array<unknown>): void;

declare function tick(): number;
/** Time since the game started running. Will be 0 in Studio when not running the game. */
declare function time(): number;

// interface CSDictionary<Key, Value> {
// 	Keys: Key[];
// 	Values: Value[];
// 	Count: number;
//     [Key in Key]: Value;
// }

interface EasyFileServiceConstructor {
	GetFilesInPath(path: string, searchPattern?: string): string[];
	GetEasyAssetPath(obj: Object): string;
}
declare const EasyFileService: EasyFileServiceConstructor;

declare function require(path: string): unknown;

interface CinemachineVirtualCamera extends Component {
	Follow: Transform;
}

interface Object {
	name: string;
	hideFlags: HideFlags;

	Equals(other: unknown): boolean;
	GetHashCode(): number;
	GetInstanceID(): number;
	ToString(): string;
	IsA<T>(): this is T;
}
interface ObjectConstructor {
	Destroy(obj: Object, t: number): void;
	Destroy(obj: Object): void;
	DestroyImmediate(obj: Object, allowDestroyingAssets: boolean): void;
	DestroyImmediate(obj: Object): void;
	DestroyObject(obj: Object, t: number): void;
	DestroyObject(obj: Object): void;
	/**
	 * @deprecated Not usable.
	 * @param target
	 */
	DontDestroyOnLoad(target: Object): void;
	FindSceneObjectsOfType(type: unknown): Array<Object>;
	Instantiate<T extends Object = GameObject>(original: T, position: Vector3, rotation: Quaternion): T;
	Instantiate<T extends Object = GameObject>(
		original: T,
		position: Vector3,
		rotation: Quaternion,
		parent: Transform,
	): T;
	Instantiate<T extends Object = GameObject>(original: T): T;
	Instantiate<T extends Object = GameObject>(original: T, parent: Transform): T;
	Instantiate<T extends Object = GameObject>(original: T, parent: Transform, instantiateInWorldSpace: boolean): T;
}
declare const Object: ObjectConstructor;

interface RenderTargetSetup {}
interface RASSettings {}
interface ComputeBufferMode {}
interface ComputeBufferType {}
interface BuiltinRenderTextureType {}

// type
interface CheckablePrimitives {
	nil: undefined;
	boolean: boolean;
	string: string;
	number: number;
	table: object;
	userdata: unknown;
	function: Callback;
	thread: thread;
	vector: Vector3;
}

/**
 * Returns the type of its only argument, coded as a string.
 * Roblox datatypes will return "userdata" when passed to this function. You should use Roblox's `typeOf()` function if you want to differentiate between Roblox datatypes.
 */
declare function type(value: unknown): keyof CheckablePrimitives;

/** The strings which can be returned by typeOf and their corresponding types */
interface CheckableTypes extends CheckablePrimitives {
	Vector2: Vector2;
	Vector3: Vector3;
	Vector4: Vector4;
	UnityObject: UnityObject;
	MonoSignal: MonoSignal;
	MonoSignalConnection: MonoSignalConnection;
	Plane: Plane;
	Ray: Ray;
	Color: Color;
	Quaternion: Quaternion;
	BinaryBlob: BinaryBlob;
	Matrix4x4: Matrix4x4;
}

interface GameServerObjectMeta {}

interface ListCache<T> {
	Collection: Array<T>;
	Written: number;

	constructor(): ListCache<T>;
	constructor(capacity: number): ListCache<T>;

	AddReference(): T;
	AddValue(value: T): void;
	AddValues(values: ListCache<T>): void;
	AddValues(values: Array<T>): void;
	AddValues(values: Array<T>): void;
	AddValues(values: Array<T>): void;
	AddValues(values: Array<T>): void;
	AddValues(values: Array<T>): void;
	Reset(): void;
}

// interface InputControl<TValue> extends InputControl {
// 	valueType: unknown;
// 	valueSizeInBytes: number;

// 	CompareValue(firstStatePtr: unknown, secondStatePtr: unknown): boolean;
// 	ProcessValue(value: TValue): TValue;
// 	ReadDefaultValue(): TValue;
// 	ReadUnprocessedValue(): TValue;
// 	ReadUnprocessedValueFromState(statePtr: unknown): TValue;
// 	ReadValue(): TValue;
// 	ReadValueFromBufferAsObject(buffer: unknown, bufferSize: number): unknown;
// 	ReadValueFromPreviousFrame(): TValue;
// 	ReadValueFromState(statePtr: unknown): TValue;
// 	ReadValueFromStateAsObject(statePtr: unknown): unknown;
// 	ReadValueFromStateIntoBuffer(
// 		statePtr: unknown,
// 		bufferPtr: unknown,
// 		bufferSize: number
// 	): void;
// 	WriteValueFromBufferIntoState(
// 		bufferPtr: unknown,
// 		bufferSize: number,
// 		statePtr: unknown
// 	): void;
// 	WriteValueFromObjectIntoState(value: unknown, statePtr: unknown): void;
// 	WriteValueIntoState(value: TValue, statePtr: unknown): void;
// }

// Vector3
interface Vector3 {
	/**
	 * **DO NOT USE!**
	 *
	 * This field exists to force TypeScript to recognize this as a nominal type
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_Vector3: unique symbol;
	readonly x: number;
	readonly y: number;
	readonly z: number;

	/** Returns the magnitude of the vector. */
	readonly magnitude: number;

	/** Returns the square magnitude of the vector. This is faster to calculate than `magnitude`. */
	readonly sqrMagnitude: number;

	/** Returns a normalized copy of the vector. */
	readonly normalized: Vector3;

	/** Linear interpolation between two vectors. The `alpha` parameter is automatically clamped between `[0, 1]`. */
	Lerp(goal: Vector3, alpha: number): Vector3;

	/** Linear interpolation between two vectors. */
	LerpUnclamped(goal: Vector3, alpha: number): Vector3;

	/** Angle between two vectors. */
	Angle(to: Vector3): number;

	/** Signed angle between two vectors. */
	SignedAngle(to: Vector3, axis: Vector3 | undefined): number;

	/** Calculates the dot product between two vectors. */
	Dot(other: Vector3): number;

	/** Calculates the cross product between two vectors. */
	Cross(other: Vector3): Vector3;

	/** Calculates the distance between two vectors. */
	Distance(to: Vector3): number;

	/** Constructs a new Vector3 where the magnitude is clamped at `maxDistance`. */
	ClampMagnitude(maxDistance: number): Vector3;

	/** Constructs a new Vector3 with the minimum value picked per axis. */
	Min(other: Vector3): Vector3;

	/** Constructs a new Vector3 with the maximum value picked per axis. */
	Max(other: Vector3): Vector3;

	/** Constructs a Vector3 where the vector is moved toward `target`. */
	MoveTowards(target: Vector3, maxDistanceDelta: number): Vector3;

	/** Reflects a vector (assumed to be the normalized direction) against the `inNormal` (e.g. a surface normal). */
	Reflect(inNormal: Vector3): Vector3;

	/** Projects a vector onto another vector. */
	Project(onNormal: Vector3): Vector3;

	/** Projects a vector onto a plane defined by a normal orthogonal to the plane. */
	ProjectOnPlane(planeNormal: Vector3): Vector3;

	/** Multiplies two vectors component-wise. */
	Scale(scale: Vector3): Vector3;

	/** Spherically interpolates between two vectors. */
	Slerp(goal: Vector3, alpha: number): Vector3;

	/** Smooth damp movement of Vector3. Velocity must be managed. */
	SmoothDamp(
		target: Vector3,
		currentVelocity: Vector3,
		smoothTime: number,
		deltaTime: number,
		maxSpeed?: number,
	): LuaTuple<[newCurrent: Vector3, newVelocity: Vector3]>;

	/** Returns vector with provided x value */
	WithX(x: number): Vector3;
	/** Returns vector with provided y value */
	WithY(y: number): Vector3;
	/** Returns vector with provided z value */
	WithZ(z: number): Vector3;
}

interface Vector3Constructor {
	/** Vector3 constant `(0, 0, 0)`. */
	readonly zero: Vector3;

	/** Vector3 constant `(1, 1, 1)`. */
	readonly one: Vector3;

	/** Vector3 constant `(0, 0, -1)`. */
	readonly back: Vector3;

	/** Vector3 constant `(0, -1, 0)`. */
	readonly down: Vector3;

	/** Vector3 constant `(0, 0, 1)`. */
	readonly forward: Vector3;

	/** Vector3 constant `(-1, 0, 0)`. */
	readonly left: Vector3;

	/** Vector3 constant `(-INF, -INF, -INF)`. */
	readonly negativeInfinity: Vector3;

	/** Vector3 constant `(INF, INF, INF)`. */
	readonly positiveInfinity: Vector3;

	/** Vector3 constant `(1, 0, 0)`. */
	readonly right: Vector3;

	/** Vector3 constant `(0, 1, 0)`. */
	readonly up: Vector3;

	/** Returns this vector with a magnitude of 1. */
	Normalize: (vector: Vector3) => Vector3;

	/** Linear interpolation between two vectors. The `alpha` parameter is automatically clamped between `[0, 1]`. */
	Lerp: (start: Vector3, goal: Vector3, alpha: number) => Vector3;

	/** Linear interpolation between two vectors. */
	LerpUnclamped: (start: Vector3, goal: Vector3, alpha: number) => Vector3;

	/** Angle between two vectors. */
	Angle: (from: Vector3, to: Vector3) => number;

	/** Signed angle between two vectors. */
	SignedAngle: (from: Vector3, to: Vector3, axis: Vector3 | undefined) => number;

	/** Calculates the dot product between two vectors. */
	Dot: (a: Vector3, b: Vector3) => number;

	/** Calculates the cross product between two vectors. */
	Cross: (a: Vector3, b: Vector3) => Vector3;

	/** Calculates the distance between two vectors. */
	Distance: (from: Vector3, to: Vector3) => number;

	/** Constructs a new Vector3 where the magnitude is clamped at `maxDistance`. */
	ClampMagnitude: (vector: Vector3, maxDistance: number) => Vector3;

	/** Constructs a new Vector3 with the minimum value picked per axis. */
	Min: (a: Vector3, b: Vector3) => Vector3;

	/** Constructs a new Vector3 with the maximum value picked per axis. */
	Max: (a: Vector3, b: Vector3) => Vector3;

	/**
	 * Rotates a vector current towards target. This function is similar to MoveTowards except that
	 * the vector is treated as a direction rather than a position. The current vector will be rotated
	 * round toward the target direction by an angle of maxRadiansDelta, although it will land exactly
	 * on the target rather than overshoot. If the magnitudes of current and target are different, then
	 * the magnitude of the result will be linearly interpolated during the rotation. If a negative value
	 * is used for maxRadiansDelta, the vector will rotate away from target until it is pointing in exactly
	 * the opposite direction, then stops.
	 */
	RotateTowards: (current: Vector3, target: Vector3, maxRadiansDelta: number, maxMagnitudeDelta: number) => Vector3;

	/** Constructs a Vector3 where the vector is moved toward `target`. */
	MoveTowards: (start: Vector3, target: Vector3, maxDistanceDelta: number) => Vector3;

	/** Reflects the directional vector `inDirection` against the `inNormal` (e.g. a surface normal). */
	Reflect: (inDirection: Vector3, inNormal: Vector3) => Vector3;

	/** Projects a vector onto another vector. */
	Project: (vector: Vector3, onNormal: Vector3) => Vector3;

	/** Projects a vector onto a plane defined by a normal orthogonal to the plane. */
	ProjectOnPlane: (vector: Vector3, planeNormal: Vector3) => Vector3;

	/** Multiplies two vectors component-wise. */
	Scale: (vector: Vector3, scale: Vector3) => Vector3;

	/** Spherically interpolates between two vectors. */
	Slerp: (start: Vector3, goal: Vector3, alpha: number) => Vector3;

	/** Smooth damp movement of Vector3. Velocity must be managed. */
	SmoothDamp: (
		current: Vector3,
		target: Vector3,
		currentVelocity: Vector3,
		smoothTime: number,
		deltaTime: number,
		maxSpeed?: number,
	) => LuaTuple<[newCurrent: Vector3, newVelocity: Vector3]>;

	/** Constructs a new Vector3 using the given x, y, and z components. */
	new (x: number, y: number, z: number): Vector3;

	/** Constructs a new Vector3 equal to `(0, 0, 0)`. */
	new (): Vector3;
}

declare const Vector3: Vector3Constructor;

interface Vector4 {
	/**
	 * **DO NOT USE!**
	 *
	 * This field exists to force TypeScript to recognize this as a nominal type
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_Vector4: unique symbol;
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly w: number;

	/** Returns the magnitude of the vector. */
	readonly magnitude: number;

	/** Returns the square magnitude of the vector. */
	readonly sqrMagnitude: number;

	/** Returns a normalized copy of the vector. */
	readonly normalized: Vector4;

	/** Calculates the dot product between two vectors. */
	Dot(other: Vector4): number;

	/** Linear interpolation between two vectors. The `alpha` parameter is automatically clamped between `[0, 1]`. */
	Lerp(goal: Vector4, alpha: number): Vector4;

	/** Linear interpolation between two vectors. */
	LerpUnclamped(goal: Vector4, alpha: number): Vector4;

	/** Constructs a new Vector4 with the minimum value picked per axis. */
	Min(other: Vector4): Vector4;

	/** Constructs a new Vector4 with the maximum value picked per axis. */
	Max(other: Vector4): Vector4;

	/** Constructs a Vector4 where the vector is moved toward `target`. */
	MoveTowards(target: Vector4, maxDistanceDelta: number): Vector4;

	/** Multiplies two vectors component-wise. */
	Scale(scale: Vector4): Vector4;

	/** Calculates the distance between two vectors. */
	Distance(to: Vector4): number;
}

interface Vector4Constructor {
	/** Vector4 constant `(0, 0, 0, 0)`. */
	readonly zero: Vector4;

	/** Vector4 constant `(1, 1, 1, 1)`. */
	readonly one: Vector4;

	/** Vector4 constant `(INF, INF, INF, INF)`. */
	readonly positiveInfinity: Vector4;

	/** Vector4 constant `(-INF, -INF, -INF, -INF)`. */
	readonly negativeInfinity: Vector4;

	/** Calculates the dot product between two vectors. */
	Dot: (a: Vector4, b: Vector4) => number;

	/** Linear interpolation between two vectors. The `alpha` parameter is automatically clamped between `[0, 1]`. */
	Lerp: (start: Vector4, goal: Vector4, alpha: number) => Vector4;

	/** Linear interpolation between two vectors. */
	LerpUnclamped: (start: Vector4, goal: Vector4, alpha: number) => Vector4;

	/** Constructs a new Vector4 with the minimum value picked per axis. */
	Min: (a: Vector4, b: Vector4) => Vector4;

	/** Constructs a new Vector4 with the maximum value picked per axis. */
	Max: (a: Vector4, b: Vector4) => Vector4;

	/** Constructs a Vector4 where the vector is moved toward `target`. */
	MoveTowards: (start: Vector4, target: Vector4, maxDistanceDelta: number) => Vector4;

	/** Multiplies two vectors component-wise. */
	Scale: (vector: Vector4, scale: Vector4) => Vector4;

	/** Calculates the distance between two vectors. */
	Distance: (from: Vector4, to: Vector4) => number;

	/** Constructs a new Vector4 using the given x, y, z, and w components. */
	new (x: number, y: number, z: number, w: number): Vector4;

	/** Constructs a new Vector4 equal to `(0, 0, 0, 0)`. */
	new (): Vector4;
}

declare const Vector4: Vector4Constructor;

interface Vector2 {
	/**
	 * **DO NOT USE!**
	 *
	 * This field exists to force TypeScript to recognize this as a nominal type
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_Vector2: unique symbol;
	readonly x: number;
	readonly y: number;

	/** Returns the magnitude of the vector. */
	readonly magnitude: number;

	/** Returns the square magnitude of the vector. This is faster to calculate than `magnitude`. */
	readonly sqrMagnitude: number;

	/** Returns a normalized copy of the vector. */
	readonly normalized: Vector2;

	/** Calculates the dot product between two vectors. */
	Dot(other: Vector2): number;

	/** Calculates the distance between two vectors. */
	Distance(to: Vector2): number;

	/** Interpolates between two vectors (alpha is clamped to the range of `[0, 1]`). */
	Lerp(to: Vector2, alpha: number): Vector2;

	/** Interpolates between two vectors. */
	LerpUnclamped(to: Vector2, alpha: number): Vector2;

	/** Returns the perpendicular vector. */
	Perpendicular(): Vector2;

	/** Returns a vector with the minimum x and y value. */
	Min(other: Vector2): Vector2;

	/** Returns a vector with the maximum x and y value. */
	Max(other: Vector2): Vector2;

	/** Returns the reflected vector (assuming this is a normalized vector). */
	Reflect(direction: Vector2): Vector2;

	/** Returns a vector clamped to the given max magnitude. */
	ClampMagnitude(maxMagnitude: number): Vector2;

	/** Returns the angle between vectors. */
	Angle(to: Vector2): number;

	/** Returns the signed angle between the vectors. */
	SignedAngle(to: Vector2): number;

	/** Returns the vector moved towards `target` a maximum of `maxDistanceDelta`. */
	MoveTowards(target: Vector2, maxDistanceDelta: number): Vector2;
}

interface Vector2Constructor {
	/** Vector2 constant `(0, 0)`. */
	readonly zero: Vector2;

	/** Vector2 constant `(1, 1)`. */
	readonly one: Vector2;

	/** Vector2 constant `(0, -1)`. */
	readonly down: Vector2;

	/** Vector2 constant `(0, 1)`. */
	readonly up: Vector2;

	/** Vector2 constant `(-1, 0)`. */
	readonly left: Vector2;

	/** Vector2 constant `(1, 0)`. */
	readonly right: Vector2;

	/** Vector2 constant `(-math.huge, -math.huge)`. */
	readonly negativeInfinity: Vector2;

	/** Vector2 constant `(math.huge, math.huge)`. */
	readonly positiveInfinity: Vector2;

	/** Calculates the dot product between two vectors. */
	Dot: (a: Vector2, b: Vector2) => number;

	/** Calculates the distance between two vectors. */
	Distance: (a: Vector2, b: Vector2) => number;

	/** Interpolates between two vectors (alpha is clamped to the range of `[0, 1]`). */
	Lerp: (from: Vector2, to: Vector2, alpha: number) => Vector2;

	/** Interpolates between two vectors. */
	LerpUnclamped: (from: Vector2, to: Vector2, alpha: number) => Vector2;

	/** Returns the perpendicular vector. */
	Perpendicular: (vec: Vector2) => Vector2;

	/** Returns a vector with the minimum x and y value. */
	Min: (a: Vector2, b: Vector2) => Vector2;

	/** Returns a vector with the maximum x and y value. */
	Max: (a: Vector2, b: Vector2) => Vector2;

	/** Returns the reflected vector. */
	Reflect: (normal: Vector2, direction: Vector2) => Vector2;

	/** Returns a vector clamped to the given max magnitude. */
	ClampMagnitude: (vec: Vector2, maxMagnitude: number) => Vector2;

	/** Returns the angle between two vectors. */
	Angle: (from: Vector2, to: Vector2) => number;

	/** Returns the signed angle between two vectors. */
	SignedAngle: (from: Vector2, to: Vector2) => number;

	/** Returns a vector moved from `current` towards `target` a maximum of `maxDistanceDelta`. */
	MoveTowards: (current: Vector2, target: Vector2, maxDistanceDelta: number) => Vector2;

	new (x: number, y: number): Vector2;
	new (): Vector2;
}

declare const Vector2: Vector2Constructor;

interface Quaternion {
	/** Returns the euler angle representation of the rotation. */
	readonly eulerAngles: Vector3;

	/** Returns this quaternion with a magnitude of 1. */
	readonly normalized: Quaternion;

	/** W component of the quaternion. */
	w: number;

	/** X component of the quaternion. */
	x: number;

	/** Y component of the quaternion. */
	y: number;

	/** Z component of the quaternion. */
	z: number;
}

interface QuaternionConstructor {
	/** The identity rotation. */
	readonly identity: Quaternion;

	/** Returns the angle in degrees between two rotations. */
	Angle: (from: Quaternion, to: Quaternion) => number;

	/** Creates a rotation which rotates `angle` degrees around `axis`. */
	AngleAxis: (angle: number, axis: Vector3) => Quaternion;

	/** The dot product between two rotations. */
	Dot: (a: Quaternion, b: Quaternion) => number;

	/**
	 * Constructs a quaternion that rotates `z` degrees around the Z axis, `x` degrees around
	 * the X axis, and `y` degrees around the Y axis; applied in that order.
	 */
	Euler: (x: number, y: number, z: number) => Quaternion;

	/** Creates a rotation which rotates from `fromDirection` to `toDirection`. */
	FromToRotation: (fromDirection: Vector3, toDirection: Vector3) => Quaternion;

	/** Returns the conjugate of the rotation. */
	Conjugate: (rotation: Quaternion) => Quaternion;

	/** Returns the inverse of the rotation. */
	Inverse: (rotation: Quaternion) => Quaternion;

	/**
	 * Creates a rotation with the specified forward and upwards direction. If the `upwards`
	 * parameter is not present, it defaults to `Vector3.up`.
	 */
	LookRotation: (forward: Vector3, upwards?: Vector3) => Quaternion;

	/** Normalizes the rotation in-place. */
	Normalize: (rotation: Quaternion) => void;

	/** Rotates the rotation `from` towards `to`. */
	RotateTowards: (from: Quaternion, to: Quaternion, maxDegreesDelta: number) => Quaternion;

	/** Spherically interpolates between the two quaternions. The `alpha` parameter is clamped between `[0, 1]`. */
	Slerp: (from: Quaternion, to: Quaternion, alpha: number) => Quaternion;

	/** Spherically interpolates between the two quaternions. */
	SlerpUnclamped: (from: Quaternion, to: Quaternion, alpha: number) => Quaternion;

	/** Constructs a new Quaternion. */
	new (x: number, y: number, z: number, w: number): Quaternion;
}

declare const Quaternion: QuaternionConstructor;

interface Vector2Control extends InputControl<Vector2> {
	x: AxisControl;
	y: AxisControl;

	constructor(): Vector2Control;

	ReadUnprocessedValueFromState(statePtr: unknown): Vector2;
	WriteValueIntoState(value: Vector2, statePtr: unknown): void;
}

interface AxisControl extends InputControl<number> {
	clamp: Clamp;
	clampMin: number;
	clampMax: number;
	clampConstant: number;
	invert: boolean;
	normalize: boolean;
	normalizeMin: number;
	normalizeMax: number;
	normalizeZero: number;
	scale: boolean;
	scaleFactor: number;

	constructor(): AxisControl;

	CompareValue(firstStatePtr: unknown, secondStatePtr: unknown): boolean;
	ReadUnprocessedValueFromState(statePtr: unknown): number;
	WriteValueIntoState(value: number, statePtr: unknown): void;
}

declare const enum TouchPhase {
	None = 0,
	Began = 1,
	Moved = 2,
	Ended = 3,
	Canceled = 4,
	Stationary = 5,
}

declare const enum Clamp {
	None = 0,
	BeforeNormalize = 1,
	AfterNormalize = 2,
	ToConstantBeforeNormalize = 3,
}

interface InputControl<TValue = unknown> {
	name: string;
	displayName: string;
	shortDisplayName: string;
	path: string;
	layout: string;
	variants: string;
	device: InputDevice;
	parent: InputControl;
	children: Array<InputControl>;
	usages: Array<InternedString>;
	aliases: Array<InternedString>;
	stateBlock: InputStateBlock;
	noisy: boolean;
	synthetic: boolean;
	Item: InputControl;
	valueType: TValue;
	valueSizeInBytes: number;

	EvaluateMagnitude(): number;
	EvaluateMagnitude(statePtr: unknown): number;

	CompareValue(firstStatePtr: unknown, secondStatePtr: unknown): boolean;
	ProcessValue(value: TValue): TValue;
	ReadDefaultValue(): TValue;
	ReadUnprocessedValue(): TValue;
	ReadUnprocessedValueFromState(statePtr: unknown): TValue;
	ReadValue(): TValue;
	ReadValueFromBufferAsObject(buffer: unknown, bufferSize: number): unknown;
	ReadValueFromPreviousFrame(): TValue;
	ReadValueFromState(statePtr: unknown): TValue;
	ReadValueFromStateAsObject(statePtr: unknown): unknown;
	ReadValueFromStateIntoBuffer(statePtr: unknown, bufferPtr: unknown, bufferSize: number): void;
	WriteValueFromBufferIntoState(bufferPtr: unknown, bufferSize: number, statePtr: unknown): void;
	WriteValueFromObjectIntoState(value: unknown, statePtr: unknown): void;
	WriteValueIntoState(value: TValue, statePtr: unknown): void;
}

interface EventCallback<TEventType, TCallbackArgs = unknown> {
	constructor(object: unknown, method: unknown): EventCallback<TEventType, TCallbackArgs>;

	BeginInvoke(evt: TEventType, userArgs: TCallbackArgs, callback: unknown, object: unknown): unknown;
	EndInvoke(result: unknown): void;
	Invoke(evt: TEventType, userArgs: TCallbackArgs): void;
}

declare class StyleLength implements IStyleValue<Length> {
	value: Length;
	keyword: StyleKeyword;

	constructor(v: Length);

	Equals(other: StyleLength): boolean;
	Equals(obj: unknown): boolean;
	GetHashCode(): number;
	ToString(): string;
}

interface Clickable extends PointerManipulator {
	lastMousePosition: Vector2;

	constructor(handler: unknown, delay: number, interval: number): Clickable;
	constructor(handler: unknown): Clickable;
	constructor(handler: unknown): Clickable;

	OnClicked(callback: () => void): void;
}

interface ServerManager extends MonoBehaviour {
	Clients: CSDictionary<number, NetworkConnection>;
	Started: boolean;
	Objects: ServerObjects;
	NetworkManager: NetworkManager;
	Authenticator: Authenticator;

	constructor(): ServerManager;

	Broadcast<T>(connection: NetworkConnection, message: T, requireAuthenticated: boolean, channel: Channel): void;
	Broadcast<T>(
		connections: Array<NetworkConnection>,
		message: T,
		requireAuthenticated: boolean,
		channel: Channel,
	): void;
	Broadcast<T>(networkObject: NetworkObject, message: T, requireAuthenticated: boolean, channel: Channel): void;
	Broadcast<T>(message: T, requireAuthenticated: boolean, channel: Channel): void;
	BroadcastExcept<T>(
		connections: Array<NetworkConnection>,
		excludedConnection: NetworkConnection,
		message: T,
		requireAuthenticated: boolean,
		channel: Channel,
	): void;
	BroadcastExcept<T>(
		connections: Array<NetworkConnection>,
		excludedConnections: Array<NetworkConnection>,
		message: T,
		requireAuthenticated: boolean,
		channel: Channel,
	): void;
	BroadcastExcept<T>(
		excludedConnection: NetworkConnection,
		message: T,
		requireAuthenticated: boolean,
		channel: Channel,
	): void;
	BroadcastExcept<T>(
		excludedConnections: Array<NetworkConnection>,
		message: T,
		requireAuthenticated: boolean,
		channel: Channel,
	): void;
	Despawn(go: GameObject, despawnType: unknown): void;
	Despawn(networkObject: NetworkObject, despawnType: unknown): void;
	GetAuthenticator(): Authenticator;
	RegisterBroadcast<T>(handler: unknown, requireAuthentication: boolean): void;
	SetAuthenticator(value: Authenticator): void;
	Spawn(go: GameObject, ownerConnection: NetworkConnection | undefined): void;
	Spawn(nob: NetworkObject, ownerConnection: NetworkConnection | undefined): void;
	Spawn(nob: NetworkObject, ownerConnection: NetworkConnection | undefined, synchronizeParent: boolean): void;
	StartConnection(): boolean;
	StartConnection(port: number): boolean;
	StopConnection(sendDisconnectMessage: boolean): boolean;
	UnregisterBroadcast<T>(handler: unknown): void;
}

interface Renderer {
	SetMaterial(index: number, material: Material): void;
	SetSharedMaterial(index: number, material: Material): void;
}

interface PhysicsScene {
	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		hitInfo: unknown,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	BoxCast(center: Vector3, halfExtents: Vector3, direction: Vector3, hitInfo: unknown): boolean;
	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		results: Array<RaycastHit>,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	BoxCast(center: Vector3, halfExtents: Vector3, direction: Vector3, results: Array<RaycastHit>): number;
	CapsuleCast(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		hitInfo: unknown,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	CapsuleCast(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		results: Array<RaycastHit>,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	Equals(other: unknown): boolean;
	Equals(other: PhysicsScene): boolean;
	GetHashCode(): number;
	IsEmpty(): boolean;
	IsValid(): boolean;
	OverlapBox(
		center: Vector3,
		halfExtents: Vector3,
		results: Array<Collider>,
		orientation: Quaternion,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	OverlapBox(center: Vector3, halfExtents: Vector3, results: Array<Collider>): number;
	OverlapCapsule(
		point0: Vector3,
		point1: Vector3,
		radius: number,
		results: Array<Collider>,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	OverlapSphere(
		position: Vector3,
		radius: number,
		results: Array<Collider>,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		hitInfo: unknown,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		raycastHits: Array<RaycastHit>,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	Simulate(step: number): void;
	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		hitInfo: unknown,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		results: Array<RaycastHit>,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): number;
	ToString(): string;
}

interface PhysicsConstructor {
	kIgnoreRaycastLayer: number;
	kDefaultRaycastLayers: number;
	kAllLayers: number;
	IgnoreRaycastLayer: number;
	DefaultRaycastLayers: number;
	AllLayers: number;
	minPenetrationForPenalty: number;
	bounceTreshold: number;
	sleepVelocity: number;
	sleepAngularVelocity: number;
	maxAngularVelocity: number;
	solverIterationCount: number;
	solverVelocityIterationCount: number;
	penetrationPenaltyForce: number;
	gravity: Vector3;
	defaultContactOffset: number;
	sleepThreshold: number;
	queriesHitTriggers: boolean;
	queriesHitBackfaces: boolean;
	bounceThreshold: number;
	defaultMaxDepenetrationVelocity: number;
	defaultSolverIterations: number;
	defaultSolverVelocityIterations: number;
	defaultMaxAngularSpeed: number;
	improvedPatchFriction: boolean;
	defaultPhysicsScene: PhysicsScene;
	autoSimulation: boolean;
	autoSyncTransforms: boolean;
	reuseCollisionCallbacks: boolean;
	interCollisionDistance: number;
	interCollisionStiffness: number;
	interCollisionSettingsToggle: boolean;
	clothGravity: Vector3;

	BakeMesh(meshID: number, convex: boolean): void;
	BoxCastAll(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	BoxCastAll(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
	): RaycastHit[];
	BoxCastAll(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
	): RaycastHit[];
	BoxCastAll(center: Vector3, halfExtents: Vector3, direction: Vector3, orientation: Quaternion): RaycastHit[];
	BoxCastAll(center: Vector3, halfExtents: Vector3, direction: Vector3): RaycastHit[];
	// BoxCastNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	orientation: Quaternion,
	// 	maxDistance: number,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// BoxCastNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	orientation: Quaternion,
	// ): number;
	// BoxCastNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	orientation: Quaternion,
	// 	maxDistance: number,
	// ): number;
	// BoxCastNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	orientation: Quaternion,
	// 	maxDistance: number,
	// 	layerMask: number,
	// ): number;
	// BoxCastNonAlloc(center: Vector3, halfExtents: Vector3, direction: Vector3, results: Array<RaycastHit>): number;
	CapsuleCast(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	CapsuleCast(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
	): boolean;
	CapsuleCast(point1: Vector3, point2: Vector3, radius: number, direction: Vector3, maxDistance: number): boolean;
	CapsuleCast(point1: Vector3, point2: Vector3, radius: number, direction: Vector3): boolean;
	// CapsuleCast(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	hitInfo: unknown,
	// 	maxDistance: number,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): boolean;
	// CapsuleCast(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	hitInfo: unknown,
	// 	maxDistance: number,
	// 	layerMask: number,
	// ): boolean;
	// CapsuleCast(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	hitInfo: unknown,
	// 	maxDistance: number,
	// ): boolean;
	// CapsuleCast(point1: Vector3, point2: Vector3, radius: number, direction: Vector3, hitInfo: unknown): boolean;
	CapsuleCastAll(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	CapsuleCastAll(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
	): RaycastHit[];
	CapsuleCastAll(
		point1: Vector3,
		point2: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
	): RaycastHit[];
	CapsuleCastAll(point1: Vector3, point2: Vector3, radius: number, direction: Vector3): RaycastHit[];
	// CapsuleCastNonAlloc(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// CapsuleCastNonAlloc(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// ): number;
	// CapsuleCastNonAlloc(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// ): number;
	// CapsuleCastNonAlloc(
	// 	point1: Vector3,
	// 	point2: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// ): number;
	CheckBox(
		center: Vector3,
		halfExtents: Vector3,
		orientation: Quaternion,
		layermask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	CheckBox(center: Vector3, halfExtents: Vector3, orientation: Quaternion, layerMask: number): boolean;
	CheckBox(center: Vector3, halfExtents: Vector3, orientation: Quaternion): boolean;
	CheckBox(center: Vector3, halfExtents: Vector3): boolean;
	CheckCapsule(
		start: Vector3,
		end: Vector3,
		radius: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	CheckCapsule(start: Vector3, end: Vector3, radius: number, layerMask: number): boolean;
	CheckCapsule(start: Vector3, end: Vector3, radius: number): boolean;
	CheckSphere(
		position: Vector3,
		radius: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	CheckSphere(position: Vector3, radius: number, layerMask: number): boolean;
	CheckSphere(position: Vector3, radius: number): boolean;
	ClosestPoint(point: Vector3, collider: Collider, position: Vector3, rotation: Quaternion): Vector3;
	GetIgnoreCollision(collider1: Collider, collider2: Collider): boolean;
	GetIgnoreLayerCollision(layer1: number, layer2: number): boolean;
	IgnoreCollision(collider1: Collider, collider2: Collider, ignore: boolean): void;
	IgnoreCollision(collider1: Collider, collider2: Collider): void;
	IgnoreLayerCollision(layer1: number, layer2: number, ignore: boolean): void;
	IgnoreLayerCollision(layer1: number, layer2: number): void;
	Linecast(
		start: Vector3,
		end: Vector3,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): boolean;
	Linecast(start: Vector3, end: Vector3, layerMask: number): boolean;
	Linecast(start: Vector3, end: Vector3): boolean;
	OverlapBox(
		center: Vector3,
		halfExtents: Vector3,
		orientation: Quaternion,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): Collider[];
	OverlapBox(center: Vector3, halfExtents: Vector3, orientation: Quaternion, layerMask: number): Collider[];
	OverlapBox(center: Vector3, halfExtents: Vector3, orientation: Quaternion): Collider[];
	OverlapBox(center: Vector3, halfExtents: Vector3): Collider[];
	// OverlapBoxNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	results: Array<Collider>,
	// 	orientation: Quaternion,
	// 	mask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// OverlapBoxNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	results: Array<Collider>,
	// 	orientation: Quaternion,
	// 	mask: number,
	// ): number;
	// OverlapBoxNonAlloc(
	// 	center: Vector3,
	// 	halfExtents: Vector3,
	// 	results: Array<Collider>,
	// 	orientation: Quaternion,
	// ): number;
	// OverlapBoxNonAlloc(center: Vector3, halfExtents: Vector3, results: Array<Collider>): number;
	OverlapCapsule(
		point0: Vector3,
		point1: Vector3,
		radius: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): Array<Collider>;
	OverlapCapsule(point0: Vector3, point1: Vector3, radius: number, layerMask: number): Collider[];
	OverlapCapsule(point0: Vector3, point1: Vector3, radius: number): Collider[];
	// OverlapCapsuleNonAlloc(
	// 	point0: Vector3,
	// 	point1: Vector3,
	// 	radius: number,
	// 	results: Array<Collider>,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// OverlapCapsuleNonAlloc(
	// 	point0: Vector3,
	// 	point1: Vector3,
	// 	radius: number,
	// 	results: Array<Collider>,
	// 	layerMask: number,
	// ): number;
	// OverlapCapsuleNonAlloc(point0: Vector3, point1: Vector3, radius: number, results: Array<Collider>): number;
	OverlapSphere(
		position: Vector3,
		radius: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): Collider[];
	OverlapSphere(position: Vector3, radius: number, layerMask: number): Collider[];
	OverlapSphere(position: Vector3, radius: number): Collider[];
	// OverlapSphereNonAlloc(
	// 	position: Vector3,
	// 	radius: number,
	// 	results: Array<Collider>,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// OverlapSphereNonAlloc(position: Vector3, radius: number, results: Array<Collider>, layerMask: number): number;
	// OverlapSphereNonAlloc(position: Vector3, radius: number, results: Array<Collider>): number;

	/**
	 * @deprecated Use {@link Physics.Raycast} instead
	 * @param start
	 * @param dir
	 * @param distance
	 * @param layerMask
	 */
	EasyRaycast(
		start: Vector3,
		dir: Vector3,
		distance: number,
		layerMask?: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	Raycast(
		origin: Vector3,
		direction: Vector3,
		maxDistance: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	BoxCast(
		center: Vector3,
		halfExtents: Vector3,
		direction: Vector3,
		orientation: Quaternion,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	RaycastLegacy(origin: Vector3, direction: Vector3, maxDistance: number, layerMask: number): RaycastHit | undefined;
	RaycastLegacy(origin: Vector3, direction: Vector3, maxDistance: number): RaycastHit | undefined;

	RaycastAll(
		origin: Vector3,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	RaycastAll(origin: Vector3, direction: Vector3, maxDistance: number, layerMask: number): RaycastHit[];
	RaycastAll(origin: Vector3, direction: Vector3, maxDistance: number): RaycastHit[];
	RaycastAll(origin: Vector3, direction: Vector3): RaycastHit[];
	RaycastAll(
		ray: Ray,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	RaycastAll(ray: Ray, maxDistance: number, layerMask: number): RaycastHit[];
	RaycastAll(ray: Ray, maxDistance: number): RaycastHit[];
	RaycastAll(ray: Ray): RaycastHit[];

	Simulate(step: number): void;

	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;
	SphereCast(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): LuaTuple<
		| [hit: true, point: Vector3, normal: Vector3, collider: Collider]
		| [hit: false, point: undefined, normal: undefined, collider: undefined]
	>;

	SphereCastAll(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	SphereCastAll(
		origin: Vector3,
		radius: number,
		direction: Vector3,
		maxDistance: number,
		layerMask: number,
	): RaycastHit[];
	SphereCastAll(origin: Vector3, radius: number, direction: Vector3, maxDistance: number): RaycastHit[];
	SphereCastAll(origin: Vector3, radius: number, direction: Vector3): RaycastHit[];
	SphereCastAll(
		ray: Ray,
		radius: number,
		maxDistance: number,
		layerMask: number,
		queryTriggerInteraction: QueryTriggerInteraction,
	): RaycastHit[];
	SphereCastAll(ray: Ray, radius: number, maxDistance: number, layerMask: number): RaycastHit[];
	SphereCastAll(ray: Ray, radius: number, maxDistance: number): RaycastHit[];
	SphereCastAll(ray: Ray, radius: number): RaycastHit[];
	// SphereCastNonAlloc(
	// 	origin: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// SphereCastNonAlloc(
	// 	origin: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// ): number;
	// SphereCastNonAlloc(
	// 	origin: Vector3,
	// 	radius: number,
	// 	direction: Vector3,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// ): number;
	// SphereCastNonAlloc(origin: Vector3, radius: number, direction: Vector3, results: RaycastHit[]): number;
	// SphereCastNonAlloc(
	// 	ray: Ray,
	// 	radius: number,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// 	queryTriggerInteraction: QueryTriggerInteraction,
	// ): number;
	// SphereCastNonAlloc(
	// 	ray: Ray,
	// 	radius: number,
	// 	results: Array<RaycastHit>,
	// 	maxDistance: number,
	// 	layerMask: number,
	// ): number;
	// SphereCastNonAlloc(ray: Ray, radius: number, results: Array<RaycastHit>, maxDistance: number): number;
	// SphereCastNonAlloc(ray: Ray, radius: number, results: Array<RaycastHit>): number;
	SyncTransforms(): void;
}
declare const Physics: PhysicsConstructor;

interface IStyle {
	alignContent: StyleEnum<Align>;
	alignItems: StyleEnum<Align>;
	alignSelf: StyleEnum<Align>;
	backgroundColor: StyleColor;
	backgroundImage: StyleBackground;
	borderBottomColor: StyleColor;
	borderBottomLeftRadius: StyleLength;
	borderBottomRightRadius: StyleLength;
	borderBottomWidth: StyleFloat;
	borderLeftColor: StyleColor;
	borderLeftWidth: StyleFloat;
	borderRightColor: StyleColor;
	borderRightWidth: StyleFloat;
	borderTopColor: StyleColor;
	borderTopLeftRadius: StyleLength;
	borderTopRightRadius: StyleLength;
	borderTopWidth: StyleFloat;
	bottom: StyleLength;
	color: StyleColor;
	cursor: StyleCursor;
	display: DisplayStyle;
	flexBasis: StyleLength;
	flexDirection: StyleEnum<FlexDirection>;
	flexGrow: StyleFloat;
	flexShrink: StyleFloat;
	flexWrap: StyleEnum<Wrap>;
	fontSize: StyleLength;
	height: StyleLength;
	justifyContent: StyleEnum<Justify>;
	left: StyleLength;
	letterSpacing: StyleLength;
	marginBottom: StyleLength;
	marginLeft: StyleLength;
	marginRight: StyleLength;
	marginTop: StyleLength;
	maxHeight: StyleLength;
	maxWidth: StyleLength;
	minHeight: StyleLength;
	minWidth: StyleLength;
	opacity: StyleFloat;
	overflow: StyleEnum<Overflow>;
	paddingBottom: StyleLength;
	paddingLeft: StyleLength;
	paddingRight: StyleLength;
	paddingTop: StyleLength;
	position: StyleEnum<Position>;
	right: StyleLength;
	rotate: StyleRotate;
	scale: StyleScale;
	textOverflow: StyleEnum<TextOverflow>;
	textShadow: StyleTextShadow;
	top: StyleLength;
	transformOrigin: StyleTransformOrigin;
	transitionDelay: StyleList<TimeValue>;
	transitionDuration: StyleList<TimeValue>;
	transitionProperty: StyleList<StylePropertyName>;
	transitionTimingFunction: StyleList<EasingFunction>;
	translate: StyleTranslate;
	unityBackgroundImageTintColor: StyleColor;
	unityBackgroundScaleMode: StyleEnum<ScaleMode>;
	unityFont: StyleFont;
	unityFontDefinition: StyleFontDefinition;
	unityFontStyleAndWeight: StyleEnum<FontStyle>;
	unityOverflowClipBox: StyleEnum<OverflowClipBox>;
	unityParagraphSpacing: StyleLength;
	unitySliceBottom: StyleInt;
	unitySliceLeft: StyleInt;
	unitySliceRight: StyleInt;
	unitySliceTop: StyleInt;
	unityTextAlign: StyleEnum<TextAnchor>;
	unityTextOutlineColor: StyleColor;
	unityTextOutlineWidth: StyleFloat;
	unityTextOverflowPosition: StyleEnum<TextOverflowPosition>;
	visibility: StyleEnum<Visibility>;
	whiteSpace: StyleEnum<WhiteSpace>;
	width: StyleLength;
	wordSpacing: StyleLength;
}

interface EasyAttributes extends NetworkObject {
	SetAttribute(key: string, value: unknown): void;
	GetNumber(key: string): number | undefined;
	GetString(key: string): string | undefined;
	GetBoolean(key: string): boolean | undefined;
	GetObject<T = unknown>(key: string): T | undefined;
}

interface SceneAPIConstructor {
	OnSceneLoadedEvent: (callback: (sceneName: string) => void) => void;
}

interface ClientSceneListener {
	OnSceneLoadedEvent(callback: (sceneName: string) => void): void;
}

interface ManagedObjects {
	OnAddedToSpawnedEvent(callback: (nob: NetworkObject) => void): void;
}

interface MouseDownEvent {
	button: number;
	actionKey: boolean;
	altKey: boolean;
	commandKey: boolean;
	localMousePosition: Vector2;
	shiftKey: boolean;
}

interface ChangeEvent<T> {
	previousValue: T;
	newValue: T;
}

interface MouseEnterEvent {}

interface MouseLeaveEvent {}

interface KeyDownEvent {
	keyCode: KeyCode;
	commandKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
	actionKey: boolean;
	shiftKey: boolean;
	bubbles: boolean;
}

interface AssetBridge {
	GetAllAssets(): string[];
	// GetAssetBundle(name: string): AssetBundle;
	IsLoaded(): boolean;
	LoadAsset<T = GameObject>(path: string): T;
	LoadAssetIfExists<T = GameObject>(path: string): T | undefined;
}
interface AssetBridgeConstructor {
	Instance: AssetBridge;
}
/**
 * @internal
 * @deprecated Use `Asset` instead.
 */
declare const AssetBridge: AssetBridgeConstructor;

interface Ray {
	origin: Vector3;
	direction: Vector3;
}
interface RayConstructor {
	new (origin: Vector3, direction: Vector3): Ray;
}
declare const Ray: RayConstructor;

interface Rigidbody {
	AddForce_ForceMode(force: Vector3, forceMode: ForceMode): void;
	/**
	 * @deprecated Use `linearVelocity` instead.
	 */
	velocity: Vector3;
}

interface Component extends Object {
	/**
	 * The Transform attached to this GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component-transform.html | Component.transform}
	 */
	readonly transform: Transform;
	/**
	 * The game object this component is attached to. A component is always attached to a game object.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component-gameObject.html | Component.gameObject}
	 */
	readonly gameObject: GameObject;
	/**
	 * The tag of this game object.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component-tag.html | Component.tag}
	 */
	tag: string;

	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object or any of its children.
	//  * @param methodName Name of the method to call.
	//  * @param parameter Optional parameter to pass to the method (can be any value).
	//  * @param options Should an error be raised if the method does not exist for a given target object?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.BroadcastMessage.html | Component.BroadcastMessage}
	//  */
	// BroadcastMessage(methodName: string, parameter: unknown, options: SendMessageOptions): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object or any of its children.
	//  * @param methodName Name of the method to call.
	//  * @param parameter Optional parameter to pass to the method (can be any value).
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.BroadcastMessage.html | Component.BroadcastMessage}
	//  */
	// BroadcastMessage(methodName: string, parameter: unknown): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object or any of its children.
	//  * @param methodName Name of the method to call.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.BroadcastMessage.html | Component.BroadcastMessage}
	//  */
	// BroadcastMessage(methodName: string): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object or any of its children.
	//  * @param methodName Name of the method to call.
	//  * @param options Should an error be raised if the method does not exist for a given target object?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.BroadcastMessage.html | Component.BroadcastMessage}
	//  */
	// BroadcastMessage(methodName: string, options: SendMessageOptions): void;
	/**
	 * Checks the GameObject's tag against the defined tag.
	 * @param tag The tag to compare.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.CompareTag.html | Component.CompareTag}
	 */
	CompareTag(tag: string): boolean;
	/**
	 * Checks the GameObject's tag against the defined tag.
	 * @param tag A TagHandle representing the tag to compare.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.CompareTag.html | Component.CompareTag}
	 */
	CompareTag(tag: TagHandle): boolean;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object.
	//  * @param methodName Name of the method to call.
	//  * @param value Optional parameter for the method.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessage.html | Component.SendMessage}
	//  */
	// SendMessage(methodName: string, value: unknown): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object.
	//  * @param methodName Name of the method to call.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessage.html | Component.SendMessage}
	//  */
	// SendMessage(methodName: string): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object.
	//  * @param methodName Name of the method to call.
	//  * @param value Optional parameter for the method.
	//  * @param options Should an error be raised if the target object doesn't implement the method for the message?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessage.html | Component.SendMessage}
	//  */
	// SendMessage(methodName: string, value: unknown, options: SendMessageOptions): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object.
	//  * @param methodName Name of the method to call.
	//  * @param options Should an error be raised if the target object doesn't implement the method for the message?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessage.html | Component.SendMessage}
	//  */
	// SendMessage(methodName: string, options: SendMessageOptions): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object and on every ancestor of the behaviour.
	//  * @param methodName Name of method to call.
	//  * @param value Optional parameter value for the method.
	//  * @param options Should an error be raised if the method does not exist on the target object?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessageUpwards.html | Component.SendMessageUpwards}
	//  */
	// SendMessageUpwards(methodName: string, value: unknown, options: SendMessageOptions): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object and on every ancestor of the behaviour.
	//  * @param methodName Name of method to call.
	//  * @param value Optional parameter value for the method.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessageUpwards.html | Component.SendMessageUpwards}
	//  */
	// SendMessageUpwards(methodName: string, value: unknown): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object and on every ancestor of the behaviour.
	//  * @param methodName Name of method to call.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessageUpwards.html | Component.SendMessageUpwards}
	//  */
	// SendMessageUpwards(methodName: string): void;
	// /**
	//  * Calls the method named methodName on every MonoBehaviour in this game object and on every ancestor of the behaviour.
	//  * @param methodName Name of method to call.
	//  * @param options Should an error be raised if the method does not exist on the target object?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/Component.SendMessageUpwards.html | Component.SendMessageUpwards}
	//  */
	// SendMessageUpwards(methodName: string, options: SendMessageOptions): void;

	/**
	 * Gets a reference to a component of type T on the same GameObject as the component specified.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.GetComponent.html | Component.GetComponent}
	 */
	GetComponent<T extends Component>(): T;
	/**
	 * The string-based version of this method.
	 * @param type The name of the type of Component to get.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.GetComponent.html | Component.GetComponent}
	 */
	GetComponent<T extends Component>(name: string): T;

	/**
	 * Gets references to all components of type T on the same GameObject as the component specified.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.GetComponents.html | Component.GetComponents}
	 */
	GetComponents<T extends Component>(): T[];
	/**
	 * Gets references to all components of type T on the same GameObject as the component specified.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Component.GetComponents.html | Component.GetComponents}
	 */
	GetComponents<T extends Component>(name: string): T[];

	IsDestroyed(): boolean;
}

interface GameObject extends Object {
	/**
	 * The Transform attached to this GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-transform.html | GameObject.transform}
	 */
	readonly transform: Transform;
	/**
	 * The layer the GameObject is in.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-layer.html | GameObject.layer}
	 */
	layer: number;
	/**
	 * The local active state of this GameObject. (Read Only)
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-activeSelf.html | GameObject.activeSelf}
	 */
	readonly activeSelf: boolean;
	/**
	 * Defines whether the GameObject is active in the Scene.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-activeInHierarchy.html | GameObject.activeInHierarchy}
	 */
	readonly activeInHierarchy: boolean;
	/**
	 * Gets and sets the GameObject's StaticEditorFlags.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-isStatic.html | GameObject.isStatic}
	 */
	isStatic: boolean;
	/**
	 * The tag of this GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-tag.html | GameObject.tag}
	 */
	tag: string;
	/**
	 * Scene that the GameObject is part of.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-scene.html | GameObject.scene}
	 */
	readonly scene: Scene;
	/**
	 * Scene culling mask Unity uses to determine which scene to render the GameObject in.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject-sceneCullingMask.html | GameObject.sceneCullingMask}
	 */
	readonly sceneCullingMask: number;
	readonly gameObject: GameObject;

	/**
	 * Adds a component class of type componentType to the GameObject. C# Users can use a generic version.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.AddComponent.html | GameObject.AddComponent}
	 */
	AddComponent(componentType: unknown): Component;
	/**
	 * Generic version of this method.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.AddComponent.html | GameObject.AddComponent}
	 */
	AddComponent<T>(): T;
	BroadcastMessage(methodName: string, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject or any of its children.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.BroadcastMessage.html | GameObject.BroadcastMessage}
	 */
	BroadcastMessage(methodName: string, parameter: unknown, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject or any of its children.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.BroadcastMessage.html | GameObject.BroadcastMessage}
	 */
	BroadcastMessage(methodName: string, parameter: unknown): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject or any of its children.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.BroadcastMessage.html | GameObject.BroadcastMessage}
	 */
	BroadcastMessage(methodName: string): void;
	/**
	 * Is this GameObject tagged with tag ?
	 * @param tag The tag to compare.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.CompareTag.html | GameObject.CompareTag}
	 */
	CompareTag(tag: string): boolean;
	/**
	 * Is this GameObject tagged with tag?
	 * @param tag A TagHandle representing the tag to compare.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.CompareTag.html | GameObject.CompareTag}
	 */
	CompareTag(tag: TagHandle): boolean;
	SendMessage(methodName: string, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject.
	 * @param methodName The name of the method to call.
	 * @param value An optional parameter value to pass to the called method.
	 * @param options Should an error be raised if the method doesn't exist on the target object?
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessage.html | GameObject.SendMessage}
	 */
	SendMessage(methodName: string, value: unknown, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject.
	 * @param methodName The name of the method to call.
	 * @param value An optional parameter value to pass to the called method.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessage.html | GameObject.SendMessage}
	 */
	SendMessage(methodName: string, value: unknown): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject.
	 * @param methodName The name of the method to call.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessage.html | GameObject.SendMessage}
	 */
	SendMessage(methodName: string): void;
	SendMessageUpwards(methodName: string, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject and on every ancestor of the behaviour.
	 * @param methodName The name of the method to call.
	 * @param value An optional parameter value to pass to the called method.
	 * @param options Should an error be raised if the method doesn't exist on the target object?
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessageUpwards.html | GameObject.SendMessageUpwards}
	 */
	SendMessageUpwards(methodName: string, value: unknown, options: SendMessageOptions): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject and on every ancestor of the behaviour.
	 * @param methodName The name of the method to call.
	 * @param value An optional parameter value to pass to the called method.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessageUpwards.html | GameObject.SendMessageUpwards}
	 */
	SendMessageUpwards(methodName: string, value: unknown): void;
	/**
	 * Calls the method named methodName on every MonoBehaviour in this GameObject and on every ancestor of the behaviour.
	 * @param methodName The name of the method to call.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SendMessageUpwards.html | GameObject.SendMessageUpwards}
	 */
	SendMessageUpwards(methodName: string): void;
	/**
	 * ActivatesDeactivates the GameObject, depending on the given true or false/ value.
	 * @param value Activate or deactivate the object, where true activates the GameObject and false deactivates the GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.SetActive.html | GameObject.SetActive}
	 */
	SetActive(value: boolean): void;

	/**
	 * Gets a reference to a component of type T on the specified GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponent.html | GameObject.GetComponent}
	 */
	GetComponent<T extends Component>(): T | undefined;
	/**
	 * Gets a reference to a component of type T on the specified GameObject, or any child of the GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentInChildren.html | GameObject.GetComponentInChildren}
	 */
	GetComponentInChildren<T extends Component>(): T | undefined;
	/**
	 * Gets a reference to a component of type T on the specified GameObject, or any child of the GameObject.
	 * @param includeInactive Whether to include inactive child GameObjects in the search.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentInChildren.html | GameObject.GetComponentInChildren}
	 */
	GetComponentInChildren<T extends Component>(includeInactive: boolean): T | undefined;
	/**
	 * Gets a reference to a component of type T on the specified GameObject, or any parent of the GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentInParent.html | GameObject.GetComponentInParent}
	 */
	GetComponentInParent<T extends Component>(): T | undefined;
	/**
	 * Gets a reference to a component of type T on the specified GameObject, or any parent of the GameObject.
	 * @param includeInactive Whether to include inactive parent GameObjects in the search.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentInParent.html | GameObject.GetComponentInParent}
	 */
	GetComponentInParent<T extends Component>(includeInactive: boolean): T | undefined;
	/**
	 * Gets references to all components of type T on the specified GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponents.html | GameObject.GetComponents}
	 */
	GetComponents<T>(): T[];
	/**
	 * Gets references to all components of type T on the specified GameObject, and any child of the GameObject.
	 * @param includeInactive Whether to include inactive child GameObjects in the search.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentsInChildren.html | GameObject.GetComponentsInChildren}
	 */
	GetComponentsInChildren<T extends Component>(includeInactive: boolean): T[];
	/**
	 * Gets references to all components of type T on the specified GameObject, and any child of the GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentsInChildren.html | GameObject.GetComponentsInChildren}
	 */
	GetComponentsInChildren<T extends Component>(): T[];
	/**
	 * Gets references to all components of type T on the specified GameObject, and any parent of the GameObject.
	 * @param includeInactive Whether to include inactive parent GameObjects in the search.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentsInParent.html | GameObject.GetComponentsInParent}
	 */
	GetComponentsInParent<T extends Component>(includeInactive: boolean): T[];
	/**
	 * Gets references to all components of type T on the specified GameObject, and any parent of the GameObject.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/GameObject.GetComponentsInParent.html | GameObject.GetComponentsInParent}
	 */
	GetComponentsInParent<T>(): T[];

	GetAirshipComponentInChildren<T extends AirshipBehaviour>(includeInactive?: boolean): T | undefined;
	GetAirshipComponentsInChildren<T extends AirshipBehaviour>(includeInactive?: boolean): T[];
	GetAirshipComponents<T extends AirshipBehaviour>(includeInactive?: boolean): T[];

	GetAirshipComponentInParent<T extends AirshipBehaviour>(includeInactive?: boolean): T | undefined;
	GetAirshipComponentsInParent<T extends AirshipBehaviour>(includeInactive?: boolean): T[];

	GetAirshipComponent<T extends AirshipBehaviour>(includeInactive?: boolean): T | undefined;
	AddAirshipComponent<T extends AirshipBehaviour>(): T;

	IsDestroyed(): boolean;

	/** Destroys all child gameobjects. */
	ClearChildren(): void;

	/**Sets the layer on this game object and all descendants */
	SetLayerRecursive(layer: number): void;
	/**
	 * Replaces any layer that matches the replaceMask with layer.
	 * Applies to this GameObject and any descendants.
	 *
	 * @param layer Layer id
	 * @param replaceMask Layer bitmask
	 */
	ReplaceLayerRecursive(layer: number, replaceMask: number);
}
declare const gameObject: GameObject;

interface GameObjectConstructor {
	CreatePrimitive(type: PrimitiveType): GameObject;
	Find(name: string): GameObject;
	FindObjectOfType<T extends Component>(): T;
	FindObjectsByType<T extends Component>(
		findObjectsInactive: FindObjectsInactive,
		sortMode: FindObjectsSortMode,
	): T[];
	FindObjectsByType<T extends Component>(sortMode: FindObjectsSortMode): T[];
	FindAnyObjectByType<T extends Component>(): T;
	FindGameObjectsWithTag(tag: string): GameObject[];
	FindGameObjectWithTag(tag: string): GameObject;
	FindWithTag(tag: string): GameObject;
	Create(name?: string): GameObject;
	CreateAtPos(pos: Vector3, name?: string): GameObject;

	/** @deprecated Use `GameObject.Create()` instead */
	new (): GameObject;
	/** @deprecated Use `GameObject.Create()` instead */
	new (name: string): GameObject;

	Instantiate<T extends Object = GameObject>(original: T, position: Vector3, rotation: Quaternion): T;
	Instantiate<T extends Object = GameObject>(
		original: T,
		position: Vector3,
		rotation: Quaternion,
		parent: Transform,
	): T;
	Instantiate<T extends Object = GameObject>(original: T): T;
	Instantiate<T extends Object = GameObject>(original: T, parent: Transform): T;
	Instantiate<T extends Object = GameObject>(original: T, parent: Transform, instantiateInWorldSpace: boolean): T;
}
declare const GameObject: GameObjectConstructor;

interface VoxelRaycastResult {
	Hit: boolean;
	Distance: number;
	HitPosition: Vector3;
	HitNormal: Vector3;
}

interface Color {
	r: number;
	g: number;
	b: number;
	a: number;
	readonly grayscale: number;
	readonly maxColorComponent: number;
	// readonly linear: Color;
	// readonly gamma: Color;
	// Item: number;

	// constructor(r: number, g: number, b: number, a: number): Color;
	// constructor(r: number, g: number, b: number): Color;

	// Equals(other: unknown): boolean;
	// Equals(other: Color): boolean;
	// GetHashCode(): number;
	// ToString(): string;
	// ToString(format: string): string;
	// ToString(format: string, formatProvider: unknown): string;
}

interface ColorConstructor {
	red: Color;
	green: Color;
	blue: Color;
	white: Color;
	black: Color;
	yellow: Color;
	cyan: Color;
	magenta: Color;
	gray: Color;
	grey: Color;
	clear: Color;

	HSVToRGB: (h: number, s: number, v: number) => Color;
	HSVToRGB: (h: number, s: number, v: number, hdr: boolean) => Color;
	RGBToHSV: (color: Color) => LuaTuple<[H: number, S: number, V: number]>;
	Lerp: (a: Color, b: Color, t: number) => Color;
	LerpUnclamped: (a: Color, b: Color, t: number) => Color;

	new (r: number, g: number, b: number, a: number): Color;
	new (r: number, g: number, b: number): Color;
}
declare const Color: ColorConstructor;

interface GameObjectReferences extends MonoBehaviour {
	constructor(): GameObjectReferences;

	GetAllValues<T = GameObject>(bundleKey: string): T[];
	GetValue<T = GameObject>(bundleKey: string, itemKey: string): T;
}

interface GameObjectReferencesConstructor {
	GetReferences(bundleKey: string): GameObjectReferences;
	GetValue<T = GameObject>(staticKey: string, bundleKey: string, itemKey: string): T;
}
declare const GameObjectReferences: GameObjectReferencesConstructor;

interface UGUIImage extends Component {
	color: Color;
	enabled: boolean;
}

interface ParticleSystemConstructor {
	MakeEmitParams(): EmitParams;
}

interface ParticleSystem {
	EmitAtPosition(count: number, pos: Vector3): void;
}

interface AkSoundEngineConstructor {
	AK_SIMD_ALIGNMENT: number;
	AK_BUFFER_ALIGNMENT: number;
	AK_MAX_PATH: number;
	AK_BANK_PLATFORM_DATA_ALIGNMENT: number;
	AK_OSCHAR_FMT: string;
	AK_INVALID_PLUGINID: number;
	AK_INVALID_GAME_OBJECT: number;
	AK_INVALID_UNIQUE_ID: number;
	AK_INVALID_RTPC_ID: number;
	AK_INVALID_LISTENER_INDEX: number;
	AK_INVALID_PLAYING_ID: number;
	AK_DEFAULT_SWITCH_STATE: number;
	AK_INVALID_POOL_ID: number;
	AK_DEFAULT_POOL_ID: number;
	AK_INVALID_AUX_ID: number;
	AK_INVALID_FILE_ID: number;
	AK_INVALID_DEVICE_ID: number;
	AK_INVALID_BANK_ID: number;
	AK_FALLBACK_ARGUMENTVALUE_ID: number;
	AK_INVALID_CHANNELMASK: number;
	AK_INVALID_OUTPUT_DEVICE_ID: number;
	AK_MIXER_FX_SLOT: number;
	AK_DEFAULT_LISTENER_OBJ: number;
	AK_DEFAULT_PRIORITY: number;
	AK_MIN_PRIORITY: number;
	AK_MAX_PRIORITY: number;
	AK_DEFAULT_BANK_IO_PRIORITY: number;
	AK_DEFAULT_BANK_THROUGHPUT: number;
	AKCOMPANYID_AUDIOKINETIC: number;
	AK_LISTENERS_MASK_ALL: number;
	NULL: number;
	AKCURVEINTERPOLATION_NUM_STORAGE_BIT: number;
	AK_MAX_LANGUAGE_NAME_SIZE: number;
	AKCOMPANYID_PLUGINDEV_MIN: number;
	AKCOMPANYID_PLUGINDEV_MAX: number;
	AKCOMPANYID_AUDIOKINETIC_EXTERNAL: number;
	AKCOMPANYID_MCDSP: number;
	AKCOMPANYID_WAVEARTS: number;
	AKCOMPANYID_PHONETICARTS: number;
	AKCOMPANYID_IZOTOPE: number;
	AKCOMPANYID_CRANKCASEAUDIO: number;
	AKCOMPANYID_IOSONO: number;
	AKCOMPANYID_AUROTECHNOLOGIES: number;
	AKCOMPANYID_DOLBY: number;
	AKCOMPANYID_TWOBIGEARS: number;
	AKCOMPANYID_OCULUS: number;
	AKCOMPANYID_BLUERIPPLESOUND: number;
	AKCOMPANYID_ENZIEN: number;
	AKCOMPANYID_KROTOS: number;
	AKCOMPANYID_NURULIZE: number;
	AKCOMPANYID_SUPERPOWERED: number;
	AKCOMPANYID_GOOGLE: number;
	AKCOMPANYID_VISISONICS: number;
	AKCODECID_BANK: number;
	AKCODECID_PCM: number;
	AKCODECID_ADPCM: number;
	AKCODECID_XMA: number;
	AKCODECID_VORBIS: number;
	AKCODECID_WIIADPCM: number;
	AKCODECID_PCMEX: number;
	AKCODECID_EXTERNAL_SOURCE: number;
	AKCODECID_XWMA: number;
	AKCODECID_FILE_PACKAGE: number;
	AKCODECID_ATRAC9: number;
	AKCODECID_VAG: number;
	AKCODECID_PROFILERCAPTURE: number;
	AKCODECID_ANALYSISFILE: number;
	AKCODECID_MIDI: number;
	AKCODECID_OPUSNX: number;
	AKCODECID_CAF: number;
	AKCODECID_AKOPUS: number;
	AKCODECID_AKOPUS_WEM: number;
	AKCODECID_MEMORYMGR_DUMP: number;
	AKCODECID_SONY360: number;
	AKCODECID_BANK_EVENT: number;
	AKCODECID_BANK_BUS: number;
	AKPLUGINID_METER: number;
	AKPLUGINID_RECORDER: number;
	AKPLUGINID_IMPACTER: number;
	AKPLUGINID_SYSTEM_OUTPUT_META: number;
	AKPLUGINID_AUDIO_OBJECT_ATTENUATION_META: number;
	AKPLUGINID_AUDIO_OBJECT_PRIORITY_META: number;
	AKEXTENSIONID_SPATIALAUDIO: number;
	AKEXTENSIONID_INTERACTIVEMUSIC: number;
	AKEXTENSIONID_MIDIDEVICEMGR: number;
	AK_WAVE_FORMAT_VAG: number;
	AK_WAVE_FORMAT_AT9: number;
	AK_WAVE_FORMAT_VORBIS: number;
	AK_WAVE_FORMAT_OPUSNX: number;
	AK_WAVE_FORMAT_OPUS: number;
	AK_WAVE_FORMAT_OPUS_WEM: number;
	WAVE_FORMAT_XMA2: number;
	AK_PANNER_NUM_STORAGE_BITS: number;
	AK_POSSOURCE_NUM_STORAGE_BITS: number;
	AK_SPAT_NUM_STORAGE_BITS: number;
	AK_MAX_BITS_METERING_FLAGS: number;
	AK_ASYNC_OPEN_DEFAULT: boolean;
	AK_COMM_DEFAULT_DISCOVERY_PORT: number;
	AK_DEFAULT_LISTENER_POSITION_X: number;
	AK_DEFAULT_LISTENER_POSITION_Y: number;
	AK_DEFAULT_LISTENER_POSITION_Z: number;
	AK_DEFAULT_LISTENER_FRONT_X: number;
	AK_DEFAULT_LISTENER_FRONT_Y: number;
	AK_DEFAULT_LISTENER_FRONT_Z: number;
	AK_DEFAULT_TOP_X: number;
	AK_DEFAULT_TOP_Y: number;
	AK_DEFAULT_TOP_Z: number;
	AK_MIDI_EVENT_TYPE_INVALID: number;
	AK_MIDI_EVENT_TYPE_NOTE_OFF: number;
	AK_MIDI_EVENT_TYPE_NOTE_ON: number;
	AK_MIDI_EVENT_TYPE_NOTE_AFTERTOUCH: number;
	AK_MIDI_EVENT_TYPE_CONTROLLER: number;
	AK_MIDI_EVENT_TYPE_PROGRAM_CHANGE: number;
	AK_MIDI_EVENT_TYPE_CHANNEL_AFTERTOUCH: number;
	AK_MIDI_EVENT_TYPE_PITCH_BEND: number;
	AK_MIDI_EVENT_TYPE_SYSEX: number;
	AK_MIDI_EVENT_TYPE_ESCAPE: number;
	AK_MIDI_EVENT_TYPE_WWISE_CMD: number;
	AK_MIDI_EVENT_TYPE_META: number;
	AK_MIDI_CC_BANK_SELECT_COARSE: number;
	AK_MIDI_CC_MOD_WHEEL_COARSE: number;
	AK_MIDI_CC_BREATH_CTRL_COARSE: number;
	AK_MIDI_CC_CTRL_3_COARSE: number;
	AK_MIDI_CC_FOOT_PEDAL_COARSE: number;
	AK_MIDI_CC_PORTAMENTO_COARSE: number;
	AK_MIDI_CC_DATA_ENTRY_COARSE: number;
	AK_MIDI_CC_VOLUME_COARSE: number;
	AK_MIDI_CC_BALANCE_COARSE: number;
	AK_MIDI_CC_CTRL_9_COARSE: number;
	AK_MIDI_CC_PAN_POSITION_COARSE: number;
	AK_MIDI_CC_EXPRESSION_COARSE: number;
	AK_MIDI_CC_EFFECT_CTRL_1_COARSE: number;
	AK_MIDI_CC_EFFECT_CTRL_2_COARSE: number;
	AK_MIDI_CC_CTRL_14_COARSE: number;
	AK_MIDI_CC_CTRL_15_COARSE: number;
	AK_MIDI_CC_GEN_SLIDER_1: number;
	AK_MIDI_CC_GEN_SLIDER_2: number;
	AK_MIDI_CC_GEN_SLIDER_3: number;
	AK_MIDI_CC_GEN_SLIDER_4: number;
	AK_MIDI_CC_CTRL_20_COARSE: number;
	AK_MIDI_CC_CTRL_21_COARSE: number;
	AK_MIDI_CC_CTRL_22_COARSE: number;
	AK_MIDI_CC_CTRL_23_COARSE: number;
	AK_MIDI_CC_CTRL_24_COARSE: number;
	AK_MIDI_CC_CTRL_25_COARSE: number;
	AK_MIDI_CC_CTRL_26_COARSE: number;
	AK_MIDI_CC_CTRL_27_COARSE: number;
	AK_MIDI_CC_CTRL_28_COARSE: number;
	AK_MIDI_CC_CTRL_29_COARSE: number;
	AK_MIDI_CC_CTRL_30_COARSE: number;
	AK_MIDI_CC_CTRL_31_COARSE: number;
	AK_MIDI_CC_BANK_SELECT_FINE: number;
	AK_MIDI_CC_MOD_WHEEL_FINE: number;
	AK_MIDI_CC_BREATH_CTRL_FINE: number;
	AK_MIDI_CC_CTRL_3_FINE: number;
	AK_MIDI_CC_FOOT_PEDAL_FINE: number;
	AK_MIDI_CC_PORTAMENTO_FINE: number;
	AK_MIDI_CC_DATA_ENTRY_FINE: number;
	AK_MIDI_CC_VOLUME_FINE: number;
	AK_MIDI_CC_BALANCE_FINE: number;
	AK_MIDI_CC_CTRL_9_FINE: number;
	AK_MIDI_CC_PAN_POSITION_FINE: number;
	AK_MIDI_CC_EXPRESSION_FINE: number;
	AK_MIDI_CC_EFFECT_CTRL_1_FINE: number;
	AK_MIDI_CC_EFFECT_CTRL_2_FINE: number;
	AK_MIDI_CC_CTRL_14_FINE: number;
	AK_MIDI_CC_CTRL_15_FINE: number;
	AK_MIDI_CC_CTRL_20_FINE: number;
	AK_MIDI_CC_CTRL_21_FINE: number;
	AK_MIDI_CC_CTRL_22_FINE: number;
	AK_MIDI_CC_CTRL_23_FINE: number;
	AK_MIDI_CC_CTRL_24_FINE: number;
	AK_MIDI_CC_CTRL_25_FINE: number;
	AK_MIDI_CC_CTRL_26_FINE: number;
	AK_MIDI_CC_CTRL_27_FINE: number;
	AK_MIDI_CC_CTRL_28_FINE: number;
	AK_MIDI_CC_CTRL_29_FINE: number;
	AK_MIDI_CC_CTRL_30_FINE: number;
	AK_MIDI_CC_CTRL_31_FINE: number;
	AK_MIDI_CC_HOLD_PEDAL: number;
	AK_MIDI_CC_PORTAMENTO_ON_OFF: number;
	AK_MIDI_CC_SUSTENUTO_PEDAL: number;
	AK_MIDI_CC_SOFT_PEDAL: number;
	AK_MIDI_CC_LEGATO_PEDAL: number;
	AK_MIDI_CC_HOLD_PEDAL_2: number;
	AK_MIDI_CC_SOUND_VARIATION: number;
	AK_MIDI_CC_SOUND_TIMBRE: number;
	AK_MIDI_CC_SOUND_RELEASE_TIME: number;
	AK_MIDI_CC_SOUND_ATTACK_TIME: number;
	AK_MIDI_CC_SOUND_BRIGHTNESS: number;
	AK_MIDI_CC_SOUND_CTRL_6: number;
	AK_MIDI_CC_SOUND_CTRL_7: number;
	AK_MIDI_CC_SOUND_CTRL_8: number;
	AK_MIDI_CC_SOUND_CTRL_9: number;
	AK_MIDI_CC_SOUND_CTRL_10: number;
	AK_MIDI_CC_GENERAL_BUTTON_1: number;
	AK_MIDI_CC_GENERAL_BUTTON_2: number;
	AK_MIDI_CC_GENERAL_BUTTON_3: number;
	AK_MIDI_CC_GENERAL_BUTTON_4: number;
	AK_MIDI_CC_REVERB_LEVEL: number;
	AK_MIDI_CC_TREMOLO_LEVEL: number;
	AK_MIDI_CC_CHORUS_LEVEL: number;
	AK_MIDI_CC_CELESTE_LEVEL: number;
	AK_MIDI_CC_PHASER_LEVEL: number;
	AK_MIDI_CC_DATA_BUTTON_P1: number;
	AK_MIDI_CC_DATA_BUTTON_M1: number;
	AK_MIDI_CC_NON_REGISTER_COARSE: number;
	AK_MIDI_CC_NON_REGISTER_FINE: number;
	AK_MIDI_CC_ALL_SOUND_OFF: number;
	AK_MIDI_CC_ALL_CONTROLLERS_OFF: number;
	AK_MIDI_CC_LOCAL_KEYBOARD: number;
	AK_MIDI_CC_ALL_NOTES_OFF: number;
	AK_MIDI_CC_OMNI_MODE_OFF: number;
	AK_MIDI_CC_OMNI_MODE_ON: number;
	AK_MIDI_CC_OMNI_MONOPHONIC_ON: number;
	AK_MIDI_CC_OMNI_POLYPHONIC_ON: number;
	AK_MIDI_WWISE_CMD_PLAY: number;
	AK_MIDI_WWISE_CMD_STOP: number;
	AK_MIDI_WWISE_CMD_PAUSE: number;
	AK_MIDI_WWISE_CMD_RESUME: number;
	AK_MIDI_WWISE_CMD_SEEK_MS: number;
	AK_MIDI_WWISE_CMD_SEEK_SAMPLES: number;
	AK_SPEAKER_FRONT_LEFT: number;
	AK_SPEAKER_FRONT_RIGHT: number;
	AK_SPEAKER_FRONT_CENTER: number;
	AK_SPEAKER_LOW_FREQUENCY: number;
	AK_SPEAKER_BACK_LEFT: number;
	AK_SPEAKER_BACK_RIGHT: number;
	AK_SPEAKER_BACK_CENTER: number;
	AK_SPEAKER_SIDE_LEFT: number;
	AK_SPEAKER_SIDE_RIGHT: number;
	AK_SPEAKER_TOP: number;
	AK_SPEAKER_HEIGHT_FRONT_LEFT: number;
	AK_SPEAKER_HEIGHT_FRONT_CENTER: number;
	AK_SPEAKER_HEIGHT_FRONT_RIGHT: number;
	AK_SPEAKER_HEIGHT_BACK_LEFT: number;
	AK_SPEAKER_HEIGHT_BACK_CENTER: number;
	AK_SPEAKER_HEIGHT_BACK_RIGHT: number;
	AK_SPEAKER_SETUP_MONO: number;
	AK_SPEAKER_SETUP_0POINT1: number;
	AK_SPEAKER_SETUP_1POINT1: number;
	AK_SPEAKER_SETUP_STEREO: number;
	AK_SPEAKER_SETUP_2POINT1: number;
	AK_SPEAKER_SETUP_3STEREO: number;
	AK_SPEAKER_SETUP_3POINT1: number;
	AK_SPEAKER_SETUP_4: number;
	AK_SPEAKER_SETUP_4POINT1: number;
	AK_SPEAKER_SETUP_5: number;
	AK_SPEAKER_SETUP_5POINT1: number;
	AK_SPEAKER_SETUP_6: number;
	AK_SPEAKER_SETUP_6POINT1: number;
	AK_SPEAKER_SETUP_7: number;
	AK_SPEAKER_SETUP_7POINT1: number;
	AK_SPEAKER_SETUP_SURROUND: number;
	AK_SPEAKER_SETUP_DPL2: number;
	AK_SPEAKER_SETUP_HEIGHT_2: number;
	AK_SPEAKER_SETUP_HEIGHT_4: number;
	AK_SPEAKER_SETUP_HEIGHT_5: number;
	AK_SPEAKER_SETUP_HEIGHT_ALL: number;
	AK_SPEAKER_SETUP_HEIGHT_4_TOP: number;
	AK_SPEAKER_SETUP_HEIGHT_5_TOP: number;
	AK_SPEAKER_SETUP_AURO_222: number;
	AK_SPEAKER_SETUP_AURO_8: number;
	AK_SPEAKER_SETUP_AURO_9: number;
	AK_SPEAKER_SETUP_AURO_9POINT1: number;
	AK_SPEAKER_SETUP_AURO_10: number;
	AK_SPEAKER_SETUP_AURO_10POINT1: number;
	AK_SPEAKER_SETUP_AURO_11: number;
	AK_SPEAKER_SETUP_AURO_11POINT1: number;
	AK_SPEAKER_SETUP_AURO_11_740: number;
	AK_SPEAKER_SETUP_AURO_11POINT1_740: number;
	AK_SPEAKER_SETUP_AURO_13_751: number;
	AK_SPEAKER_SETUP_AURO_13POINT1_751: number;
	AK_SPEAKER_SETUP_DOLBY_5_0_2: number;
	AK_SPEAKER_SETUP_DOLBY_5_1_2: number;
	AK_SPEAKER_SETUP_DOLBY_6_0_2: number;
	AK_SPEAKER_SETUP_DOLBY_6_1_2: number;
	AK_SPEAKER_SETUP_DOLBY_6_0_4: number;
	AK_SPEAKER_SETUP_DOLBY_6_1_4: number;
	AK_SPEAKER_SETUP_DOLBY_7_0_2: number;
	AK_SPEAKER_SETUP_DOLBY_7_1_2: number;
	AK_SPEAKER_SETUP_DOLBY_7_0_4: number;
	AK_SPEAKER_SETUP_DOLBY_7_1_4: number;
	AK_SPEAKER_SETUP_ALL_SPEAKERS: number;
	AK_IDX_SETUP_FRONT_LEFT: number;
	AK_IDX_SETUP_FRONT_RIGHT: number;
	AK_IDX_SETUP_CENTER: number;
	AK_IDX_SETUP_NOCENTER_BACK_LEFT: number;
	AK_IDX_SETUP_NOCENTER_BACK_RIGHT: number;
	AK_IDX_SETUP_NOCENTER_SIDE_LEFT: number;
	AK_IDX_SETUP_NOCENTER_SIDE_RIGHT: number;
	AK_IDX_SETUP_WITHCENTER_BACK_LEFT: number;
	AK_IDX_SETUP_WITHCENTER_BACK_RIGHT: number;
	AK_IDX_SETUP_WITHCENTER_SIDE_LEFT: number;
	AK_IDX_SETUP_WITHCENTER_SIDE_RIGHT: number;
	AK_IDX_SETUP_0_LFE: number;
	AK_IDX_SETUP_1_CENTER: number;
	AK_IDX_SETUP_1_LFE: number;
	AK_IDX_SETUP_2_LEFT: number;
	AK_IDX_SETUP_2_RIGHT: number;
	AK_IDX_SETUP_2_LFE: number;
	AK_IDX_SETUP_3_LEFT: number;
	AK_IDX_SETUP_3_RIGHT: number;
	AK_IDX_SETUP_3_CENTER: number;
	AK_IDX_SETUP_3_LFE: number;
	AK_IDX_SETUP_4_FRONTLEFT: number;
	AK_IDX_SETUP_4_FRONTRIGHT: number;
	AK_IDX_SETUP_4_REARLEFT: number;
	AK_IDX_SETUP_4_REARRIGHT: number;
	AK_IDX_SETUP_4_LFE: number;
	AK_IDX_SETUP_5_FRONTLEFT: number;
	AK_IDX_SETUP_5_FRONTRIGHT: number;
	AK_IDX_SETUP_5_CENTER: number;
	AK_IDX_SETUP_5_REARLEFT: number;
	AK_IDX_SETUP_5_REARRIGHT: number;
	AK_IDX_SETUP_5_LFE: number;
	AK_IDX_SETUP_6_FRONTLEFT: number;
	AK_IDX_SETUP_6_FRONTRIGHT: number;
	AK_IDX_SETUP_6_REARLEFT: number;
	AK_IDX_SETUP_6_REARRIGHT: number;
	AK_IDX_SETUP_6_SIDELEFT: number;
	AK_IDX_SETUP_6_SIDERIGHT: number;
	AK_IDX_SETUP_6_LFE: number;
	AK_IDX_SETUP_7_FRONTLEFT: number;
	AK_IDX_SETUP_7_FRONTRIGHT: number;
	AK_IDX_SETUP_7_CENTER: number;
	AK_IDX_SETUP_7_REARLEFT: number;
	AK_IDX_SETUP_7_REARRIGHT: number;
	AK_IDX_SETUP_7_SIDELEFT: number;
	AK_IDX_SETUP_7_SIDERIGHT: number;
	AK_IDX_SETUP_7_LFE: number;
	AK_SPEAKER_SETUP_0_1: number;
	AK_SPEAKER_SETUP_1_0_CENTER: number;
	AK_SPEAKER_SETUP_1_1_CENTER: number;
	AK_SPEAKER_SETUP_2_0: number;
	AK_SPEAKER_SETUP_2_1: number;
	AK_SPEAKER_SETUP_3_0: number;
	AK_SPEAKER_SETUP_3_1: number;
	AK_SPEAKER_SETUP_FRONT: number;
	AK_SPEAKER_SETUP_4_0: number;
	AK_SPEAKER_SETUP_4_1: number;
	AK_SPEAKER_SETUP_5_0: number;
	AK_SPEAKER_SETUP_5_1: number;
	AK_SPEAKER_SETUP_6_0: number;
	AK_SPEAKER_SETUP_6_1: number;
	AK_SPEAKER_SETUP_7_0: number;
	AK_SPEAKER_SETUP_7_1: number;
	AK_SPEAKER_SETUP_DEFAULT_PLANE: number;
	AK_SUPPORTED_STANDARD_CHANNEL_MASK: number;
	AK_STANDARD_MAX_NUM_CHANNELS: number;
	AK_MAX_AMBISONICS_ORDER: number;
	AK_MAX_NUM_TEXTURE: number;
	AK_MAX_REFLECT_ORDER: number;
	AK_MAX_REFLECTION_PATH_LENGTH: number;
	AK_MAX_SOUND_PROPAGATION_DEPTH: number;
	AK_MAX_SOUND_PROPAGATION_WIDTH: number;
	AK_DEFAULT_MOVEMENT_THRESHOLD: number;
	AK_SA_EPSILON: number;
	AK_SA_DIFFRACTION_EPSILON: number;
	AK_SA_DIFFRACTION_DOT_EPSILON: number;
	AK_SA_PLANE_THICKNESS_RATIO: number;
	AK_SA_MIN_ENVIRONMENT_ABSORPTION: number;
	AK_SA_MIN_ENVIRONMENT_SURFACE_AREA: number;
	AK_DEFAULT_GEOMETRY_POSITION_X: number;
	AK_DEFAULT_GEOMETRY_POSITION_Y: number;
	AK_DEFAULT_GEOMETRY_POSITION_Z: number;
	AK_DEFAULT_GEOMETRY_FRONT_X: number;
	AK_DEFAULT_GEOMETRY_FRONT_Y: number;
	AK_DEFAULT_GEOMETRY_FRONT_Z: number;
	AK_DEFAULT_GEOMETRY_TOP_X: number;
	AK_DEFAULT_GEOMETRY_TOP_Y: number;
	AK_DEFAULT_GEOMETRY_TOP_Z: number;
	Deprecation_2018_1_2: string;
	Deprecation_2018_1_6: string;
	Deprecation_2019_2_0: string;
	Deprecation_2019_2_2: string;
	Deprecation_2021_1_0: string;
	Deprecation_2022_1_0: string;
	AK_PENDING_EVENT_LOAD_ID: number;
	AK_INVALID_SHARE_SET_ID: number;
	AK_INVALID_PIPELINE_ID: number;
	AK_INVALID_AUDIO_OBJECT_ID: number;
	AK_SOUNDBANK_VERSION: number;
	AkJobType_Generic: number;
	AkJobType_AudioProcessing: number;
	AkJobType_SpatialAudio: number;
	AK_NUM_JOB_TYPES: number;
	AK_INT: number;
	AK_FLOAT: number;
	AK_INTERLEAVED: number;
	AK_NONINTERLEAVED: number;
	AK_LE_NATIVE_BITSPERSAMPLE: number;
	AK_LE_NATIVE_SAMPLETYPE: number;
	AK_LE_NATIVE_INTERLEAVE: number;
	AK_INVALID_MIDI_CHANNEL: number;
	AK_INVALID_MIDI_NOTE: number;
	kDefaultDiffractionMaxEdges: number;
	kDefaultDiffractionMaxPaths: number;
	kMaxDiffraction: number;
	kDiffractionMaxEdges: number;
	kDiffractionMaxPaths: number;
	kPortalToPortalDiffractionMaxPaths: number;
	EditorIsSoundEngineLoaded: boolean;
	GameObjectHash: GameObjectHashFunction;
	WwiseVersion: string;

	AddBasePath(in_pszBasePath: string): AKRESULT;
	AddDefaultListener(in_listenerGameObj: number): AKRESULT;
	AddDefaultListener(in_listenerGameObj: GameObject): AKRESULT;
	AddListener(in_emitterGameObj: number, in_listenerGameObj: number): AKRESULT;
	AddListener(in_emitterGameObj: GameObject, in_listenerGameObj: GameObject): AKRESULT;
	AddOutput(
		in_Settings: AkOutputSettings,
		out_pDeviceID: unknown,
		in_pListenerIDs: number[],
		in_uNumListeners: number,
	): AKRESULT;
	AddOutput(in_Settings: AkOutputSettings, out_pDeviceID: unknown, in_pListenerIDs: number[]): AKRESULT;
	AddOutput(in_Settings: AkOutputSettings, out_pDeviceID: unknown): AKRESULT;
	AddOutput(in_Settings: AkOutputSettings): AKRESULT;
	AddOutputCaptureMarker(in_MarkerText: string): AKRESULT;
	AK_SPEAKER_SETUP_CONVERT_TO_SUPPORTED(io_uChannelMask: unknown): void;
	AK_SPEAKER_SETUP_FIX_LEFT_TO_CENTER(io_uChannelMask: unknown): void;
	AK_SPEAKER_SETUP_FIX_REAR_TO_SIDE(io_uChannelMask: unknown): void;
	AkGetDefaultHighPriorityThreadProperties(out_threadProperties: AkThreadProperties): void;
	BackToSideChannels(in_uChannelMask: number): number;
	CancelBankCallbackCookie(in_pCookie: unknown): void;
	CancelEventCallback(in_playingID: number): void;
	CancelEventCallbackCookie(in_pCookie: unknown): void;
	CancelEventCallbackGameObject(in_gameObjectID: number): void;
	CancelEventCallbackGameObject(in_gameObjectID: GameObject): void;
	ChannelBitToIndex(in_uChannelBit: number, in_uChannelMask: number): number;
	ChannelMaskFromNumChannels(in_uNumChannels: number): number;
	ChannelMaskToNumChannels(in_uChannelMask: number): number;
	ClearBanks(): AKRESULT;
	ClearCaptureData(): void;
	ClearImageSources(in_AuxBusID: number, in_gameObjectID: number): AKRESULT;
	ClearImageSources(in_AuxBusID: number): AKRESULT;
	ClearImageSources(): AKRESULT;
	ClearImageSources(in_AuxBusID: number, in_gameObjectID: GameObject): AKRESULT;
	ClearPreparedEvents(): AKRESULT;
	ConvertAkTransformToAkWorldTransform(in_: AkTransform): AkWorldTransform;
	ConvertAkVector64ToAkVector(in_: AkVector64): Vector3;
	ConvertAkVectorToAkVector64(in_: Vector3): AkVector64;
	ConvertAkWorldTransformToAkTransform(in_: AkWorldTransform): AkTransform;
	DynamicSequenceBreak(in_playingID: number): AKRESULT;
	DynamicSequenceClose(in_playingID: number): AKRESULT;
	DynamicSequenceGetPauseTimes(in_playingID: number, out_uTime: unknown, out_uDuration: unknown): AKRESULT;
	DynamicSequenceLockPlaylist(in_playingID: number): AkPlaylist;
	DynamicSequenceOpen(
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_eDynamicSequenceType: AkDynamicSequenceType,
	): number;
	DynamicSequenceOpen(
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	DynamicSequenceOpen(in_gameObjectID: number): number;
	DynamicSequenceOpen(
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_eDynamicSequenceType: AkDynamicSequenceType,
	): number;
	DynamicSequenceOpen(
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	DynamicSequenceOpen(in_gameObjectID: GameObject): number;
	DynamicSequencePause(
		in_playingID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	DynamicSequencePause(in_playingID: number, in_uTransitionDuration: number): AKRESULT;
	DynamicSequencePause(in_playingID: number): AKRESULT;
	DynamicSequencePlay(
		in_playingID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	DynamicSequencePlay(in_playingID: number, in_uTransitionDuration: number): AKRESULT;
	DynamicSequencePlay(in_playingID: number): AKRESULT;
	DynamicSequenceResume(
		in_playingID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	DynamicSequenceResume(in_playingID: number, in_uTransitionDuration: number): AKRESULT;
	DynamicSequenceResume(in_playingID: number): AKRESULT;
	DynamicSequenceStop(
		in_playingID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	DynamicSequenceStop(in_playingID: number, in_uTransitionDuration: number): AKRESULT;
	DynamicSequenceStop(in_playingID: number): AKRESULT;
	DynamicSequenceUnlockPlaylist(in_playingID: number): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_PlayingID: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
	): AKRESULT;
	ExecuteActionOnEvent(in_eventID: number, in_ActionType: AkActionOnEventType, in_gameObjectID: number): AKRESULT;
	ExecuteActionOnEvent(in_eventID: number, in_ActionType: AkActionOnEventType): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_PlayingID: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
		in_uTransitionDuration: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: number,
	): AKRESULT;
	ExecuteActionOnEvent(in_pszEventName: string, in_ActionType: AkActionOnEventType): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_PlayingID: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_eventID: number,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
	): AKRESULT;
	ExecuteActionOnEvent(in_eventID: number, in_ActionType: AkActionOnEventType, in_gameObjectID: GameObject): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_PlayingID: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
		in_uTransitionDuration: number,
	): AKRESULT;
	ExecuteActionOnEvent(
		in_pszEventName: string,
		in_ActionType: AkActionOnEventType,
		in_gameObjectID: GameObject,
	): AKRESULT;
	ExecuteActionOnPlayingID(
		in_ActionType: AkActionOnEventType,
		in_playingID: number,
		in_uTransitionDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): void;
	ExecuteActionOnPlayingID(
		in_ActionType: AkActionOnEventType,
		in_playingID: number,
		in_uTransitionDuration: number,
	): void;
	ExecuteActionOnPlayingID(in_ActionType: AkActionOnEventType, in_playingID: number): void;
	GetAkGameObjectID(gameObject: GameObject): number;
	GetAudioSettings(out_audioSettings: AkAudioSettings): AKRESULT;
	GetBackgroundMusicMute(): boolean;
	GetBufferStatusForPinnedEvent(
		in_eventID: number,
		out_fPercentBuffered: unknown,
		out_bCachePinnedMemoryFull: unknown,
	): AKRESULT;
	GetBufferStatusForPinnedEvent(
		in_pszEventName: string,
		out_fPercentBuffered: unknown,
		out_bCachePinnedMemoryFull: unknown,
	): AKRESULT;
	GetBufferTick(): number;
	GetCaptureSamples(in_idOutputDeviceID: number, out_pSamples: number[], in_uBufferSize: number): number;
	GetCurrentLanguage(): string;
	GetCustomPropertyValue(in_ObjectID: number, in_uPropID: number, out_iValue: unknown): AKRESULT;
	GetCustomPropertyValue(in_ObjectID: number, in_uPropID: number, out_fValue: unknown): AKRESULT;
	GetDefaultDeviceSettings(out_settings: AkDeviceSettings): void;
	GetDefaultInitSettings(out_settings: AkInitSettings): void;
	GetDefaultMusicSettings(out_settings: AkMusicSettings): void;
	GetDefaultPlatformInitSettings(out_settings: AkPlatformInitSettings): void;
	GetDefaultStreamSettings(out_settings: AkStreamMgrSettings): void;
	GetDeviceList(
		in_ulCompanyID: number,
		in_ulPluginID: number,
		io_maxNumDevices: unknown,
		out_deviceDescriptions: AkDeviceDescriptionArray,
	): AKRESULT;
	GetDeviceList(
		in_audioDeviceShareSetID: number,
		io_maxNumDevices: unknown,
		out_deviceDescriptions: AkDeviceDescriptionArray,
	): AKRESULT;
	GetDeviceSpatialAudioSupport(in_idDevice: number): AKRESULT;
	GetDialogueEventCustomPropertyValue(in_eventID: number, in_uPropID: number, out_iValue: unknown): AKRESULT;
	GetDialogueEventCustomPropertyValue(in_eventID: number, in_uPropID: number, out_fValue: unknown): AKRESULT;
	GetEventIDFromPlayingID(in_playingID: number): number;
	GetGameObjectAuxSendValues(
		in_gameObjectID: number,
		out_paAuxSendValues: AkAuxSendArray,
		io_ruNumSendValues: unknown,
	): AKRESULT;
	GetGameObjectAuxSendValues(
		in_gameObjectID: GameObject,
		out_paAuxSendValues: AkAuxSendArray,
		io_ruNumSendValues: unknown,
	): AKRESULT;
	GetGameObjectDryLevelValue(in_EmitterID: number, in_ListenerID: number, out_rfControlValue: unknown): AKRESULT;
	GetGameObjectDryLevelValue(
		in_EmitterID: GameObject,
		in_ListenerID: GameObject,
		out_rfControlValue: unknown,
	): AKRESULT;
	GetGameObjectFromPlayingID(in_playingID: number): number;
	GetIDFromString(in_pszString: string): number;
	GetIsGameObjectActive(in_GameObjId: number): boolean;
	GetIsGameObjectActive(in_GameObjId: GameObject): boolean;
	GetListenerPosition(in_uIndex: number, out_rPosition: AkWorldTransform): AKRESULT;
	GetListenerPosition(in_uIndex: GameObject, out_rPosition: AkTransform): AKRESULT;
	GetMajorMinorVersion(): number;
	GetMaxRadius(in_GameObjId: number): number;
	GetMaxRadius(in_GameObjId: GameObject): number;
	GetNextPowerOfTwo(in_uValue: number): number;
	GetNumNonZeroBits(in_uWord: number): number;
	GetObjectObstructionAndOcclusion(
		in_EmitterID: number,
		in_ListenerID: number,
		out_rfObstructionLevel: unknown,
		out_rfOcclusionLevel: unknown,
	): AKRESULT;
	GetObjectObstructionAndOcclusion(
		in_EmitterID: GameObject,
		in_ListenerID: GameObject,
		out_rfObstructionLevel: unknown,
		out_rfOcclusionLevel: unknown,
	): AKRESULT;
	GetOutputDeviceConfiguration(
		in_idOutput: number,
		io_channelConfig: AkChannelConfig,
		io_capabilities: Ak3DAudioSinkCapabilities,
	): AKRESULT;
	GetOutputID(in_idShareset: number, in_idDevice: number): number;
	GetOutputID(in_szShareSet: string, in_idDevice: number): number;
	GetPanningRule(out_ePanningRule: unknown, in_idOutput: number): AKRESULT;
	GetPanningRule(out_ePanningRule: unknown): AKRESULT;
	GetPlayingIDsFromGameObject(in_GameObjId: number, io_ruNumIDs: unknown, out_aPlayingIDs: number[]): AKRESULT;
	GetPlayingIDsFromGameObject(in_GameObjId: GameObject, io_ruNumIDs: unknown, out_aPlayingIDs: number[]): AKRESULT;
	GetPlayingSegmentInfo(in_PlayingID: number, out_segmentInfo: AkSegmentInfo, in_bExtrapolate: boolean): AKRESULT;
	GetPlayingSegmentInfo(in_PlayingID: number, out_segmentInfo: AkSegmentInfo): AKRESULT;
	GetPosition(in_GameObjectID: number, out_rPosition: AkWorldTransform): AKRESULT;
	GetPosition(in_GameObjectID: GameObject, out_rPosition: AkTransform): AKRESULT;
	GetPositioningInfo(in_ObjectID: number, out_rPositioningInfo: AkPositioningInfo): AKRESULT;
	GetResourceMonitorDataSummary(resourceMonitorDataSummary: AkResourceMonitorDataSummary): void;
	GetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: number,
		in_playingID: number,
		out_rValue: unknown,
		io_rValueType: unknown,
	): AKRESULT;
	GetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: number,
		in_playingID: number,
		out_rValue: unknown,
		io_rValueType: unknown,
	): AKRESULT;
	GetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: GameObject,
		in_playingID: number,
		out_rValue: unknown,
		io_rValueType: unknown,
	): AKRESULT;
	GetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: GameObject,
		in_playingID: number,
		out_rValue: unknown,
		io_rValueType: unknown,
	): AKRESULT;
	GetSampleRate(): number;
	GetSampleTick(): number;
	GetSourceMultiplePlayPositions(
		in_PlayingID: number,
		out_audioNodeID: number[],
		out_mediaID: number[],
		out_msTime: number[],
		io_pcPositions: unknown,
		in_bExtrapolate: boolean,
	): AKRESULT;
	GetSourceMultiplePlayPositions(
		in_PlayingID: number,
		out_audioNodeID: number[],
		out_mediaID: number[],
		out_msTime: number[],
		io_pcPositions: unknown,
	): AKRESULT;
	GetSourcePlayPosition(in_PlayingID: number, out_puPosition: unknown, in_bExtrapolate: boolean): AKRESULT;
	GetSourcePlayPosition(in_PlayingID: number, out_puPosition: unknown): AKRESULT;
	GetSourceStreamBuffering(in_PlayingID: number, out_buffering: unknown, out_bIsBuffering: unknown): AKRESULT;
	GetSpeakerAngles(
		io_pfSpeakerAngles: number[],
		io_uNumAngles: unknown,
		out_fHeightAngle: unknown,
		in_idOutput: number,
	): AKRESULT;
	GetSpeakerAngles(io_pfSpeakerAngles: number[], io_uNumAngles: unknown, out_fHeightAngle: unknown): AKRESULT;
	GetSpeakerConfiguration(in_idOutput: number): AkChannelConfig;
	GetSpeakerConfiguration(): AkChannelConfig;
	GetState(in_stateGroup: number, out_rState: unknown): AKRESULT;
	GetState(in_pstrStateGroupName: string, out_rState: unknown): AKRESULT;
	GetSubminorBuildVersion(): number;
	GetSwitch(in_switchGroup: number, in_gameObjectID: number, out_rSwitchState: unknown): AKRESULT;
	GetSwitch(in_pstrSwitchGroupName: string, in_GameObj: number, out_rSwitchState: unknown): AKRESULT;
	GetSwitch(in_switchGroup: number, in_gameObjectID: GameObject, out_rSwitchState: unknown): AKRESULT;
	GetSwitch(in_pstrSwitchGroupName: string, in_GameObj: GameObject, out_rSwitchState: unknown): AKRESULT;
	GetTimeStamp(): number;
	HasHeightChannels(in_uChannelMask: number): boolean;
	HasSideAndRearChannels(in_uChannelMask: number): boolean;
	HasStrictlyOnePairOfSurroundChannels(in_uChannelMask: number): boolean;
	HasSurroundChannels(in_uChannelMask: number): boolean;
	Init(settings: AkInitializationSettings): AKRESULT;
	InitCommunication(settings: AkCommunicationSettings): AKRESULT;
	InitSpatialAudio(settings: AkSpatialAudioInitSettings): AKRESULT;
	IsBankCodecID(in_codecID: number): boolean;
	IsGameObjectRegistered(in_gameObject: GameObject): boolean;
	IsInitialized(): boolean;
	LoadAndDecodeBank(in_pszString: string, in_bSaveDecodedBank: boolean, out_bankID: unknown): AKRESULT;
	LoadAndDecodeBankFromMemory(
		in_BankData: unknown,
		in_BankDataSize: number,
		in_bSaveDecodedBank: boolean,
		in_DecodedBankName: string,
		in_bIsLanguageSpecific: boolean,
		out_bankID: unknown,
	): AKRESULT;
	LoadBank(in_pszString: string, out_bankID: unknown, in_bankType: number): AKRESULT;
	LoadBank(in_pszString: string, out_bankID: unknown): AKRESULT;
	LoadBank(in_bankID: number, in_bankType: number): AKRESULT;
	LoadBank(in_bankID: number): AKRESULT;
	LoadBank(
		in_pszString: string,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		out_bankID: unknown,
		in_bankType: number,
	): AKRESULT;
	LoadBank(
		in_pszString: string,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		out_bankID: unknown,
	): AKRESULT;
	LoadBank(in_bankID: number, in_pfnBankCallback: BankCallback, in_pCookie: unknown, in_bankType: number): AKRESULT;
	LoadBank(in_bankID: number, in_pfnBankCallback: BankCallback, in_pCookie: unknown): AKRESULT;
	LoadBankMemoryCopy(in_pInMemoryBankPtr: unknown, in_uInMemoryBankSize: number, out_bankID: unknown): AKRESULT;
	LoadBankMemoryCopy(
		in_pInMemoryBankPtr: unknown,
		in_uInMemoryBankSize: number,
		out_bankID: unknown,
		out_bankType: unknown,
	): AKRESULT;
	LoadBankMemoryCopy(
		in_pInMemoryBankPtr: unknown,
		in_uInMemoryBankSize: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		out_bankID: unknown,
		out_bankType: unknown,
	): AKRESULT;
	LoadBankMemoryView(in_pInMemoryBankPtr: unknown, in_uInMemoryBankSize: number, out_bankID: unknown): AKRESULT;
	LoadBankMemoryView(
		in_pInMemoryBankPtr: unknown,
		in_uInMemoryBankSize: number,
		out_bankID: unknown,
		out_bankType: unknown,
	): AKRESULT;
	LoadBankMemoryView(
		in_pInMemoryBankPtr: unknown,
		in_uInMemoryBankSize: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		out_bankID: unknown,
	): AKRESULT;
	LoadBankMemoryView(
		in_pInMemoryBankPtr: unknown,
		in_uInMemoryBankSize: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		out_bankID: unknown,
		out_bankType: unknown,
	): AKRESULT;
	LoadFilePackage(in_pszFilePackageName: string, out_uPackageID: unknown): AKRESULT;
	MonitorStreamingDeviceDestroyed(in_deviceID: number): void;
	MonitorStreamingDeviceInit(in_deviceID: number, in_deviceSettings: AkDeviceSettings): void;
	MonitorStreamMgrInit(in_streamMgrSettings: AkStreamMgrSettings): void;
	MonitorStreamMgrTerm(): void;
	MuteBackgroundMusic(in_bMute: boolean): void;
	PerformStreamMgrIO(): void;
	PinEventInStreamCache(in_eventID: number, in_uActivePriority: number, in_uInactivePriority: number): AKRESULT;
	PinEventInStreamCache(in_pszEventName: string, in_uActivePriority: number, in_uInactivePriority: number): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
		in_audioNodeID: number,
		in_bIsBus: boolean,
	): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
		in_audioNodeID: number,
	): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
	): AKRESULT;
	PostCode(in_eError: AkMonitorErrorCode, in_eErrorLevel: AkMonitorErrorLevel, in_playingID: number): AKRESULT;
	PostCode(in_eError: AkMonitorErrorCode, in_eErrorLevel: AkMonitorErrorLevel): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
		in_audioNodeID: number,
		in_bIsBus: boolean,
	): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
		in_audioNodeID: number,
	): AKRESULT;
	PostCode(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
	): AKRESULT;
	PostCodeVarArg(
		in_eError: AkMonitorErrorCode,
		in_eErrorLevel: AkMonitorErrorLevel,
		msgContext: MsgContext,
	): AKRESULT;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEvent(in_eventID: number, in_gameObjectID: number): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEvent(in_pszEventName: string, in_gameObjectID: number): number;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEvent(in_eventID: number, in_gameObjectID: GameObject): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEvent(in_pszEventName: string, in_gameObjectID: GameObject): number;
	PostEventOnRoom(
		in_pszEventName: string,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEventOnRoom(
		in_pszEventName: string,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEventOnRoom(
		in_pszEventName: string,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEventOnRoom(in_pszEventName: string, in_roomID: number): number;
	PostEventOnRoom(
		in_eventID: number,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
		in_PlayingID: number,
	): number;
	PostEventOnRoom(
		in_eventID: number,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_cExternals: number,
		in_pExternalSources: AkExternalSourceInfoArray,
	): number;
	PostEventOnRoom(
		in_eventID: number,
		in_roomID: number,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostEventOnRoom(in_eventID: number, in_roomID: number): number;
	PostMIDIOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_pPosts: AkMIDIPostArray,
		in_uNumPosts: number,
		in_bAbsoluteOffsets: boolean,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
		in_playingID: number,
	): number;
	PostMIDIOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_pPosts: AkMIDIPostArray,
		in_uNumPosts: number,
		in_bAbsoluteOffsets: boolean,
		in_uFlags: number,
		in_pfnCallback: EventCallback,
		in_pCookie: unknown,
	): number;
	PostMIDIOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_pPosts: AkMIDIPostArray,
		in_uNumPosts: number,
		in_bAbsoluteOffsets: boolean,
	): number;
	PostMIDIOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_pPosts: AkMIDIPostArray,
		in_uNumPosts: number,
	): number;
	PostMIDIOnEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_pPosts: AkMIDIPostArray,
		in_uNumPosts: number,
	): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
		in_audioNodeID: number,
		in_bIsBus: boolean,
	): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
		in_audioNodeID: number,
	): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: number,
	): AKRESULT;
	PostString(in_pszError: string, in_eErrorLevel: AkMonitorErrorLevel, in_playingID: number): AKRESULT;
	PostString(in_pszError: string, in_eErrorLevel: AkMonitorErrorLevel): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
		in_audioNodeID: number,
		in_bIsBus: boolean,
	): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
		in_audioNodeID: number,
	): AKRESULT;
	PostString(
		in_pszError: string,
		in_eErrorLevel: AkMonitorErrorLevel,
		in_playingID: number,
		in_gameObjID: GameObject,
	): AKRESULT;
	PostTrigger(in_triggerID: number, in_gameObjectID: number): AKRESULT;
	PostTrigger(in_pszTrigger: string, in_gameObjectID: number): AKRESULT;
	PostTrigger(in_triggerID: number, in_gameObjectID: GameObject): AKRESULT;
	PostTrigger(in_pszTrigger: string, in_gameObjectID: GameObject): AKRESULT;
	PreGameObjectAPICall(gameObject: GameObject, id: number): void;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_pszString: string,
		in_uFlags: AkBankContent,
		in_bankType: number,
	): AKRESULT;
	PrepareBank(in_PreparationType: AkPreparationType, in_pszString: string, in_uFlags: AkBankContent): AKRESULT;
	PrepareBank(in_PreparationType: AkPreparationType, in_pszString: string): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_bankID: number,
		in_uFlags: AkBankContent,
		in_bankType: number,
	): AKRESULT;
	PrepareBank(in_PreparationType: AkPreparationType, in_bankID: number, in_uFlags: AkBankContent): AKRESULT;
	PrepareBank(in_PreparationType: AkPreparationType, in_bankID: number): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_pszString: string,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_uFlags: AkBankContent,
		in_bankType: number,
	): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_pszString: string,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_uFlags: AkBankContent,
	): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_pszString: string,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_bankID: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_uFlags: AkBankContent,
		in_bankType: number,
	): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_bankID: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_uFlags: AkBankContent,
	): AKRESULT;
	PrepareBank(
		in_PreparationType: AkPreparationType,
		in_bankID: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	PrepareEvent(in_PreparationType: AkPreparationType, in_ppszString: string[], in_uNumEvent: number): AKRESULT;
	PrepareEvent(in_PreparationType: AkPreparationType, in_pEventID: number[], in_uNumEvent: number): AKRESULT;
	PrepareEvent(
		in_PreparationType: AkPreparationType,
		in_ppszString: string[],
		in_uNumEvent: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	PrepareEvent(
		in_PreparationType: AkPreparationType,
		in_pEventID: number[],
		in_uNumEvent: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	PrepareGameSyncs(
		in_PreparationType: AkPreparationType,
		in_eGameSyncType: AkGroupType,
		in_pszGroupName: string,
		in_ppszGameSyncName: string[],
		in_uNumGameSyncs: number,
	): AKRESULT;
	PrepareGameSyncs(
		in_PreparationType: AkPreparationType,
		in_eGameSyncType: AkGroupType,
		in_GroupID: number,
		in_paGameSyncID: number[],
		in_uNumGameSyncs: number,
	): AKRESULT;
	PrepareGameSyncs(
		in_PreparationType: AkPreparationType,
		in_eGameSyncType: AkGroupType,
		in_pszGroupName: string,
		in_ppszGameSyncName: string[],
		in_uNumGameSyncs: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	PrepareGameSyncs(
		in_PreparationType: AkPreparationType,
		in_eGameSyncType: AkGroupType,
		in_GroupID: number,
		in_paGameSyncID: number[],
		in_uNumGameSyncs: number,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	QueryAudioObjectIDs(in_eventID: number, io_ruNumItems: unknown, out_aObjectInfos: AkObjectInfoArray): AKRESULT;
	QueryAudioObjectIDs(in_pszEventName: string, io_ruNumItems: unknown, out_aObjectInfos: AkObjectInfoArray): AKRESULT;
	QueryDiffractionPaths(
		in_gameObjectID: number,
		in_positionIndex: number,
		out_listenerPos: unknown,
		out_emitterPos: unknown,
		out_aPaths: AkDiffractionPathInfoArray,
		io_uArraySize: unknown,
	): AKRESULT;
	QueryDiffractionPaths(
		in_gameObjectID: GameObject,
		in_positionIndex: number,
		out_listenerPos: unknown,
		out_emitterPos: unknown,
		out_aPaths: AkDiffractionPathInfoArray,
		io_uArraySize: unknown,
	): AKRESULT;
	QueryReflectionPaths(
		in_gameObjectID: number,
		in_positionIndex: number,
		out_listenerPos: unknown,
		out_emitterPos: unknown,
		out_aPaths: AkReflectionPathInfoArray,
		io_uArraySize: unknown,
	): AKRESULT;
	QueryReflectionPaths(
		in_gameObjectID: GameObject,
		in_positionIndex: number,
		out_listenerPos: unknown,
		out_emitterPos: unknown,
		out_aPaths: AkReflectionPathInfoArray,
		io_uArraySize: unknown,
	): AKRESULT;
	QueryWetDiffraction(in_portal: number, out_wetDiffraction: unknown): AKRESULT;
	RegisterGameObj(gameObject: GameObject): AKRESULT;
	RegisterGameObj(gameObject: GameObject, name: string): AKRESULT;
	RegisterGameObjInternal(in_GameObj: number): AKRESULT;
	RegisterGameObjInternal(in_GameObj: GameObject): AKRESULT;
	RegisterGameObjInternal_WithName(in_GameObj: number, in_pszObjName: string): AKRESULT;
	RegisterGameObjInternal_WithName(in_GameObj: GameObject, in_pszObjName: string): AKRESULT;
	RegisterPluginDLL(in_DllName: string, in_DllPath: string): AKRESULT;
	RegisterPluginDLL(in_DllName: string): AKRESULT;
	RegisterSpatialAudioListener(in_gameObjectID: number): AKRESULT;
	RegisterSpatialAudioListener(in_gameObjectID: GameObject): AKRESULT;
	RemoveDefaultListener(in_listenerGameObj: number): AKRESULT;
	RemoveDefaultListener(in_listenerGameObj: GameObject): AKRESULT;
	RemoveGeometry(in_SetID: number): AKRESULT;
	RemoveGeometryInstance(in_GeometryInstanceID: number): AKRESULT;
	RemoveImageSource(in_srcID: number, in_AuxBusID: number, in_gameObjectID: number): AKRESULT;
	RemoveImageSource(in_srcID: number, in_AuxBusID: number): AKRESULT;
	RemoveImageSource(in_srcID: number): AKRESULT;
	RemoveImageSource(in_srcID: number, in_AuxBusID: number, in_gameObjectID: GameObject): AKRESULT;
	RemoveListener(in_emitterGameObj: number, in_listenerGameObj: number): AKRESULT;
	RemoveListener(in_emitterGameObj: GameObject, in_listenerGameObj: GameObject): AKRESULT;
	RemoveOutput(in_idOutput: number): AKRESULT;
	RemovePortal(in_PortalID: number): AKRESULT;
	RemoveRoom(in_RoomID: number): AKRESULT;
	RenderAudio(in_bAllowSyncRender: boolean): AKRESULT;
	RenderAudio(): AKRESULT;
	ReplaceOutput(in_Settings: AkOutputSettings, in_outputDeviceId: number, out_pOutputDeviceId: unknown): AKRESULT;
	ReplaceOutput(in_Settings: AkOutputSettings, in_outputDeviceId: number): AKRESULT;
	ResetListenersToDefault(in_emitterGameObj: number): AKRESULT;
	ResetListenersToDefault(in_emitterGameObj: GameObject): AKRESULT;
	ResetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	ResetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ResetRTPCValue(in_rtpcID: number, in_gameObjectID: number, in_uValueChangeDuration: number): AKRESULT;
	ResetRTPCValue(in_rtpcID: number, in_gameObjectID: number): AKRESULT;
	ResetRTPCValue(in_rtpcID: number): AKRESULT;
	ResetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	ResetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ResetRTPCValue(in_pszRtpcName: string, in_gameObjectID: number, in_uValueChangeDuration: number): AKRESULT;
	ResetRTPCValue(in_pszRtpcName: string, in_gameObjectID: number): AKRESULT;
	ResetRTPCValue(in_pszRtpcName: string): AKRESULT;
	ResetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	ResetRTPCValue(
		in_rtpcID: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ResetRTPCValue(in_rtpcID: number, in_gameObjectID: GameObject, in_uValueChangeDuration: number): AKRESULT;
	ResetRTPCValue(in_rtpcID: number, in_gameObjectID: GameObject): AKRESULT;
	ResetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	ResetRTPCValue(
		in_pszRtpcName: string,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	ResetRTPCValue(in_pszRtpcName: string, in_gameObjectID: GameObject, in_uValueChangeDuration: number): AKRESULT;
	ResetRTPCValue(in_pszRtpcName: string, in_gameObjectID: GameObject): AKRESULT;
	ResetStochasticEngine(): AKRESULT;
	ResetTranslator(): AKRESULT;
	ResolveDialogueEvent(
		in_eventID: number,
		in_aArgumentValues: number[],
		in_uNumArguments: number,
		in_idSequence: number,
	): number;
	ResolveDialogueEvent(in_eventID: number, in_aArgumentValues: number[], in_uNumArguments: number): number;
	ROTL32(x: number, r: number): number;
	ROTL64(x: number, r: number): number;
	Seek(in_playingID: number, in_iPosition: number, in_bSeekToNearestMarker: boolean): AKRESULT;
	Seek(in_playingID: number, in_fPercent: number, in_bSeekToNearestMarker: boolean): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_eventID: number, in_gameObjectID: number, in_iPosition: number): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_pszEventName: string, in_gameObjectID: number, in_iPosition: number): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: number,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_eventID: number, in_gameObjectID: number, in_fPercent: number): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: number,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_pszEventName: string, in_gameObjectID: number, in_fPercent: number): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_eventID: number, in_gameObjectID: GameObject, in_iPosition: number): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_iPosition: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_pszEventName: string, in_gameObjectID: GameObject, in_iPosition: number): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_eventID: number,
		in_gameObjectID: GameObject,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_eventID: number, in_gameObjectID: GameObject, in_fPercent: number): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
		in_PlayingID: number,
	): AKRESULT;
	SeekOnEvent(
		in_pszEventName: string,
		in_gameObjectID: GameObject,
		in_fPercent: number,
		in_bSeekToNearestMarker: boolean,
	): AKRESULT;
	SeekOnEvent(in_pszEventName: string, in_gameObjectID: GameObject, in_fPercent: number): AKRESULT;
	SendPluginCustomGameData(
		in_busID: number,
		in_busObjectID: number,
		in_eType: AkPluginType,
		in_uCompanyID: number,
		in_uPluginID: number,
		in_pData: unknown,
		in_uSizeInBytes: number,
	): AKRESULT;
	SendPluginCustomGameData(
		in_busID: number,
		in_busObjectID: GameObject,
		in_eType: AkPluginType,
		in_uCompanyID: number,
		in_uPluginID: number,
		in_pData: unknown,
		in_uSizeInBytes: number,
	): AKRESULT;
	SetActorMixerEffect(in_audioNodeID: number, in_uFXIndex: number, in_shareSetID: number): AKRESULT;
	SetAudioInputCallbacks(
		getAudioSamples: AudioSamplesInteropDelegate,
		getAudioFormat: AudioFormatInteropDelegate,
	): void;
	SetBankLoadIOSettings(in_fThroughput: number, in_priority: number): AKRESULT;
	SetBasePath(in_pszBasePath: string): AKRESULT;
	SetBusConfig(in_audioNodeID: number, in_channelConfig: AkChannelConfig): AKRESULT;
	SetBusConfig(in_pszBusName: string, in_channelConfig: AkChannelConfig): AKRESULT;
	SetBusDevice(in_idBus: number, in_idNewDevice: number): AKRESULT;
	SetBusDevice(in_BusName: string, in_DeviceName: string): AKRESULT;
	SetBusEffect(in_audioNodeID: number, in_uFXIndex: number, in_shareSetID: number): AKRESULT;
	SetBusEffect(in_pszBusName: string, in_uFXIndex: number, in_shareSetID: number): AKRESULT;
	SetCurrentLanguage(in_pszAudioSrcPath: string): AKRESULT;
	SetDecodedBankPath(in_DecodedPath: string): AKRESULT;
	SetDefaultListeners(in_pListenerObjs: number[], in_uNumListeners: number): AKRESULT;
	SetDiffractionOrder(in_uDiffractionOrder: number, in_bUpdatePaths: boolean): AKRESULT;
	SetDistanceProbe(in_listenerGameObjectID: number, in_distanceProbeGameObjectID: number): AKRESULT;
	SetEarlyReflectionsAuxSend(in_gameObjectID: number, in_auxBusID: number): AKRESULT;
	SetEarlyReflectionsAuxSend(in_gameObjectID: GameObject, in_auxBusID: number): AKRESULT;
	SetEarlyReflectionsVolume(in_gameObjectID: number, in_fSendVolume: number): AKRESULT;
	SetEarlyReflectionsVolume(in_gameObjectID: GameObject, in_fSendVolume: number): AKRESULT;
	SetErrorLogger(logger: ErrorLoggerInteropDelegate): void;
	SetErrorLogger(): void;
	SetGameName(in_GameName: string): AKRESULT;
	SetGameObjectAuxSendValues(
		in_gameObjectID: number,
		in_aAuxSendValues: AkAuxSendArray,
		in_uNumSendValues: number,
	): AKRESULT;
	SetGameObjectAuxSendValues(
		in_gameObjectID: GameObject,
		in_aAuxSendValues: AkAuxSendArray,
		in_uNumSendValues: number,
	): AKRESULT;
	SetGameObjectInRoom(in_gameObjectID: number, in_CurrentRoomID: number): AKRESULT;
	SetGameObjectInRoom(in_gameObjectID: GameObject, in_CurrentRoomID: number): AKRESULT;
	SetGameObjectOutputBusVolume(in_emitterObjID: number, in_listenerObjID: number, in_fControlValue: number): AKRESULT;
	SetGameObjectOutputBusVolume(
		in_emitterObjID: GameObject,
		in_listenerObjID: GameObject,
		in_fControlValue: number,
	): AKRESULT;
	SetGameObjectRadius(in_gameObjectID: number, in_outerRadius: number, in_innerRadius: number): AKRESULT;
	SetGameObjectToPortalObstruction(in_gameObjectID: number, in_PortalID: number, in_fObstruction: number): AKRESULT;
	SetGeometry(
		in_GeomSetID: number,
		Triangles: AkTriangleArray,
		NumTriangles: number,
		Vertices: Vector3[],
		NumVertices: number,
		Surfaces: AkAcousticSurfaceArray,
		NumSurfaces: number,
		EnableDiffraction: boolean,
		EnableDiffractionOnBoundaryEdges: boolean,
		EnableTriangles: boolean,
	): AKRESULT;
	SetGeometryInstance(
		in_GeomInstanceID: number,
		Transform: AkTransform,
		Scale: Vector3,
		GeometrySetID: number,
		RoomID: number,
	): AKRESULT;
	SetImageSource(
		in_srcID: number,
		in_info: AkImageSourceSettings,
		in_name: string,
		in_AuxBusID: number,
		in_gameObjectID: number,
	): AKRESULT;
	SetImageSource(in_srcID: number, in_info: AkImageSourceSettings, in_name: string, in_AuxBusID: number): AKRESULT;
	SetImageSource(in_srcID: number, in_info: AkImageSourceSettings, in_name: string): AKRESULT;
	SetImageSource(
		in_srcID: number,
		in_info: AkImageSourceSettings,
		in_imageSourceName: string,
		in_AuxBusID: number,
		in_gameObjectID: GameObject,
	): AKRESULT;
	SetListeners(in_emitterGameObj: number, in_pListenerGameObjs: number[], in_uNumListeners: number): AKRESULT;
	SetListeners(in_emitterGameObj: GameObject, in_pListenerGameObjs: number[], in_uNumListeners: number): AKRESULT;
	SetListenerSpatialization(
		in_uListenerID: number,
		in_bSpatialized: boolean,
		in_channelConfig: AkChannelConfig,
		in_pVolumeOffsets: number[],
	): AKRESULT;
	SetListenerSpatialization(
		in_uListenerID: number,
		in_bSpatialized: boolean,
		in_channelConfig: AkChannelConfig,
	): AKRESULT;
	SetListenerSpatialization(
		in_uListenerID: GameObject,
		in_bSpatialized: boolean,
		in_channelConfig: AkChannelConfig,
		in_pVolumeOffsets: number[],
	): AKRESULT;
	SetListenerSpatialization(
		in_uListenerID: GameObject,
		in_bSpatialized: boolean,
		in_channelConfig: AkChannelConfig,
	): AKRESULT;
	SetLoadBalancingSpread(in_uNbFrames: number): AKRESULT;
	SetMaxNumVoicesLimit(in_maxNumberVoices: number): AKRESULT;
	SetMedia(in_pSourceSettings: AkSourceSettingsArray, in_uNumSourceSettings: number): AKRESULT;
	SetMixer(in_audioNodeID: number, in_shareSetID: number): AKRESULT;
	SetMixer(in_pszBusName: string, in_shareSetID: number): AKRESULT;
	SetMultipleObstructionAndOcclusion(
		in_EmitterID: number,
		in_uListenerID: number,
		in_fObstructionOcclusionValues: AkObstructionOcclusionValuesArray,
		in_uNumOcclusionObstruction: number,
	): AKRESULT;
	SetMultipleObstructionAndOcclusion(
		in_EmitterID: GameObject,
		in_uListenerID: GameObject,
		in_fObstructionOcclusionValues: AkObstructionOcclusionValuesArray,
		in_uNumOcclusionObstruction: number,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: number,
		in_pPositions: AkPositionArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
		in_eFlags: AkSetPositionFlags,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: number,
		in_pPositions: AkPositionArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
	): AKRESULT;
	SetMultiplePositions(in_GameObjectID: number, in_pPositions: AkPositionArray, in_NumPositions: number): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: number,
		in_pPositions: AkChannelEmitterArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
		in_eFlags: AkSetPositionFlags,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: number,
		in_pPositions: AkChannelEmitterArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: number,
		in_pPositions: AkChannelEmitterArray,
		in_NumPositions: number,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: GameObject,
		in_pPositions: AkPositionArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: GameObject,
		in_pPositions: AkPositionArray,
		in_NumPositions: number,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: GameObject,
		in_pPositions: AkChannelEmitterArray,
		in_NumPositions: number,
		in_eMultiPositionType: AkMultiPositionType,
	): AKRESULT;
	SetMultiplePositions(
		in_GameObjectID: GameObject,
		in_pPositions: AkChannelEmitterArray,
		in_NumPositions: number,
	): AKRESULT;
	SetNumberOfPrimaryRays(in_uNbPrimaryRays: number): AKRESULT;
	SetObjectObstructionAndOcclusion(
		in_EmitterID: number,
		in_ListenerID: number,
		in_fObstructionLevel: number,
		in_fOcclusionLevel: number,
	): AKRESULT;
	SetObjectObstructionAndOcclusion(
		in_EmitterID: GameObject,
		in_ListenerID: GameObject,
		in_fObstructionLevel: number,
		in_fOcclusionLevel: number,
	): AKRESULT;
	SetObjectPosition(in_GameObjectID: number, Pos: Vector3, Front: Vector3, Top: Vector3): AKRESULT;
	SetObjectPosition(gameObject: GameObject, transform: Transform): AKRESULT;
	SetObjectPosition(
		gameObject: GameObject,
		posX: number,
		posY: number,
		posZ: number,
		frontX: number,
		frontY: number,
		frontZ: number,
		topX: number,
		topY: number,
		topZ: number,
	): AKRESULT;
	SetObjectPosition(in_GameObjectID: GameObject, Pos: Vector3, Front: Vector3, Top: Vector3): AKRESULT;
	SetOfflineRendering(in_bEnableOfflineRendering: boolean): AKRESULT;
	SetOfflineRenderingFrameTime(in_fFrameTimeInSeconds: number): AKRESULT;
	SetOutputDeviceEffect(in_outputDeviceID: number, in_uFXIndex: number, in_FXShareSetID: number): AKRESULT;
	SetOutputVolume(in_idOutput: number, in_fVolume: number): AKRESULT;
	SetPanningRule(in_ePanningRule: AkPanningRule, in_idOutput: number): AKRESULT;
	SetPanningRule(in_ePanningRule: AkPanningRule): AKRESULT;
	SetPortalObstructionAndOcclusion(in_PortalID: number, in_fObstruction: number, in_fOcclusion: number): AKRESULT;
	SetPortalToPortalObstruction(in_PortalID0: number, in_PortalID1: number, in_fObstruction: number): AKRESULT;
	SetRandomSeed(in_uSeed: number): void;
	SetReflectionsOrder(in_uReflectionsOrder: number, in_bUpdatePaths: boolean): AKRESULT;
	SetRoom(in_RoomID: number, in_roomParams: AkRoomParams, GeometryInstanceID: number, in_pName: string): AKRESULT;
	SetRoomPortal(
		in_PortalID: number,
		FrontRoom: number,
		BackRoom: number,
		Transform: AkTransform,
		Extent: AkExtent,
		bEnabled: boolean,
		in_pName: string,
	): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValue(in_rtpcID: number, in_value: number, in_gameObjectID: number): AKRESULT;
	SetRTPCValue(in_rtpcID: number, in_value: number): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: number,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValue(in_pszRtpcName: string, in_value: number, in_gameObjectID: number): AKRESULT;
	SetRTPCValue(in_pszRtpcName: string, in_value: number): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValue(
		in_rtpcID: number,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValue(in_rtpcID: number, in_value: number, in_gameObjectID: GameObject): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValue(
		in_pszRtpcName: string,
		in_value: number,
		in_gameObjectID: GameObject,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValue(in_pszRtpcName: string, in_value: number, in_gameObjectID: GameObject): AKRESULT;
	SetRTPCValueByPlayingID(
		in_rtpcID: number,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValueByPlayingID(
		in_rtpcID: number,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValueByPlayingID(
		in_rtpcID: number,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValueByPlayingID(in_rtpcID: number, in_value: number, in_playingID: number): AKRESULT;
	SetRTPCValueByPlayingID(
		in_pszRtpcName: string,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
		in_bBypassInternalValueInterpolation: boolean,
	): AKRESULT;
	SetRTPCValueByPlayingID(
		in_pszRtpcName: string,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
		in_eFadeCurve: AkCurveInterpolation,
	): AKRESULT;
	SetRTPCValueByPlayingID(
		in_pszRtpcName: string,
		in_value: number,
		in_playingID: number,
		in_uValueChangeDuration: number,
	): AKRESULT;
	SetRTPCValueByPlayingID(in_pszRtpcName: string, in_value: number, in_playingID: number): AKRESULT;
	SetScalingFactor(in_GameObjectID: number, in_fAttenuationScalingFactor: number): AKRESULT;
	SetScalingFactor(in_GameObjectID: GameObject, in_fAttenuationScalingFactor: number): AKRESULT;
	SetSpeakerAngles(
		in_pfSpeakerAngles: number[],
		in_uNumAngles: number,
		in_fHeightAngle: number,
		in_idOutput: number,
	): AKRESULT;
	SetSpeakerAngles(in_pfSpeakerAngles: number[], in_uNumAngles: number, in_fHeightAngle: number): AKRESULT;
	SetState(in_stateGroup: number, in_state: number): AKRESULT;
	SetState(in_pszStateGroup: string, in_pszState: string): AKRESULT;
	SetSwitch(in_switchGroup: number, in_switchState: number, in_gameObjectID: number): AKRESULT;
	SetSwitch(in_pszSwitchGroup: string, in_pszSwitchState: string, in_gameObjectID: number): AKRESULT;
	SetSwitch(in_switchGroup: number, in_switchState: number, in_gameObjectID: GameObject): AKRESULT;
	SetSwitch(in_pszSwitchGroup: string, in_pszSwitchState: string, in_gameObjectID: GameObject): AKRESULT;
	SetVolumeThreshold(in_fVolumeThresholdDB: number): AKRESULT;
	StartDeviceCapture(in_idOutputDeviceID: number): void;
	StartOutputCapture(in_CaptureFileName: string): AKRESULT;
	StartProfilerCapture(in_CaptureFileName: string): AKRESULT;
	StartResourceMonitoring(): void;
	StdChannelIndexToDisplayIndex(
		in_eOrdering: AkChannelOrdering,
		in_uChannelMask: number,
		in_uChannelIdx: number,
	): number;
	StopAll(in_gameObjectID: number): void;
	StopAll(): void;
	StopAll(in_gameObjectID: GameObject): void;
	StopDeviceCapture(in_idOutputDeviceID: number): void;
	StopMIDIOnEvent(in_eventID: number, in_gameObjectID: number, in_playingID: number): AKRESULT;
	StopMIDIOnEvent(in_eventID: number, in_gameObjectID: number): AKRESULT;
	StopMIDIOnEvent(in_eventID: number): AKRESULT;
	StopMIDIOnEvent(): AKRESULT;
	StopMIDIOnEvent(in_eventID: number, in_gameObjectID: GameObject): AKRESULT;
	StopMIDIOnEvent(in_eventID: number, in_gameObjectID: GameObject, in_playingID: number): AKRESULT;
	StopOutputCapture(): AKRESULT;
	StopPlayingID(in_playingID: number, in_uTransitionDuration: number, in_eFadeCurve: AkCurveInterpolation): void;
	StopPlayingID(in_playingID: number, in_uTransitionDuration: number): void;
	StopPlayingID(in_playingID: number): void;
	StopProfilerCapture(): AKRESULT;
	StopResourceMonitoring(): void;
	StringFromIntPtrOSString(ptr: unknown): string;
	StringFromIntPtrString(ptr: unknown): string;
	StringFromIntPtrWString(ptr: unknown): string;
	Suspend(in_bRenderAnyway: boolean, in_bFadeOut: boolean): AKRESULT;
	Suspend(in_bRenderAnyway: boolean): AKRESULT;
	Suspend(): AKRESULT;
	Term(): void;
	UnloadAllFilePackages(): AKRESULT;
	UnloadBank(in_pszString: string, in_pInMemoryBankPtr: unknown, in_bankType: number): AKRESULT;
	UnloadBank(in_pszString: string, in_pInMemoryBankPtr: unknown): AKRESULT;
	UnloadBank(in_bankID: number, in_pInMemoryBankPtr: unknown, in_bankType: number): AKRESULT;
	UnloadBank(in_bankID: number, in_pInMemoryBankPtr: unknown): AKRESULT;
	UnloadBank(
		in_pszString: string,
		in_pInMemoryBankPtr: unknown,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_bankType: number,
	): AKRESULT;
	UnloadBank(
		in_pszString: string,
		in_pInMemoryBankPtr: unknown,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	UnloadBank(
		in_bankID: number,
		in_pInMemoryBankPtr: unknown,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
		in_bankType: number,
	): AKRESULT;
	UnloadBank(
		in_bankID: number,
		in_pInMemoryBankPtr: unknown,
		in_pfnBankCallback: BankCallback,
		in_pCookie: unknown,
	): AKRESULT;
	UnloadFilePackage(in_uPackageID: number): AKRESULT;
	UnpinEventInStreamCache(in_eventID: number): AKRESULT;
	UnpinEventInStreamCache(in_pszEventName: string): AKRESULT;
	UnregisterAllGameObj(): AKRESULT;
	UnregisterGameObj(gameObject: GameObject): AKRESULT;
	UnregisterGameObjInternal(in_GameObj: number): AKRESULT;
	UnregisterGameObjInternal(in_GameObj: GameObject): AKRESULT;
	UnregisterSpatialAudioListener(in_gameObjectID: number): AKRESULT;
	UnregisterSpatialAudioListener(in_gameObjectID: GameObject): AKRESULT;
	UnsetMedia(in_pSourceSettings: AkSourceSettingsArray, in_uNumSourceSettings: number): AKRESULT;
	UpdateCaptureSampleCount(in_idOutputDeviceID: number): number;
	WakeupFromSuspend(in_uDelayMs: number): AKRESULT;
	WakeupFromSuspend(): AKRESULT;
}
declare const AkSoundEngine: AkSoundEngineConstructor;

interface EventSystem extends UIBehaviour {
	sendNavigationEvents: boolean;
	pixelDragThreshold: number;
	currentInputModule: BaseInputModule;
	firstSelectedGameObject: GameObject;
	currentSelectedGameObject: GameObject;
	lastSelectedGameObject: GameObject;
	isFocused: boolean;
	alreadySelecting: boolean;

	IsPointerOverGameObject(): boolean;
	IsPointerOverGameObject(pointerId: number): boolean;
	RaycastAll(eventData: PointerEventData): RaycastResult[];
	SetSelectedGameObject(selected: GameObject, pointer: BaseEventData): void;
	SetSelectedGameObject(selected: GameObject | undefined): void;
	ToString(): string;
	UpdateModules(): void;
	ClearSelected(): void;
}

interface EventSystemConstructor {
	current: EventSystem;
	SetUITookitEventSystemOverride(
		activeEventSystem: EventSystem,
		sendEvents: boolean,
		createPanelGameObjectsOnStart: boolean,
	): void;
}
declare const EventSystem: EventSystemConstructor;

interface ApplicationConstructor {
	OnFocusChanged(callback: (focused: boolean) => void): void;
}

interface EntityAnimationEvents {
	EntityEventKey: number;
	OnEntityAnimationEvent(callback: (key: EntityAnimationEventKey) => void): EngineEventConnection;
}

interface Animator {
	SetInteger(name: string, value: number): void;
	SetInteger(id: number, value: number): void;
}

interface Matrix4x4 {
	m00: number;
	m10: number;
	m20: number;
	m30: number;
	m01: number;
	m11: number;
	m21: number;
	m31: number;
	m02: number;
	m12: number;
	m22: number;
	m32: number;
	m03: number;
	m13: number;
	m23: number;
	m33: number;
	rotation: Quaternion;
	lossyScale: Vector3;
	isIdentity: boolean;
	determinant: number;
	decomposeProjection: FrustumPlanes;
	inverse: Matrix4x4;
	transpose: Matrix4x4;

	GetColumn(index: number): Vector4;
	GetPosition(): Vector3;
	GetRow(index: number): Vector4;
	MultiplyPoint(point: Vector3): Vector3;
	MultiplyPoint3x4(point: Vector3): Vector3;
	MultiplyVector(vector: Vector3): Vector3;
	SetColumn(index: number, column: Vector4): void;
	SetRow(index: number, row: Vector4): void;
	SetTRS(pos: Vector3, q: Quaternion, s: Vector3): void;
	TransformPlane(plane: Plane): Plane;
	ValidTRS(): boolean;
}

interface Matrix4x4Constructor {
	zero: Matrix4x4;
	identity: Matrix4x4;

	Determinant(m: Matrix4x4): number;
	Frustum(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): Matrix4x4;
	Frustum(fp: FrustumPlanes): Matrix4x4;
	Inverse(m: Matrix4x4): Matrix4x4;
	Inverse3DAffine(input: Matrix4x4, result: unknown): boolean;
	LookAt(from: Vector3, to: Vector3, up: Vector3): Matrix4x4;
	Ortho(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): Matrix4x4;
	Perspective(fov: number, aspect: number, zNear: number, zFar: number): Matrix4x4;
	Rotate(q: Quaternion): Matrix4x4;
	Scale(vector: Vector3): Matrix4x4;
	Translate(vector: Vector3): Matrix4x4;
	Transpose(m: Matrix4x4): Matrix4x4;
	TRS(pos: Vector3, q: Quaternion, s: Vector3): Matrix4x4;

	new (): Matrix4x4;
	new (column0: Vector4, column1: Vector4, column2: Vector4, column3: Vector4): Matrix4x4;
}
declare const Matrix4x4: Matrix4x4Constructor;

interface Transform extends Component, Iterable<Transform> {
	/**
	 * The world space position of the Transform.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-position.html | Transform.position}
	 */
	position: Vector3;
	/**
	 * Position of the transform relative to the parent transform.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-localPosition.html | Transform.localPosition}
	 */
	localPosition: Vector3;
	/**
	 * The rotation as Euler angles in degrees.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-eulerAngles.html | Transform.eulerAngles}
	 */
	eulerAngles: Vector3;
	/**
	 * The rotation as Euler angles in degrees relative to the parent transform's rotation.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-localEulerAngles.html | Transform.localEulerAngles}
	 */
	localEulerAngles: Vector3;
	/**
	 * The red axis of the transform in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-right.html | Transform.right}
	 */
	right: Vector3;
	/**
	 * The green axis of the transform in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-up.html | Transform.up}
	 */
	up: Vector3;
	/**
	 * Returns a normalized vector representing the blue axis of the transform in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-forward.html | Transform.forward}
	 */
	forward: Vector3;
	/**
	 * A Quaternion that stores the rotation of the Transform in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-rotation.html | Transform.rotation}
	 */
	rotation: Quaternion;
	/**
	 * The rotation of the transform relative to the transform rotation of the parent.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-localRotation.html | Transform.localRotation}
	 */
	localRotation: Quaternion;
	/**
	 * The scale of the transform relative to the GameObjects parent.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-localScale.html | Transform.localScale}
	 */
	localScale: Vector3;
	/**
	 * The parent of the transform.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-parent.html | Transform.parent}
	 */
	parent: Transform;
	/**
	 * Matrix that transforms a point from world space into local space (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-worldToLocalMatrix.html | Transform.worldToLocalMatrix}
	 */
	readonly worldToLocalMatrix: Matrix4x4;
	/**
	 * Matrix that transforms a point from local space into world space (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-localToWorldMatrix.html | Transform.localToWorldMatrix}
	 */
	readonly localToWorldMatrix: Matrix4x4;
	/**
	 * Returns the topmost transform in the hierarchy.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-root.html | Transform.root}
	 */
	readonly root: Transform;
	/**
	 * The number of children the parent Transform has.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-childCount.html | Transform.childCount}
	 */
	readonly childCount: number;
	/**
	 * The global scale of the object (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-lossyScale.html | Transform.lossyScale}
	 */
	readonly lossyScale: Vector3;
	/**
	 * Has the transform changed since the last time the flag was set to 'false'?
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-hasChanged.html | Transform.hasChanged}
	 */
	hasChanged: boolean;
	/**
	 * The transform capacity of the transform's hierarchy data structure.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-hierarchyCapacity.html | Transform.hierarchyCapacity}
	 */
	hierarchyCapacity: number;
	/**
	 * The number of transforms in the transform's hierarchy data structure.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform-hierarchyCount.html | Transform.hierarchyCount}
	 */
	readonly hierarchyCount: number;

	/**
	 * Unparents all children.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.DetachChildren.html | Transform.DetachChildren}
	 */
	DetachChildren(): void;
	/**
	 * Finds a child by name n and returns it.
	 * @param n The search string, either the name of an immediate child or a hierarchy path for finding a descendent.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Find.html | Transform.Find}
	 */
	Find(n: string): Transform;
	FindChild(n: string): Transform;
	/**
	 * Returns a transform child by index.
	 * @param index Index of the child transform to return. Must be smaller than Transform.childCount.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.GetChild.html | Transform.GetChild}
	 */
	GetChild(index: number): Transform;
	GetChildCount(): number;
	GetEnumerator(): unknown;
	/**
	 * Gets the position and rotation of the Transform component in local space (that is, relative to its parent transform).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.GetLocalPositionAndRotation.html | Transform.GetLocalPositionAndRotation}
	 */
	GetLocalPositionAndRotation(localPosition: unknown, localRotation: unknown): void;
	/**
	 * Gets the position and rotation of the Transform component in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.GetPositionAndRotation.html | Transform.GetPositionAndRotation}
	 */
	GetPositionAndRotation(position: unknown, rotation: unknown): void;
	/**
	 * Gets the sibling index.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.GetSiblingIndex.html | Transform.GetSiblingIndex}
	 */
	GetSiblingIndex(): number;
	/**
	 * Transforms a direction from world space to local space. The opposite of Transform.TransformDirection.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformDirection.html | Transform.InverseTransformDirection}
	 */
	InverseTransformDirection(direction: Vector3): Vector3;
	/**
	 * Transforms the direction x, y, z from world space to local space. The opposite of Transform.TransformDirection.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformDirection.html | Transform.InverseTransformDirection}
	 */
	InverseTransformDirection(x: number, y: number, z: number): Vector3;
	InverseTransformDirections(directions: unknown, transformedDirections: unknown): void;
	InverseTransformDirections(directions: unknown): void;
	/**
	 * Transforms position from world space to local space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformPoint.html | Transform.InverseTransformPoint}
	 */
	InverseTransformPoint(position: Vector3): Vector3;
	/**
	 * Transforms the position x, y, z from world space to local space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformPoint.html | Transform.InverseTransformPoint}
	 */
	InverseTransformPoint(x: number, y: number, z: number): Vector3;
	InverseTransformPoints(positions: unknown, transformedPositions: unknown): void;
	InverseTransformPoints(positions: unknown): void;
	/**
	 * Transforms a vector from world space to local space. The opposite of Transform.TransformVector.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformVector.html | Transform.InverseTransformVector}
	 */
	InverseTransformVector(vector: Vector3): Vector3;
	/**
	 * Transforms the vector x, y, z from world space to local space. The opposite of Transform.TransformVector.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.InverseTransformVector.html | Transform.InverseTransformVector}
	 */
	InverseTransformVector(x: number, y: number, z: number): Vector3;
	InverseTransformVectors(vectors: unknown, transformedVectors: unknown): void;
	InverseTransformVectors(vectors: unknown): void;
	/**
	 * Is this transform a child of parent?
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.IsChildOf.html | Transform.IsChildOf}
	 */
	IsChildOf(parent: Transform): boolean;
	/**
	 * Rotates the transform so the forward vector points at target's current position.
	 * @param target Object to point towards.
	 * @param worldUp Vector specifying the upward direction.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.LookAt.html | Transform.LookAt}
	 */
	LookAt(target: Transform, worldUp: Vector3): void;
	/**
	 * Rotates the transform so the forward vector points at target's current position.
	 * @param target Object to point towards.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.LookAt.html | Transform.LookAt}
	 */
	LookAt(target: Transform): void;
	/**
	 * Rotates the transform so the forward vector points at worldPosition.
	 * @param worldPosition Point to look at.
	 * @param worldUp Vector specifying the upward direction.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.LookAt.html | Transform.LookAt}
	 */
	LookAt(worldPosition: Vector3, worldUp: Vector3): void;
	/**
	 * Rotates the transform so the forward vector points at worldPosition.
	 * @param worldPosition Point to look at.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.LookAt.html | Transform.LookAt}
	 */
	LookAt(worldPosition: Vector3): void;
	/**
	 * Applies a rotation of eulerAngles.z degrees around the z-axis, eulerAngles.x degrees around the x-axis, and eulerAngles.y degrees around the y-axis (in that order).
	 * @param eulers The rotation to apply in euler angles.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	Rotate(eulers: Vector3): void;
	/**
	 * The implementation of this method applies a rotation of zAngle degrees around the z axis, xAngle degrees around the x axis, and yAngle degrees around the y axis (in that order).
	 * @param xAngle Degrees to rotate the GameObject around the X axis.
	 * @param yAngle Degrees to rotate the GameObject around the Y axis.
	 * @param zAngle Degrees to rotate the GameObject around the Z axis.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	Rotate(xAngle: number, yAngle: number, zAngle: number): void;
	/**
	 * Rotates the object around the given axis by the number of degrees defined by the given angle.
	 * @param axis The axis to apply rotation to.
	 * @param angle The degrees of rotation to apply.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	Rotate(axis: Vector3, angle: number): void;
	/**
	 * Rotates the transform about axis passing through point in world coordinates by angle degrees.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.RotateAround.html | Transform.RotateAround}
	 */
	RotateAround(point: Vector3, axis: Vector3, angle: number): void;
	RotateAround(axis: Vector3, angle: number): void;
	RotateAroundLocal(axis: Vector3, angle: number): void;
	/**
	 * Applies a rotation of eulerAngles.z degrees around the z-axis, eulerAngles.x degrees around the x-axis, and eulerAngles.y degrees around the y-axis (in that order).
	 * @param eulers The rotation to apply in euler angles.
	 * @param relativeTo Determines whether to rotate the GameObject either locally to  the GameObject or relative to the Scene in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	RotateRelativeTo(eulers: Vector3, relativeTo: Space): void;
	/**
	 * The implementation of this method applies a rotation of zAngle degrees around the z axis, xAngle degrees around the x axis, and yAngle degrees around the y axis (in that order).
	 * @param xAngle Degrees to rotate the GameObject around the X axis.
	 * @param yAngle Degrees to rotate the GameObject around the Y axis.
	 * @param zAngle Degrees to rotate the GameObject around the Z axis.
	 * @param relativeTo Determines whether to rotate the GameObject either locally to the GameObject or relative to the Scene in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	RotateRelativeTo(xAngle: number, yAngle: number, zAngle: number, relativeTo: Space): void;
	/**
	 * Rotates the object around the given axis by the number of degrees defined by the given angle.
	 * @param axis The axis to apply rotation to.
	 * @param angle The degrees of rotation to apply.
	 * @param relativeTo Determines whether to rotate the GameObject either locally to the GameObject or relative to the Scene in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Rotate.html | Transform.Rotate}
	 */
	RotateRelativeTo(axis: Vector3, angle: number, relativeTo: Space): void;
	/**
	 * Move the transform to the start of the local transform list.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetAsFirstSibling.html | Transform.SetAsFirstSibling}
	 */
	SetAsFirstSibling(): void;
	/**
	 * Move the transform to the end of the local transform list.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetAsLastSibling.html | Transform.SetAsLastSibling}
	 */
	SetAsLastSibling(): void;
	/**
	 * Sets the position and rotation of the Transform component in local space (i.e. relative to its parent transform).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetLocalPositionAndRotation.html | Transform.SetLocalPositionAndRotation}
	 */
	SetLocalPositionAndRotation(localPosition: Vector3, localRotation: Quaternion): void;
	/**
	 * Set the parent of the transform.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetParent.html | Transform.SetParent}
	 */
	SetParent(p: Transform): void;
	/**
	 * Set the parent of the transform.
	 * @param parent The parent Transform to use.
	 * @param worldPositionStays If true, the parent-relative position, scale and rotation are modified such that the object keeps the same world space position, rotation and scale as before.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetParent.html | Transform.SetParent}
	 */
	SetParent(parent: Transform, worldPositionStays: boolean): void;
	/**
	 * Sets the world space position and rotation of the Transform component.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetPositionAndRotation.html | Transform.SetPositionAndRotation}
	 */
	SetPositionAndRotation(position: Vector3, rotation: Quaternion): void;
	/**
	 * Sets the sibling index.
	 * @param index Index to set.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.SetSiblingIndex.html | Transform.SetSiblingIndex}
	 */
	SetSiblingIndex(index: number): void;
	/**
	 * Transforms direction from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformDirection.html | Transform.TransformDirection}
	 */
	TransformDirection(direction: Vector3): Vector3;
	/**
	 * Transforms direction x, y, z from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformDirection.html | Transform.TransformDirection}
	 */
	TransformDirection(x: number, y: number, z: number): Vector3;
	TransformDirections(directions: unknown, transformedDirections: unknown): void;
	TransformDirections(directions: unknown): void;
	/**
	 * Transforms position from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformPoint.html | Transform.TransformPoint}
	 */
	TransformPoint(position: Vector3): Vector3;
	/**
	 * Transforms the position x, y, z from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformPoint.html | Transform.TransformPoint}
	 */
	TransformPoint(x: number, y: number, z: number): Vector3;
	TransformPoints(positions: unknown, transformedPositions: unknown): void;
	TransformPoints(positions: unknown): void;
	/**
	 * Transforms vector from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformVector.html | Transform.TransformVector}
	 */
	TransformVector(vector: Vector3): Vector3;
	/**
	 * Transforms vector x, y, z from local space to world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.TransformVector.html | Transform.TransformVector}
	 */
	TransformVector(x: number, y: number, z: number): Vector3;
	TransformVectors(vectors: unknown, transformedVectors: unknown): void;
	TransformVectors(vectors: unknown): void;
	/**
	 * Moves the transform in the direction and distance of translation.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(translation: Vector3, relativeTo: Space): void;
	/**
	 * Moves the transform in the direction and distance of translation.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(translation: Vector3): void;
	/**
	 * Moves the transform by x along the x axis, y along the y axis, and z along the z axis.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(x: number, y: number, z: number, relativeTo: Space): void;
	/**
	 * Moves the transform by x along the x axis, y along the y axis, and z along the z axis.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(x: number, y: number, z: number): void;
	/**
	 * Moves the transform in the direction and distance of translation.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(translation: Vector3, relativeTo: Transform): void;
	/**
	 * Moves the transform by x along the x axis, y along the y axis, and z along the z axis.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/Transform.Translate.html | Transform.Translate}
	 */
	Translate(x: number, y: number, z: number, relativeTo: Transform): void;

	/**Get all descendant transforms. Does not inclue the root transform. */
	GetDescendants(): Transform[];
}

interface Collider extends Component {
	enabled: boolean;
	attachedRigidbody: Rigidbody;
	attachedArticulationBody: ArticulationBody;
	isTrigger: boolean;
	contactOffset: number;
	bounds: Bounds;
	hasModifiableContacts: boolean;
	sharedMaterial: PhysicMaterial;
	material: PhysicMaterial;

	constructor(): Collider;

	ClosestPoint(position: Vector3): Vector3;
	ClosestPointOnBounds(position: Vector3): Vector3;
	Raycast(ray: Ray, maxDistance: number): RaycastHit | undefined;
}

interface MaterialPropertyBlockConstructor {
	new (): MaterialPropertyBlock;
}
declare const MaterialPropertyBlock: MaterialPropertyBlockConstructor;

interface CloudImage {
	/**
	 * Fired when the remote image has finished downloading (or has failed).
	 * @param callback
	 */
	OnFinishedLoading(callback: (success: boolean) => void): EngineEventConnection;
}

interface NavMesh {}

interface NavMeshConstructor {
	AllAreas: number;
	onPreUpdate: OnNavMeshPreUpdate;
	avoidancePredictionTime: number;
	pathfindingIterationsPerFrame: number;

	AddLink(link: NavMeshLinkData): NavMeshLinkInstance;
	AddLink(link: NavMeshLinkData, position: Vector3, rotation: Quaternion): NavMeshLinkInstance;
	AddNavMeshData(navMeshData: NavMeshData): NavMeshDataInstance;
	AddNavMeshData(navMeshData: NavMeshData, position: Vector3, rotation: Quaternion): NavMeshDataInstance;
	AddOffMeshLinks(): void;
	CalculatePath(sourcePosition: Vector3, targetPosition: Vector3, areaMask: number, path: NavMeshPath): boolean;
	CalculatePath(
		sourcePosition: Vector3,
		targetPosition: Vector3,
		filter: NavMeshQueryFilter,
		path: NavMeshPath,
	): boolean;
	CalculateTriangulation(): NavMeshTriangulation;
	CreateSettings(): NavMeshBuildSettings;
	FindClosestEdge(sourcePosition: Vector3, areaMask: number): NavMeshHit | undefined;
	// FindClosestEdge(sourcePosition: Vector3, hit: unknown, filter: NavMeshQueryFilter): boolean;
	GetAreaCost(areaIndex: number): number;
	GetAreaFromName(areaName: string): number;
	GetLayerCost(layer: number): number;
	GetLinkOwner(handle: NavMeshLinkInstance): Object;
	GetNavMeshLayerFromName(layerName: string): number;
	GetSettingsByID(agentTypeID: number): NavMeshBuildSettings;
	GetSettingsByIndex(index: number): NavMeshBuildSettings;
	GetSettingsCount(): number;
	GetSettingsNameFromID(agentTypeID: number): string;
	IsLinkActive(handle: NavMeshLinkInstance): boolean;
	IsLinkOccupied(handle: NavMeshLinkInstance): boolean;
	IsLinkValid(handle: NavMeshLinkInstance): boolean;
	Raycast(sourcePosition: Vector3, targetPosition: Vector3, areaMask: number): NavMeshHit | undefined;
	// Raycast(sourcePosition: Vector3, targetPosition: Vector3, hit: unknown, filter: NavMeshQueryFilter): boolean;
	RemoveAllNavMeshData(): void;
	RemoveLink(handle: NavMeshLinkInstance): void;
	RemoveNavMeshData(handle: NavMeshDataInstance): void;
	RemoveSettings(agentTypeID: number): void;
	RestoreNavMesh(): void;
	SamplePosition(sourcePosition: Vector3, maxDistance: number, areaMask: number): NavMeshHit | undefined;
	// SamplePosition(sourcePosition: Vector3, hit: unknown, maxDistance: number, filter: NavMeshQueryFilter): boolean;
	SetAreaCost(areaIndex: number, cost: number): void;
	SetLayerCost(layer: number, cost: number): void;
	SetLinkActive(handle: NavMeshLinkInstance, value: boolean): void;
	SetLinkOwner(handle: NavMeshLinkInstance, owner: Object): void;
	Triangulate(vertices: Vector3[], indices: number[]): void;
}
declare const NavMesh: NavMeshConstructor;

declare const Entry: EntryConstructor;

interface TwoBoneIKConstraint extends MonoBehaviour {
	// data: {
	// 	hint: Transform;
	// 	target: Transform;
	// 	root: Transform;
	// 	mid: Transform;
	// 	tip: Transform;
	// };
}

interface TwoBoneIKConstraintConstructor {
	new (): TwoBoneIKConstraint;
}
declare const TwoBoneIKConstraint: TwoBoneIKConstraintConstructor;

interface MultiAimConstraint {}

interface MultiAimConstraintConstructor {
	new (): MultiAimConstraint;
}
declare const MultiAimConstraint: MultiAimConstraintConstructor;

interface Random {
	/** Generates a random integer between `min` and `max`, both inclusive. */
	Int(min: number, max: number): number;

	/** Generates a random number between `min` and `max`, both inclusive. */
	Number(min: number, max: number): number;

	/** Generates a random number between `0` and `max`, both inclusive. */
	Number(max: number): number;

	/** Generates a random number between `0` and `1`. */
	Number(): number;

	/** Generates a random unit vector. */
	UnitVector3(): Vector3;

	/** Generates a random unit vector. */
	UnitVector2(): Vector2;

	/** Returns a random item in the given array. */
	/**
	 * Returns a random item in the given array.
	 *
	 * ```ts
	 * const items = ["Pencil", "Pen", "Feather"];
	 * const [item, index] = rng.PickItem(items);
	 * ```
	 */
	PickItem<T>(tbl: T[]): LuaTuple<[value: T, index: number]>;

	/**
	 * Returns a random item in the given array, using the given weights.
	 * Weights must be >= 0.
	 *
	 * Note: This function heavily optimizes for immutable weights, so
	 * always call `table.freeze` on the weights array after its creation.
	 *
	 * ```ts
	 * const items = ["Leather Hat", "Golden Bat", "Diamond Glove"];
	 * const weights = table.freeze([15, 5, 2.5]);
	 * const [randomItem, index] = rng.PickItemWeighted(items, weights);
	 * ```
	 */
	PickItemWeighted<T>(tbl: T[], weights: readonly number[]): LuaTuple<[value: T, index: number]>;

	/** Shuffles the given array in-place. This uses the Fisher-Yates algorithm. */
	ShuffleArray<T>(tbl: T[]): T[];

	/** Creates a new Random generator with the current state of this generator. */
	Clone(): Random;
}
interface RandomConstructor {
	/**
	 * Construct a new Random generator. The given seed will be
	 * converted to an unsigned integer.
	 */
	new (seed: number): Random;

	/**
	 * Construct a new Random generator. The seed is chosen from an
	 * internal entropy source.
	 */
	new (): Random;
}
declare const Random: RandomConstructor;

interface VolumeProfile extends ScriptableObject {
	components: VolumeComponent[];
	isDirty: boolean;

	// Add<T>(overrides: boolean): T;
	// Add(type: unknown, overrides: boolean): VolumeComponent;
	// GetHashCode(): number;
	// Has<T>(): boolean;
	// Has(type: unknown): boolean;
	// HasSubclassOf(type: unknown): boolean;
	// Remove<T>(): void;
	// Remove(type: unknown): void;
	Reset(): void;
	// Get<T>(component: T): T | undefined;
	GetDepthOfField(): DepthOfField | undefined;
	GetVolumeComponents(): VolumeComponent[];
}

interface VolumeProfileConstructor {
	new (): VolumeProfile;
}
declare const VolumeProfile: VolumeProfileConstructor;

interface GradientConstructor {
	/**
	 * Creates a C# array of `GradientColorKey`
	 * @param length The size of the array
	 */
	CreateColorKeyArray(length: number): GradientColorKey[];
	/**
	 * Creates a C# array of `GradientAlphaKey`
	 * @param length The size of the array
	 */
	CreateAlphaKeyArray(length: number): GradientAlphaKey[];
}

interface Mathf {}

interface MathfConstructor {
	/** @deprecated Use `math.pi` instead. */
	PI: number;
	/** @deprecated Use `math.huge` instead. */
	Infinity: number;
	/** @deprecated Use `-math.huge` instead. */
	NegativeInfinity: number;
	/** @deprecated Use `math.deg()` instead. */
	Deg2Rad: number;
	/** @deprecated Use `math.rad()` instead. */
	Rad2Deg: number;
	readonly Epsilon: number;

	/** @deprecated Use `math.abs()` instead. */
	Abs(f: number): number;
	/** @deprecated Use `math.acos()` instead. */
	Acos(f: number): number;
	/** @deprecated Use `math.approximately()` instead. */
	Approximately(a: number, b: number): boolean;
	/** @deprecated Use `math.asin()` instead. */
	Asin(f: number): number;
	/** @deprecated Use `math.atan()` instead. */
	Atan(f: number): number;
	/** @deprecated Use `math.atan2()` instead. */
	Atan2(y: number, x: number): number;
	/** @deprecated Use `math.ceil()` instead. */
	Ceil(f: number): number;
	/** @deprecated Use `math.ceil()` instead. */
	CeilToInt(f: number): number;
	/** @deprecated Use `math.clamp()` instead. */
	Clamp(value: number, min: number, max: number): number;
	/** @deprecated Use `math.clamp01()` instead. */
	Clamp01(value: number): number;
	/** @deprecated Use `math.closestPowerOfTwo()` instead. */
	ClosestPowerOfTwo(value: number): number;
	CorrelatedColorTemperatureToRGB(kelvin: number): Color;
	/** @deprecated Use `math.cos()` instead. */
	Cos(f: number): number;
	/** @deprecated Use `math.deltaAngle()` instead. */
	DeltaAngle(current: number, target: number): number;
	/** @deprecated Use `math.exp()` instead. */
	Exp(power: number): number;
	/** @deprecated Use `math.floor()` instead. */
	Floor(f: number): number;
	Gamma(value: number, absmax: number, gamma: number): number;
	GammaToLinearSpace(value: number): number;
	/** @deprecated Use `math.inverseLerp()` instead. */
	InverseLerp(a: number, b: number, value: number): number;
	/** @deprecated Use `math.isPowerOfTwo()` instead. */
	IsPowerOfTwo(value: number): boolean;
	/** @deprecated Use `math.lerp()` instead. */
	Lerp(a: number, b: number, t: number): number;
	LerpAngle(a: number, b: number, t: number): number;
	/** @deprecated Use `math.lerpUnclamped()` instead. */
	LerpUnclamped(a: number, b: number, t: number): number;
	LinearToGammaSpace(value: number): number;
	/** @deprecated Use `math.log()` instead. */
	Log(f: number, p: number): number;
	/** @deprecated Use `math.log()` instead. */
	Log(f: number): number;
	/** @deprecated Use `math.log10()` instead. */
	Log10(f: number): number;
	/** @deprecated Use `math.max()` instead. */
	Max(a: number, b: number): number;
	/** @deprecated Use `math.min()` instead. */
	Min(a: number, b: number): number;
	/** @deprecated Use `math.moveTowards()` instead. */
	MoveTowards(current: number, target: number, maxDelta: number): number;
	/** @deprecated Use `math.moveTowardsAngle()` instead. */
	MoveTowardsAngle(current: number, target: number, maxDelta: number): number;
	/** @deprecated Use `math.log()` instead. */
	NextPowerOfTwo(value: number): number;
	/** @deprecated Use `math.noise()` instead. */
	PerlinNoise(x: number, y: number): number;
	/** @deprecated Use `math.noise()` instead. */
	PerlinNoise1D(x: number): number;
	/** @deprecated Use `math.pingPong()` instead. */
	PingPong(t: number, length: number): number;
	/** @deprecated Use `math.pow()` instead. */
	Pow(f: number, p: number): number;
	/** @deprecated Use `math.repeat()` instead. */
	Repeat(t: number, length: number): number;
	/** @deprecated Use `math.round()` instead. */
	Round(f: number): number;
	/** @deprecated Use `math.sign()` instead. */
	Sign(f: number): number;
	/** @deprecated Use `math.sin()` instead. */
	Sin(f: number): number;
	SmoothDamp(current: number, target: number, currentVelocity: unknown, smoothTime: number, maxSpeed: number): number;
	SmoothDamp(current: number, target: number, currentVelocity: unknown, smoothTime: number): number;
	SmoothDamp(
		current: number,
		target: number,
		currentVelocity: unknown,
		smoothTime: number,
		maxSpeed: number,
		deltaTime: number,
	): number;
	SmoothDampAngle(
		current: number,
		target: number,
		currentVelocity: unknown,
		smoothTime: number,
		maxSpeed: number,
	): number;
	SmoothDampAngle(current: number, target: number, currentVelocity: unknown, smoothTime: number): number;
	SmoothDampAngle(
		current: number,
		target: number,
		currentVelocity: unknown,
		smoothTime: number,
		maxSpeed: number,
		deltaTime: number,
	): number;
	/** @deprecated Use `math.smoothStep()` instead. */
	SmoothStep(from: number, to: number, t: number): number;
	/** @deprecated Use `math.sqrt()` instead. */
	Sqrt(f: number): number;
	/** @deprecated Use `math.tan()` instead. */
	Tan(f: number): number;
}
declare const Mathf: MathfConstructor;

interface MonoBehaviour extends Behaviour {
	/**
	 * Cancellation token raised when the MonoBehaviour is destroyed (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour-destroyCancellationToken.html | MonoBehaviour.destroyCancellationToken}
	 */
	readonly destroyCancellationToken: unknown;
	/**
	 * Disabling this lets you skip the GUI layout phase.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour-useGUILayout.html | MonoBehaviour.useGUILayout}
	 */
	useGUILayout: boolean;
	/**
	 * Returns a boolean value which represents if Start was called.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour-didStart.html | MonoBehaviour.didStart}
	 */
	readonly didStart: boolean;
	/**
	 * Returns a boolean value which represents if Awake was called.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour-didAwake.html | MonoBehaviour.didAwake}
	 */
	readonly didAwake: boolean;
	// /**
	//  * Allow a specific instance of a MonoBehaviour to run in edit mode (only available in the editor).
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour-runInEditMode.html | MonoBehaviour.runInEditMode}
	//  */
	// runInEditMode: boolean;

	// /**
	//  * Cancels all Invoke calls on this MonoBehaviour.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.CancelInvoke.html | MonoBehaviour.CancelInvoke}
	//  */
	// CancelInvoke(): void;
	// /**
	//  * Cancels all Invoke calls with name methodName on this behaviour.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.CancelInvoke.html | MonoBehaviour.CancelInvoke}
	//  */
	// CancelInvoke(methodName: string): void;
	// /**
	//  * Invokes the method methodName in time seconds.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.Invoke.html | MonoBehaviour.Invoke}
	//  */
	// Invoke(methodName: string, time: number): void;
	// /**
	//  * Invokes the method methodName in time seconds, then repeatedly every repeatRate seconds.
	//  * @param methodName The name of a method to invoke.
	//  * @param time Start invoking after n seconds.
	//  * @param repeatRate Repeat every n seconds.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.InvokeRepeating.html | MonoBehaviour.InvokeRepeating}
	//  */
	// InvokeRepeating(methodName: string, time: number, repeatRate: number): void;
	// /**
	//  * Is any invoke pending on this MonoBehaviour?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.IsInvoking.html | MonoBehaviour.IsInvoking}
	//  */
	// IsInvoking(): boolean;
	// /**
	//  * Is any invoke on methodName pending?
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.IsInvoking.html | MonoBehaviour.IsInvoking}
	//  */
	// IsInvoking(methodName: string): boolean;
	// /**
	//  * Starts a coroutine named methodName.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html | MonoBehaviour.StartCoroutine}
	//  */
	// StartCoroutine(methodName: string): Coroutine;
	// /**
	//  * Starts a coroutine named methodName.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html | MonoBehaviour.StartCoroutine}
	//  */
	// StartCoroutine(methodName: string, value: unknown): Coroutine;
	// /**
	//  * Starts a Coroutine.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html | MonoBehaviour.StartCoroutine}
	//  */
	// StartCoroutine(routine: unknown): Coroutine;
	// /**
	//  * Stops all coroutines running on this behaviour.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopAllCoroutines.html | MonoBehaviour.StopAllCoroutines}
	//  */
	// StopAllCoroutines(): void;
	// /**
	//  * Stops the first coroutine named methodName, or the coroutine stored in routine running on this behaviour.
	//  * @param routine Name of the function in code, including coroutines.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopCoroutine.html | MonoBehaviour.StopCoroutine}
	//  */
	// StopCoroutine(routine: unknown): void;
	// /**
	//  * Stops the first coroutine named methodName, or the coroutine stored in routine running on this behaviour.
	//  * @param routine Name of the function in code, including coroutines.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopCoroutine.html | MonoBehaviour.StopCoroutine}
	//  */
	// StopCoroutine(routine: Coroutine): void;
	// /**
	//  * Stops the first coroutine named methodName, or the coroutine stored in routine running on this behaviour.
	//  * @param methodName Name of coroutine.
	//  *
	//  * More info: {@link https://docs.unity3d.com/ScriptReference/MonoBehaviour.StopCoroutine.html | MonoBehaviour.StopCoroutine}
	//  */
	// StopCoroutine(methodName: string): void;
}

interface MonoBehaviourConstructor {
	new (): MonoBehaviour;

	print(message: unknown): void;
}
declare const MonoBehaviour: MonoBehaviourConstructor;

interface WheelFrictionCurveStatic {
	new (): WheelFrictionCurve;
}
declare const WheelFrictionCurve: WheelFrictionCurveStatic;

interface WheelCollider extends Collider {
	/**
	 * The center of the wheel, measured in the object's local space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-center.html | WheelCollider.center}
	 */
	center: Vector3;
	/**
	 * The radius of the wheel, measured in local space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-radius.html | WheelCollider.radius}
	 */
	radius: number;
	/**
	 * Maximum extension distance of wheel suspension, measured in local space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-suspensionDistance.html | WheelCollider.suspensionDistance}
	 */
	suspensionDistance: number;
	/**
	 * The parameters of wheel's suspension. The suspension attempts to reach a target position by applying a linear force and a damping force.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-suspensionSpring.html | WheelCollider.suspensionSpring}
	 */
	suspensionSpring: JointSpring;
	/**
	 * Limits the expansion velocity of the Wheel Collider's suspension. If you set this property on a Rigidbody that has several Wheel Colliders, such as a vehicle, then it affects all other Wheel Colliders on the Rigidbody.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-suspensionExpansionLimited.html | WheelCollider.suspensionExpansionLimited}
	 */
	suspensionExpansionLimited: boolean;
	/**
	 * Application point of the suspension and tire forces measured from the base of the resting wheel.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-forceAppPointDistance.html | WheelCollider.forceAppPointDistance}
	 */
	forceAppPointDistance: number;
	/**
	 * The mass of the wheel, expressed in kilograms. Must be larger than zero. Typical values would be in range (20,80).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-mass.html | WheelCollider.mass}
	 */
	mass: number;
	/**
	 * The damping rate of the wheel. Must be larger than zero.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-wheelDampingRate.html | WheelCollider.wheelDampingRate}
	 */
	wheelDampingRate: number;
	/**
	 * Properties of tire friction in the direction the wheel is pointing in.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-forwardFriction.html | WheelCollider.forwardFriction}
	 */
	forwardFriction: WheelFrictionCurve;
	/**
	 * Properties of tire friction in the sideways direction.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-sidewaysFriction.html | WheelCollider.sidewaysFriction}
	 */
	sidewaysFriction: WheelFrictionCurve;
	/**
	 * Motor torque on the wheel axle expressed in Newton metres. Positive or negative depending on direction.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-motorTorque.html | WheelCollider.motorTorque}
	 */
	motorTorque: number;
	/**
	 * Brake torque expressed in Newton metres.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-brakeTorque.html | WheelCollider.brakeTorque}
	 */
	brakeTorque: number;
	/**
	 * Steering angle in degrees, always around the local y-axis.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-steerAngle.html | WheelCollider.steerAngle}
	 */
	steerAngle: number;
	/**
	 * Indicates whether the wheel currently collides with something (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-isGrounded.html | WheelCollider.isGrounded}
	 */
	readonly isGrounded: boolean;
	/**
	 * Current wheel axle rotation speed, in rotations per minute (Read Only).
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-rpm.html | WheelCollider.rpm}
	 */
	readonly rpm: number;
	/**
	 * The mass supported by this WheelCollider.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-sprungMass.html | WheelCollider.sprungMass}
	 */
	sprungMass: number;
	/**
	 * Rotation speed of the wheel, measured in degrees per second.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider-rotationSpeed.html | WheelCollider.rotationSpeed}
	 */
	rotationSpeed: number;

	/**
	 * Configure vehicle sub-stepping parameters.
	 * @param speedThreshold The speed threshold of the sub-stepping algorithm.
	 * @param stepsBelowThreshold Amount of simulation sub-steps when vehicle's speed is below speedThreshold.
	 * @param stepsAboveThreshold Amount of simulation sub-steps when vehicle's speed is above speedThreshold.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider.ConfigureVehicleSubsteps.html | WheelCollider.ConfigureVehicleSubsteps}
	 */
	ConfigureVehicleSubsteps(speedThreshold: number, stepsBelowThreshold: number, stepsAboveThreshold: number): void;
	/**
	 * Gets ground collision data for the wheel.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider.GetGroundHit.html | WheelCollider.GetGroundHit}
	 */
	GetGroundHit(): WheelHit | undefined;
	/**
	 * Gets the world space pose of the wheel accounting for ground contact, suspension limits, steer angle, and rotation angle (angles in degrees).
	 *
	 * pos: Position of the wheel in world space.
	 * quat: Rotation of the wheel in world space.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider.GetWorldPose.html | WheelCollider.GetWorldPose}
	 */
	GetWorldPose(): LuaTuple<[pos: Position, quat: Quaternion]>;
	/**
	 * Reset the sprung masses of the vehicle.
	 *
	 * More info: {@link https://docs.unity3d.com/ScriptReference/WheelCollider.ResetSprungMasses.html | WheelCollider.ResetSprungMasses}
	 */
	ResetSprungMasses(): void;
}
