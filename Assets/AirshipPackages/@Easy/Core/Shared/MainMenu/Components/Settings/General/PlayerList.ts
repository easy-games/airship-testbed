import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../../Singletons/MainMenuSingleton";
import { ProtectedPlayersSingleton } from "../../../Singletons/ProtectedPlayersSingleton";
import PlayerEntry from "./PlayerEntry";

export default class PlayerList extends AirshipBehaviour {
	public content!: RectTransform;
	public playerEntryPrefab!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {
		task.spawn(() => {
			const protectedPlayers = Dependency<ProtectedPlayersSingleton>();
			if (this.gameObject.active) {
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
			}

			Dependency<MainMenuSingleton>().ObserveScreenSize((st, size) => {
				if (Game.deviceType !== AirshipDeviceType.Phone) {
					const rect = this.transform as RectTransform;
					rect.anchorMin = new Vector2(1, 0);
					rect.offsetMin = new Vector2(rect.offsetMin.x, 500);
				}
			});
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
