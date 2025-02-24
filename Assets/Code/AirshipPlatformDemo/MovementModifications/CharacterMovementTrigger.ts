export default class CharacterMovementDataTrigger extends AirshipBehaviour {
	private moveData?: CharacterMovementSettings;

	public Start(): void {
		this.moveData = this.gameObject.GetComponent<CharacterMovementSettings>();
	}

	public OnTriggerEnter(collider: Collider): void {
		if (!this.moveData) {
			return;
		}

		let characterMovement = collider.attachedRigidbody?.gameObject.GetComponent<CharacterMovement>();

		if (characterMovement) {
			characterMovement.movementSettings = this.moveData;
		}
	}
}
