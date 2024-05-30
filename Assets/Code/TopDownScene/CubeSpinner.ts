export default class CubeSpinner extends AirshipBehaviour {
	@Header("Variables")
	public rotation = new Vector3(1, 1, 0.5);
	public speed = 1;

	override Update(dt: number): void {
		this.gameObject.transform.Rotate(this.rotation.mul(dt).mul(this.speed));
	}
}
