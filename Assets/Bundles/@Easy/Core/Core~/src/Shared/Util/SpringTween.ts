import { Spring } from "./Spring";

const EPSILON = 0.0001;

export class SpringTween {
	private readonly spring: Spring;

	private elapsedTime = 0;

	constructor(position: Vector3, angularFrequency: number, private readonly minDuration: number) {
		this.spring = new Spring(position, angularFrequency);
	}

	public setGoal(goal: Vector3) {
		this.elapsedTime = 0;
		this.spring.goal = goal;
	}

	public impulse(impulse: Vector3) {
		this.elapsedTime = 0;
		this.spring.impulse(impulse);
	}

	public resetTo(position: Vector3) {
		this.elapsedTime = 0;
		this.spring.resetTo(position);
	}

	public update(deltaTime: number): LuaTuple<[position: Vector3, isDone: boolean]> {
		this.elapsedTime += deltaTime;
		const springPos = this.spring.update(deltaTime);
		return $tuple(springPos, this.elapsedTime >= this.minDuration && this.spring.velocity.magnitude < EPSILON);
	}
}
