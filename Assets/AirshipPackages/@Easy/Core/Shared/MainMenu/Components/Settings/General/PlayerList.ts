import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ProtectedPlayersSingleton } from "../../../Singletons/ProtectedPlayersSingleton";
import PlayerEntry from "./PlayerEntry";
import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";

export default class PlayerList extends AirshipBehaviour {
	public content!: RectTransform;
	public playerEntryPrefab!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {
		task.spawn(() => {
			const protectedPlayers = Dependency<ProtectedPlayersSingleton>();
			const protectedParty = Dependency<ProtectedPartyController>();
			protectedParty.GetParty();

			if (this.gameObject.activeInHierarchy) {
				this.RenderAll();
				this.bin.Add(
					protectedPlayers.onPlayerJoined.Connect(() => {
						this.RenderAll();
					}),
				);
				this.bin.Add(
					protectedPlayers.onPlayerDisconnected.Connect(() => {
						this.RenderAll();
					}),
				);

				this.bin.Add(
					protectedParty.onPartyChange.Connect((party) => {
						this.RenderAll();
					}),
				);
			}
		});
	}

	public RenderAll(): void {
		this.content.gameObject.ClearChildren();

		let i = 0;
		for (let player of Protected.protectedPlayers.players) {
			const go = Object.Instantiate(this.playerEntryPrefab, this.content);
			const entry = go.GetAirshipComponent<PlayerEntry>()!;

			entry.Init(player);

			if (i % 2 === 0) {
				entry.SetEven();
			}

			i++;
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
