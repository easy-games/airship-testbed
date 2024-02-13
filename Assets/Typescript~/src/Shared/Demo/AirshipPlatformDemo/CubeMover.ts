import { Airship } from "@Easy/Core/Shared/Airship";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";

export default class CubeMover extends AirshipBehaviour {
	private bin = new Bin();
	public magnitude = 0.8;

	public override OnEnable(): void {
		let totalTime = math.random() * math.pi * 2;
		let startingPos = this.gameObject.transform.position;
		let rb = this.gameObject.GetComponent<Rigidbody>();
		this.bin.Add(
			OnUpdate.Connect((dt) => {
				totalTime += dt;
				let pos = startingPos.add(new Vector3(math.sin(totalTime) * this.magnitude, 0, 0));
				// rb.Move(pos, Quaternion.identity);
				this.gameObject.transform.position = pos;
			}),
		);

		this.bin.Add(
			Airship.players.ObservePlayers((player) => {
				this.gameObject.GetComponent<NetworkObject>().GiveOwnership(player.networkObject.Owner);
			}),
		);
	}

	public override OnDisable(): void {
		this.bin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
