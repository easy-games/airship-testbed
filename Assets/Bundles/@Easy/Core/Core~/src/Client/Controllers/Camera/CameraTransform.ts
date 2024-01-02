/**
 * Unique class for holding the position and rotation of the camera. Used by `CameraMode` classes.
 */
export class CameraTransform {
	public static readonly Identity = new CameraTransform();

	/** The position of the camera in 3D world space. */
	public readonly Position: Vector3;

	/** The rotation of the camera in 3D world space. */
	public readonly Rotation: Quaternion;

	public static FromTransform(transform: Transform) {
		return new CameraTransform(transform.position, transform.rotation);
	}

	constructor(position?: Vector3, rotation?: Quaternion) {
		this.Position = position !== undefined ? position : Vector3.zero;
		this.Rotation = rotation !== undefined ? rotation : Quaternion.identity;
	}

	public Lerp(other: CameraTransform, alpha: number): CameraTransform {
		const position = this.Position.Lerp(other.Position, alpha);
		const rotation = Quaternion.Slerp(this.Rotation, other.Rotation, alpha);
		return new CameraTransform(position, rotation);
	}
}
