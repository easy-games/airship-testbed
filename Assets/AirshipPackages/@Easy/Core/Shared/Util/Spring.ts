export class Spring {
	/** The goal for the spring. */
	public goal: Vector3;

	/** The current velocity of the spring. */
	public velocity: Vector3;

	constructor(
		/** The position of the spring */
		private position: Vector3,

		/** The angular frequency of the spring. */
		private angularFrequency: number,
	) {
		this.goal = position;
		this.velocity = new Vector3(0, 0, 0);
	}

	/** Update the spring. */
	public Update(deltaTime: number): Vector3 {
		const angFreq = this.angularFrequency * math.pi * 2;
		const goal = this.goal;
		const p0 = this.position;
		const v0 = this.velocity;
		const offset = p0.sub(goal);
		const decay = math.exp(-angFreq * deltaTime);
		const position = offset
			.mul(1 + angFreq * deltaTime)
			.add(v0.mul(deltaTime))
			.mul(decay)
			.add(goal);
		this.velocity = v0
			.mul(1 - angFreq * deltaTime)
			.sub(offset.mul(angFreq * angFreq * deltaTime))
			.mul(decay);
		this.position = position;
		return position;
	}

	/** Reset the spring to a specific position. */
	public ResetTo(position: Vector3) {
		this.position = position;
		this.goal = position;
		this.velocity = new Vector3(0, 0, 0);
	}

	/** Impulse the spring with a given impulse velocity. */
	public Impulse(impulse: Vector3) {
		this.velocity = this.velocity.add(impulse);
	}
}
