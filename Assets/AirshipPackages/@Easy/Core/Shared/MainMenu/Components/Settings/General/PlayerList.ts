import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../../Singletons/MainMenuSingleton";
import PlayerEntry from "./PlayerEntry";

export default class PlayerList extends AirshipBehaviour {
	public content!: RectTransform;
	public playerEntryPrefab!: GameObject;

	private bin = new Bin();

	public OnEnable(): void {
		task.spawn(() => {
			Airship.WaitUntilReady();
			if (this.gameObject.active) {
				this.RenderAll();
				this.bin.Add(
					Airship.players.onPlayerJoined.Connect(() => {
						this.RenderAll();
					}),
				);
				this.bin.Add(
					Airship.players.onPlayerDisconnected.Connect(() => {
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
		for (let player of Airship.players.GetPlayers()) {
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
