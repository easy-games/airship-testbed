export class Spring {
	/** The goal for the spring. */
	public Goal: Vector3;

	/** The current velocity of the spring. */
	public Velocity: Vector3;

	constructor(
		/** The position of the spring */
		private position: Vector3,

		/** The angular frequency of the spring. */
		private angularFrequency: number,
	) {
		this.Goal = position;
		this.Velocity = new Vector3(0, 0, 0);
	}

	/** Update the spring. */
	public Update(deltaTime: number): Vector3 {
		const angFreq = this.angularFrequency * math.pi * 2;
		const goal = this.Goal;
		const p0 = this.position;
		const v0 = this.Velocity;
		const offset = p0.sub(goal);
		const decay = math.exp(-angFreq * deltaTime);
		const position = offset
			.mul(1 + angFreq * deltaTime)
			.add(v0.mul(deltaTime))
			.mul(decay)
			.add(goal);
		this.Velocity = v0
			.mul(1 - angFreq * deltaTime)
			.sub(offset.mul(angFreq * angFreq * deltaTime))
			.mul(decay);
		this.position = position;
		return position;
	}

	/** Reset the spring to a specific position. */
	public ResetTo(position: Vector3) {
		this.position = position;
		this.Goal = position;
		this.Velocity = new Vector3(0, 0, 0);
	}

	/** Impulse the spring with a given impulse velocity. */
	public Impulse(impulse: Vector3) {
		this.Velocity = this.Velocity.add(impulse);
	}
}
