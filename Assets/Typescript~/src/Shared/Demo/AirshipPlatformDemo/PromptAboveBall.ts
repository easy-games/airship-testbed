import { Game } from "@Easy/Core/Shared/Game";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Network } from "Shared/Network";

export default class PromptAboveBall extends AirshipBehaviour {
	public rb!: Rigidbody;

	private rbStartPos!: Vector3;
	private offset!: Vector3;
	private bin = new Bin();

	public override Start(): void {
		this.rbStartPos = this.rb.position;
	}

	public override Update(dt: number): void {
		this.transform.rotation = Quaternion.identity;
		this.transform.position = this.transform.parent!.position.add(this.offset);

		if (this.rb.position.y <= -20) {
			this.rb.position = this.rbStartPos;
			this.rb.velocity = Vector3.zero;
			this.rb.angularVelocity = Vector3.zero;
		}
	}

	override OnEnable(): void {
		this.offset = this.transform.position.sub(this.transform.parent!.position);

		const nob = this.rb.GetComponent<NetworkObject>();
		const prompt = this.gameObject.GetAirshipComponent<ProximityPrompt>();
		if (prompt) {
			this.bin.Add(
				prompt.onActivated.Connect(() => {
					Network.ClientToServer.BounceBall.client.FireServer(nob.ObjectId);
				}),
			);
		}

		if (Game.IsServer()) {
			Network.ClientToServer.BounceBall.server.OnClientEvent((player, nobId) => {
				if (nob.ObjectId === nobId) {
					this.rb.AddForce(new Vector3(0, 20, 0), ForceMode.Impulse);
				}
			});
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}

	public override OnDestroy(): void {}
}
