import { Airship } from "@Easy/Core/Shared/Airship";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { OnTick } from "@Easy/Core/Shared/Util/Timer";

export default class CubeMover extends AirshipBehaviour {
	private bin = new Bin();
	public movement = new Vector3(0, 1, 0);

	public override OnEnable(): void {
		let offset = math.random() * math.pi * 2;
		let startingPos = this.gameObject.transform.position;
		let rb = this.gameObject.GetComponent<Rigidbody>();
		const nob = this.gameObject.GetComponent<NetworkObject>();
		if (RunUtil.IsServer()) {
			this.bin.Add(
				OnTick.Connect(() => {
					// if (!nob.IsOwner) return;
					let pos = startingPos.add(this.movement.mul(math.sin(Time.time + offset)));
					rb.Move(pos, Quaternion.identity);
					rb.rotation = Quaternion.identity;
					// this.gameObject.transform.position = pos;
				}),
			);
		}

		if (RunUtil.IsServer()) {
			this.bin.Add(
				Airship.players.ObservePlayers((player) => {
					// this.gameObject.GetComponent<NetworkObject>().GiveOwnership(player.networkObject.Owner);
					// Game.BroadcastMessage(player.username + " now owns the cube.");
				}),
			);
		}

		InstanceFinder.TimeManager.SetTickRate(20);
	}

	public override OnDisable(): void {
		this.bin.Clean();
	}

	override Start(): void {}

	override OnDestroy(): void {}
}
