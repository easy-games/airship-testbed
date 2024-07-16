import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { OnLateUpdate, SetInterval } from "@Easy/Core/Shared/Util/Timer";

@Controller({})
export class TabListController {
	private tablistGO: GameObject;
	private tablistCanvas: Canvas;
	private tablistRefs;
	private tablistContentGO;
	private tablistEntryPrefab;
	private wrapperRect: RectTransform;
	private canvasGroup: CanvasGroup;

	private cellsPerRow = 4;
	private rowCount = 13;
	private maxSlots = this.cellsPerRow * this.rowCount;
	private shown = false;
	private showBin = new Bin();

	private dirty = false;
	private init = false;

	private posY = -80;
	private tweenDistance = 10;
	private tweenDuration = 0.06;

	constructor() {
		this.tablistGO = Object.Instantiate(
			AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/TabList.prefab"),
			CoreRefs.rootTransform,
		);
		this.tablistCanvas = this.tablistGO.GetComponent<Canvas>()!;
		this.tablistRefs = this.tablistGO.GetComponent<GameObjectReferences>()!;
		this.tablistContentGO = this.tablistRefs.GetValue("UI", "Content");
		this.tablistEntryPrefab = this.tablistRefs.GetValue<Object>("UI", "TabListEntry");
		this.wrapperRect = this.tablistGO.transform.GetChild(0) as RectTransform;
		this.canvasGroup = this.tablistGO.GetComponent<CanvasGroup>()!;

		this.Hide(true, true);
	}

	protected OnStart(): void {
		this.FullUpdate();

		Airship.Players.onPlayerJoined.Connect((player) => {
			this.dirty = true;
		});
		Airship.Players.onPlayerDisconnected.Connect((player) => {
			this.dirty = true;
		});
		Airship.Teams.onPlayerChangeTeam.Connect((player, team, oldTeam) => {
			this.dirty = true;
		});

		OnLateUpdate.Connect(() => {
			if (this.dirty) {
				this.dirty = false;
				Profiler.BeginSample("TabList.FullUpdate");
				this.FullUpdate();
				Profiler.EndSample();
			}
		});

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(Key.Tab, (e) => {
			if (e.uiProcessed) return;
			if (!keyboard.IsEitherKeyDown(Key.LeftAlt, Key.LeftCommand)) {
				this.Show();
			}
		});
		keyboard.OnKeyUp(Key.Tab, (e) => {
			this.Hide();
		});

		// Prevent window from staying open once tabbed out.
		SetInterval(0.1, () => {
			if (this.IsShown() && !Application.isFocused) {
				this.Hide();
			}
		});

		// Application.OnFocusChanged((focused) => {
		// 	if (!focused) {
		// 		this.Hide();
		// 	}
		// });
	}

	public FullUpdate(): void {
		let teams = Airship.Teams.GetTeams();
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
		let players = Airship.Players.GetPlayers().sort((a, b) => {
			if (a === Game.localPlayer) return true;

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
				let init = this.init;
				if (i < this.tablistContentGO.transform.childCount) {
					entry = this.tablistContentGO.transform.GetChild(i).gameObject;
				} else {
					entry = Object.Instantiate(this.tablistEntryPrefab, this.tablistContentGO.transform) as GameObject;
					init = true;
				}

				this.UpdateEntry(entry, player, init);
			} else {
				if (i < this.tablistContentGO.transform.childCount) {
					let entry = this.tablistContentGO.transform.GetChild(i).gameObject;
					Object.Destroy(entry);
				}
			}
		}
		this.init = false;
	}

	private UpdateEntry(entry: GameObject, player: Player, init: boolean): void {
		const refs = entry.GetComponent<GameObjectReferences>()!;
		const usernameText = refs.GetValue<TMP_Text>("UI", "Username");

		let username = player.username;
		if (player === Game.localPlayer) {
			username = "<b>" + username + "</b>";
		}
		const team = player.GetTeam();
		if (team) {
			const hex = ColorUtil.ColorToHex(team.color);
			username = `<color=${hex}>${username}</color>`;
		}

		const image = refs.GetValue("UI", "ProfilePicture").GetComponent<RawImage>()!;
		task.spawn(async () => {
			const texture = await player.GetProfileImageTextureAsync();
			if (texture) {
				image.texture = texture;
			}
		});

		// const addFriendGo = refs.GetValue<GameObject>("UI", "AddFriendButton");
		// const isFriends = player.IsFriend();
		// addFriendGo.SetActive(!isFriends && !player.IsLocalPlayer());
		// if (init) {
		// 	CoreUI.SetupButton(addFriendGo);
		// 	CanvasAPI.OnClickEvent(addFriendGo, () => {
		// 		Dependency<FriendsController>().SendFriendRequest(player.username);
		// 		addFriendGo.TweenGraphicAlpha(0.5, 0.12);
		// 	});
		// }
		// if (isFriends) {
		// 	if (Dependency<FriendsController>().HasOutgoingFriendRequest(player.userId)) {
		// 		addFriendGo.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.5);
		// 	} else {
		// 		addFriendGo.GetComponent<Image>()!.color = new Color(1, 1, 1, 1);
		// 	}
		// }

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
		this.wrapperRect.anchoredPosition = new Vector2(0, this.posY - this.tweenDistance);
		NativeTween.AnchoredPositionY(this.wrapperRect, this.posY, this.tweenDuration);
		this.canvasGroup.alpha = 0;
		NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, this.tweenDuration);
	}

	public Hide(force = false, immediate = false): void {
		this.showBin.Clean();
		if (!force) {
			if (!this.shown) return;
		}

		this.shown = false;

		if (immediate || true) {
			this.tablistCanvas.enabled = false;
		} else {
			NativeTween.AnchoredPositionY(this.wrapperRect, this.posY - this.tweenDistance, this.tweenDuration);
			NativeTween.GraphicAlpha(this.canvasGroup, 0, this.tweenDuration);
			task.delay(0.12, () => {
				if (!this.shown) {
					this.tablistCanvas.enabled = false;
				}
			});
		}
	}

	public IsShown(): boolean {
		return this.shown;
	}
}
