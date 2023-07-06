export class AlignmentUtil {
	private static up = new Vector3(0, 1, 0);
	private static down = new Vector3(0, -1, 0);
	private static right = new Vector3(1, 0, 0);
	private static left = new Vector3(-1, 0, 0);
	private static forward = new Vector3(0, 0, 1);
	private static back = new Vector3(0, 0, -1);

	public static GetWorldRotationForLookingAt(
		sourceTransform: Transform,
		forward: KnownVectorType,
		up: KnownVectorType,
		worldForward: Vector3,
		worldUp: Vector3,
	) {
		// print(`GetWorldRotationForLookingAt() sourceTransform is null?: ${sourceTransform === undefined}`);
		// print(`GetWorldRotationForLookingAt() sourceTransform.name: ${sourceTransform.name}`);

		// Find the world rotation which we want to be facing.
		let finalRotation = Quaternion.identity;
		const [success, err] = pcall(() => {
			const desiredWorldRotation = Quaternion.LookRotation(worldForward);
			//print(`GetWorldRotationForLookingAt() desiredWorldRotation: ${desiredWorldRotation}`);

			const knownWorldForward = this.GetWorldVectorFromVectorType(sourceTransform, forward);
			//print(`GetWorldRotationForLookingAt() knownWorldForward: ${knownWorldForward}`);
			const knownWorldUp = this.GetWorldVectorFromVectorType(sourceTransform, up);
			//print(`GetWorldRotationForLookingAt() knownWorldUp: ${knownWorldUp}`);
			const knownRotation = Quaternion.LookRotation(knownWorldForward, knownWorldUp);
			//print(`GetWorldRotationForLookingAt() knownRotation: ${knownRotation}`);
			const inverse = AlignmentManager.Instance.InverseQuat(knownRotation);
			//print(`GetWorldRotationForLookingAt() 1`);
			const typeOfInv = typeOf(inverse);
			//print(`GetWorldRotationForLookingAt() 2`);
			//print(`GetWorldRotationForLookingAt() typeOfInv: ${typeOfInv}`);
			// Find desired rotation relative to source transform.
			const rotationAdjustment = inverse.mul(sourceTransform.rotation);
			//const rotationAdjustment = Quat_Quat_Mult(Quaternion.Inverse(knownRotation), sourceTransform.rotation);
			//print(`GetWorldRotationForLookingAt() rotationAdjustment: ${rotationAdjustment}`);
			// Applied our rotation adjustment to the desired world rotation
			// to make the proper side of the object face that direction.
			finalRotation = desiredWorldRotation.mul(rotationAdjustment);
			//finalRotation = Quat_Quat_Mult(desiredWorldRotation, rotationAdjustment);
			//print(`GetWorldRotationForLookingAt() finalRotation: ${finalRotation}`);
		});

		if (!success) {
			print(`GetWorldRotationForLookingAt() error: ${err}`);
		}

		return finalRotation;
	}

	public static GetWorldVectorFromVectorType(sourceTransform: Transform, knownVectorType: KnownVectorType): Vector3 {
		//print(`GetWorldVectorFromVectorType() sourceTransform.name: ${sourceTransform.name}, knownVectorType: ${knownVectorType}`);

		let worldVector = this.forward;
		switch (knownVectorType) {
			case KnownVectorType.LocalForward:
				worldVector = sourceTransform.forward;
				break;
			case KnownVectorType.LocalBack:
				worldVector = sourceTransform.forward.mul(-1);
				break;
			case KnownVectorType.LocalRight:
				worldVector = sourceTransform.right;
				break;
			case KnownVectorType.LocalLeft:
				worldVector = sourceTransform.right.mul(-1);
				break;
			case KnownVectorType.LocalUp:
				worldVector = sourceTransform.up;
				break;
			case KnownVectorType.LocalDown:
				worldVector = sourceTransform.up.mul(-1);
				break;
			case KnownVectorType.WorldForward:
				worldVector = this.forward;
				break;
			case KnownVectorType.WorldBack:
				worldVector = this.back;
				break;
			case KnownVectorType.WorldRight:
				worldVector = this.right;
				break;
			case KnownVectorType.WorldLeft:
				worldVector = this.left;
				break;
			case KnownVectorType.WorldUp:
				worldVector = this.up;
				break;
			case KnownVectorType.WorldDown:
				worldVector = this.down;
				break;
			default:
				print(`Unsupported KnownVectorType encountered: ${knownVectorType}`);
				worldVector = this.forward;
				break;
		}

		return worldVector;
	}
}
