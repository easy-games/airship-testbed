import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Player } from "Shared/Player/Player";
import { Keyboard } from "Shared/UserInput";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { PlayerController } from "../Player/PlayerController";
import { Window } from "Shared/Util/Window";
import { Task } from "Shared/Util/Task";

@Controller({})
export class TabListController implements OnStart {
	private tablistGO = GameObject.Find("TabList");
	private tablistCanvas = this.tablistGO.GetComponent<Canvas>();
	private tablistRefs = this.tablistGO.GetComponent<GameObjectReferences>();
	private tablistContentGO = this.tablistRefs.GetValue("UI", "Content");
	private tablistEntryPrefab = this.tablistRefs.GetValue<Object>("UI", "TabListEntry");
	private cellsPerRow = 4;
	private rowCount = 13;
	private maxSlots = this.cellsPerRow * this.rowCount;
	private shown = false;

	constructor(private readonly playerController: PlayerController) {
		this.Hide(true);
	}

	OnStart(): void {
		this.FullUpdate();

		ClientSignals.PlayerJoin.Connect((player) => {
			this.FullUpdate();
		});
		ClientSignals.PlayerLeave.Connect((player) => {
			this.FullUpdate();
		});
		ClientSignals.PlayerChangeTeam.Connect((event) => {
			this.FullUpdate();
		});

		const keyboard = new Keyboard();
		keyboard.KeyDown.Connect((e) => {
			if (e.Key === Key.Tab && !keyboard.IsEitherKeyDown(Key.LeftAlt, Key.LeftCommand)) {
				this.Show();
			}
		});
		keyboard.KeyUp.Connect((e) => {
			if (e.Key === Key.Tab) {
				this.Hide();
			}
		});

		Window.FocusChanged.Connect((hasFocus) => {
			if (hasFocus) {
				Task.Delay(0, () => {
					this.Hide();
				});
			}
		});

		// Prevent window from staying open once tabbed out.
		// SetInterval(0.1, () => {
		// 	if (this.IsShown() && !Application.isFocused) {
		// 		this.Hide();
		// 	}
		// });

		// Application.OnFocusChanged((focused) => {
		// 	if (!focused) {
		// 		this.Hide();
		// 	}
		// });
	}

	public FullUpdate(): void {
		const players = this.playerController.GetPlayers();
		const contentChildCount = this.tablistContentGO.transform.childCount;

		for (let i = 0; i < this.maxSlots; i++) {
			let player: Player | undefined;
			if (i < players.size()) {
				player = players[i];
			}

			let entry: GameObject | undefined;
			if (player) {
				if (i < contentChildCount) {
					entry = this.tablistContentGO.transform.GetChild(i).gameObject;
				} else {
					entry = Object.Instantiate(this.tablistEntryPrefab, this.tablistContentGO.transform) as GameObject;
				}
			}

			if (player && entry) {
				this.UpdateEntry(entry, player);
			} else if (entry) {
				Object.Destroy(entry);
			}
		}
	}

	private UpdateEntry(entry: GameObject, player: Player): void {
		const refs = entry.GetComponent<GameObjectReferences>();
		const usernameText = refs.GetValue<TMP_Text>("UI", "Username");

		let username = player.username;
		const team = player.GetTeam();
		if (team) {
			const hex = ColorUtil.ColorToHex(team.color);
			username = `<color=${hex}>${username}</color>`;
		}

		usernameText.text = username;
	}

	public Show(): void {
		if (this.shown) return;

		this.shown = true;
		this.tablistCanvas.enabled = true;
	}

	public Hide(force = false): void {
		if (!force) {
			if (!this.shown) return;
		}

		this.shown = false;
		this.tablistCanvas.enabled = false;
	}

	public IsShown(): boolean {
		return this.shown;
	}
}
