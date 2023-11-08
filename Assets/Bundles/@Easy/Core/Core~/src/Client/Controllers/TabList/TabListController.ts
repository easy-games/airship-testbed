import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { ProfilePictureDefinitions } from "Shared/ProfilePicture/ProfilePictureDefinitions";
import { ProfilePictureId } from "Shared/ProfilePicture/ProfilePictureId";
import { Keyboard } from "Shared/UserInput";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Task } from "Shared/Util/Task";
import { OnLateUpdate } from "Shared/Util/Timer";
import { Window } from "Shared/Util/Window";
import { PlayerController } from "../Player/PlayerController";
import { TeamController } from "../Team/TeamController";
import { CoreUIController } from "../UI/CoreUIController";

@Controller({})
export class TabListController implements OnStart {
	private tablistGO: GameObject;
	private tablistCanvas;
	private tablistRefs;
	private tablistContentGO;
	private tablistEntryPrefab;
	private cellsPerRow = 4;
	private rowCount = 13;
	private maxSlots = this.cellsPerRow * this.rowCount;
	private shown = false;

	private dirty = false;

	private profilePicSprite: Sprite;

	constructor(
		private readonly playerController: PlayerController,
		private readonly coreUIController: CoreUIController,
		private readonly teamController: TeamController,
	) {
		this.tablistGO = this.coreUIController.refs.GetValue("Apps", "TabList");
		this.tablistCanvas = this.tablistGO.GetComponent<Canvas>();
		this.tablistRefs = this.tablistGO.GetComponent<GameObjectReferences>();
		this.tablistContentGO = this.tablistRefs.GetValue("UI", "Content");
		this.tablistEntryPrefab = this.tablistRefs.GetValue<Object>("UI", "TabListEntry");

		this.Hide(true);

		this.profilePicSprite = Bridge.MakeSprite(
			AssetBridge.Instance.LoadAsset(ProfilePictureDefinitions[ProfilePictureId.BEAR].path),
		);
	}

	OnStart(): void {
		this.FullUpdate();

		CoreClientSignals.PlayerJoin.Connect((player) => {
			this.dirty = true;
		});
		CoreClientSignals.PlayerLeave.Connect((player) => {
			this.dirty = true;
		});
		CoreClientSignals.PlayerChangeTeam.Connect((event) => {
			this.dirty = true;
		});

		OnLateUpdate.Connect(() => {
			if (this.dirty) {
				this.dirty = false;
				this.FullUpdate();
			}
		});

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.Tab, (e) => {
			if (!keyboard.IsEitherKeyDown(KeyCode.LeftAlt, KeyCode.LeftCommand)) {
				this.Show();
			}
		});
		keyboard.OnKeyUp(KeyCode.Tab, (e) => {
			this.Hide();
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
		let teams = this.teamController.GetTeams();
		// if (teams.size() > 0) {
		// 	teams = teams.sort((a, b) => {
		// 		if (a.HasLocalPlayer()) {
		// 			return true;
		// 		}
		// 		if (b.HasLocalPlayer()) {
		// 			return false;
		// 		}
		// 		return string.byte(a.id)[0] < string.byte(b.id)[0];
		// 	});
		// }
		let players = this.playerController.GetPlayers().sort((a, b) => {
			if (a === Game.LocalPlayer) return true;

			let aTeamIndex = math.huge;
			let bTeamIndex = math.huge;

			let aTeam = a.GetTeam();
			let bTeam = b.GetTeam();

			if (aTeam) {
				aTeamIndex = teams.indexOf(aTeam);
			}
			if (bTeam) {
				bTeamIndex = teams.indexOf(bTeam);
			}

			return aTeamIndex < bTeamIndex;
		});

		for (let i = 0; i < this.maxSlots; i++) {
			let player: Player | undefined;
			if (i < players.size()) {
				player = players[i];

				let entry: GameObject | undefined;
				if (i < this.tablistContentGO.transform.childCount) {
					entry = this.tablistContentGO.transform.GetChild(i).gameObject;
				} else {
					entry = Object.Instantiate(this.tablistEntryPrefab, this.tablistContentGO.transform) as GameObject;
				}

				this.UpdateEntry(entry, player);
			} else {
				if (i < this.tablistContentGO.transform.childCount) {
					let entry = this.tablistContentGO.transform.GetChild(i).gameObject;
					Object.Destroy(entry);
				}
			}
		}
	}

	private UpdateEntry(entry: GameObject, player: Player): void {
		const refs = entry.GetComponent<GameObjectReferences>();
		const usernameText = refs.GetValue<TMP_Text>("UI", "Username");

		let username = player.username;
		if (player === Game.LocalPlayer) {
			username = "<b>" + username + "</b>";
		}
		const team = player.GetTeam();
		if (team) {
			const hex = ColorUtil.ColorToHex(team.color);
			username = `<color=${hex}>${username}</color>`;
		}

		const image = refs.GetValue<Image>("UI", "ProfilePicture");
		const profilePicture = player.GetProfilePicture();
		image.sprite = this.profilePicSprite;

		usernameText.text = username;
	}

	public SetTitleText(title: string): void {
		let textLabel = this.tablistRefs.GetValue("UI", "TitleText") as TMP_Text;
		textLabel.text = title;
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
