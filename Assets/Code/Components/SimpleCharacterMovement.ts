import { Keyboard } from "@Easy/Core/Shared/UserInput";

export default class SimpleCharacterMovement extends AirshipBehaviour {
	@Header("Variables")
	public speed = 2;
	public jumpHeight = 1;
	public gravity = -9.81;

	@Header("References")
	public characterController: CharacterController;
	public networkIdentity: NetworkIdentity;

	@NonSerialized() public velocity = new Vector3();

	protected Update(dt: number): void {
		if (!this.networkIdentity.isOwned) return;

		const grounded = this.characterController.isGrounded;
		if (grounded) {
			this.velocity = this.velocity.WithY(0);
		}

		let move = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
		this.characterController.Move(move.mul(Time.deltaTime * this.speed));

		if (move !== Vector3.zero) {
			this.transform.forward = move;
		}

		if (Keyboard.IsKeyDown(Key.Space) && grounded) {
			this.velocity = this.velocity.WithY(this.velocity.y + math.sqrt(this.jumpHeight * -3 * this.gravity));
		}
		this.velocity = this.velocity.WithY(this.velocity.y + this.gravity * Time.deltaTime);
		this.characterController.Move(this.velocity.mul(Time.deltaTime));
	}
}
