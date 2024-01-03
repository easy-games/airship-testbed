import { Spring } from "./Spring";

const EPSILON = 0.0001;

export class SpringTween {
	private readonly spring: Spring;

	private elapsedTime = 0;

	constructor(position: Vector3, angularFrequency: number, private readonly minDuration: number) {
		this.spring = new Spring(position, angularFrequency);
	}

	public SetGoal(goal: Vector3) {
		this.elapsedTime = 0;
		this.spring.goal = goal;
	}

	public Impulse(impulse: Vector3) {
		this.elapsedTime = 0;
		this.spring.Impulse(impulse);
	}

	public ResetTo(position: Vector3) {
		this.elapsedTime = 0;
		this.spring.ResetTo(position);
	}

	public Update(deltaTime: number): LuaTuple<[position: Vector3, isDone: boolean]> {
		this.elapsedTime += deltaTime;
		const springPos = this.spring.Update(deltaTime);
		return $tuple(springPos, this.elapsedTime >= this.minDuration && this.spring.velocity.magnitude < EPSILON);
	}
}
