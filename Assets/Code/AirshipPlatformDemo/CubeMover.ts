import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnFixedUpdate } from "@Easy/Core/Shared/Util/Timer";

export default class CubeMover extends AirshipBehaviour {
	private bin = new Bin();
	public movement = new Vector3(0, 1, 0);

	public override OnEnable(): void {
		let offset = math.random() * math.pi * 2;
		let startingPos = this.gameObject.transform.position;
		let rb = this.gameObject.GetComponent<Rigidbody>()!;
		this.bin.Add(
			OnFixedUpdate.Connect(() => {
				// if (!nob.IsOwner) return;
				let pos = startingPos.add(this.movement.mul(math.sin(Time.time + offset)));
				rb.Move(pos, Quaternion.identity);
				// rb.angularVelocity = new Vector3();
				// rb.rotation = Quaternion.identity;
				// this.gameObject.transform.position = pos;
			}),
		);
	}

	public override OnDisable(): void {
		this.bin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
