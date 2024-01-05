export class LocalEntityInputSignal {
	constructor(
		public moveDirection: Vector3,
		public jump: boolean,
		public sprinting: boolean,
		public crouchOrSlide: boolean,
	) {}
}
