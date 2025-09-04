export default class Test extends AirshipBehaviour {
	layerMask: LayerMask;

	protected Start(): void {
		print("layer mask is", this.layerMask.value);
	}
}
