/// <reference no-default-lib="true"/>

// MACRO MATH API

interface Vector2 {
	/** macro for `Vector2 + Vector2`. */
	add(this: Vector2, v2: Vector2): Vector2;
	/** macro for `Vector2 - Vector2`. */
	sub(this: Vector2, v2: Vector2): Vector2;
	/** macro for `Vector2 * Vector2`. | number */
	mul(this: Vector2, other: Vector2 | number): Vector2;
	/** macro for `Vector2 / Vector2`. | number */
	div(this: Vector2, other: Vector2 | number): Vector2;
}

interface Vector3 {
	/** macro for `Vector3 + Vector3`. */
	add(this: Vector3, v3: Vector3): Vector3;
	/** macro for `Vector3 - Vector3`. */
	sub(this: Vector3, v3: Vector3): Vector3;
	/** macro for `Vector3 * Vector3`. | number */
	mul(this: Vector3, other: Vector3 | number): Vector3;
	/** macro for `Vector3 / Vector3`. | number */
	div(this: Vector3, other: Vector3 | number): Vector3;
}

interface Vector4 {
	/** macro for `Vector4 + Vector4`. */
	add(this: Vector4, v4: Vector4): Vector4;
	/** macro for `Vector4 - Vector4`. */
	sub(this: Vector4, v4: Vector4): Vector4;
	/** macro for `Vector4 * Vector4`. | number */
	mul(this: Vector4, other: Vector4 | number): Vector4;
	/** macro for `Vector4 / Vector4`. | number */
	div(this: Vector4, other: Vector4 | number): Vector4;
}

interface Quaternion {
	/** macro for `Quaternion * Quaternion | Vector3`. */
	mul<T extends Quaternion | Vector3>(this: Quaternion, other: T): T;
}

interface Matrix4x4 {
	/** macro for `Matrix4x4 * Matrix4x4 | Vector4 | Vector3`. */
	mul<T extends Matrix4x4 | Vector4 | Vector3>(this: Matrix4x4, other: T): T;
}
