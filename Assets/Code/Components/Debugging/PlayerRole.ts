export default class PlayerRole extends AirshipBehaviour {
	override Start(): void {
		const f = new float3(1, 1, 1);
		print("float 3: " + f.x);
	}

	override OnDestroy(): void {}
}
