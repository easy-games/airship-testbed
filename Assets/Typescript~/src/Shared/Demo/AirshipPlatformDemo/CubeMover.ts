import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { OnFixedUpdate } from "@Easy/Core/Shared/Util/Timer";

export default class CubeMover extends AirshipBehaviour {
	private bin = new Bin();
	public movement = new Vector3(0, 1, 0);

	public override OnEnable(): void {
		let totalTime = math.random() * math.pi * 2;
		let startingPos = this.gameObject.transform.position;
		let rb = this.gameObject.GetComponent<Rigidbody>();
		const nob = this.gameObject.GetComponent<NetworkObject>();
		this.bin.Add(
			OnFixedUpdate.Connect((dt) => {
				if (!nob.IsOwner) return;
				totalTime += dt;
				let pos = startingPos.add(this.movement.mul(math.sin(totalTime)));
				rb.Move(pos, Quaternion.identity);
				rb.rotation = Quaternion.identity;
				// this.gameObject.transform.position = pos;
			}),
		);

		if (RunUtil.IsServer()) {
			this.bin.Add(
				Airship.players.ObservePlayers((player) => {
					this.gameObject.GetComponent<NetworkObject>().GiveOwnership(player.networkObject.Owner);
					Game.BroadcastMessage(player.username + " now owns the cube.");
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
