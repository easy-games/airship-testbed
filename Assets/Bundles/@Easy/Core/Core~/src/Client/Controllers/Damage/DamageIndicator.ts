export class DamageIndicator {
	private value: number;
	private position: Vector3 | undefined;

	constructor(value: number, position: Vector3 | undefined) {
		this.value = value;
		this.position = position;
	}

	public setValue(newValue: number) {
		this.value = newValue;
	}

	public updatePosition(newPosition: Vector3) {}
}
