/**
 * Unique class for holding the position and rotation of the camera. Used by `CameraMode` classes.
 */
export class CameraTransform {
	public static readonly identity = new CameraTransform();

	/** The position of the camera in 3D world space. */
	public readonly position: Vector3;

	/** The rotation of the camera in 3D world space. */
	public readonly rotation: Quaternion;

	public static fromTransform(transform: Transform) {
		return new CameraTransform(transform.position, transform.rotation);
	}

	constructor(position?: Vector3, rotation?: Quaternion) {
		this.position = position !== undefined ? position : Vector3.zero;
		this.rotation = rotation !== undefined ? rotation : Quaternion.identity;
	}

	public Lerp(other: CameraTransform, alpha: number): CameraTransform {
		const position = this.position.Lerp(other.position, alpha);
		const rotation = Quaternion.Slerp(this.rotation, other.rotation, alpha);
		return new CameraTransform(position, rotation);
	}
}
