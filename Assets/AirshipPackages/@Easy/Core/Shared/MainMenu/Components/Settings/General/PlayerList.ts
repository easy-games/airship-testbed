import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { ProtectedPlayer } from "@Easy/Core/Shared/Player/ProtectedPlayer";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ProtectedPlayersSingleton } from "../../../Singletons/ProtectedPlayersSingleton";
import PlayerEntry from "./PlayerEntry";

export default class PlayerList extends AirshipBehaviour {
	public content: RectTransform;
	public playerEntryPrefab: GameObject;

	private playerEntryMap = new Map<string, PlayerEntry>();

	private bin = new Bin();

	protected Awake(): void {
		this.content.gameObject.ClearChildren();
	}

	public OnEnable(): void {
		task.spawn(() => {
			const protectedPlayers = Dependency<ProtectedPlayersSingleton>();
			const protectedParty = Dependency<ProtectedPartyController>();
			protectedParty.GetParty();

			if (this.gameObject.activeInHierarchy) {
				this.bin.Add(
					protectedPlayers.onPlayerJoined.Connect((player) => {
						this.CreatePlayerEntry(player);
					}),
				);
				this.bin.Add(
					protectedPlayers.onPlayerDisconnected.Connect((player) => {
						const entry = this.playerEntryMap.get(player.userId);
						if (entry) {
							Destroy(entry.gameObject);
						}
					}),
				);
				for (let player of protectedPlayers.players) {
					this.CreatePlayerEntry(player);
				}
			}
		});
	}

	private CreatePlayerEntry(player: ProtectedPlayer): void {
		if (this.playerEntryMap.has(player.userId)) return;

		const go = Object.Instantiate(this.playerEntryPrefab, this.content);
		const entry = go.GetAirshipComponent<PlayerEntry>()!;
		this.playerEntryMap.set(player.userId, entry);

		entry.Init(player);
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
