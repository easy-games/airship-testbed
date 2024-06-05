// import { Airship } from "@Easy/Core/Shared/Airship";
// import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
// import { Game } from "@Easy/Core/Shared/Game";
// import { Player } from "@Easy/Core/Shared/Player/Player";
// import { ProfilePictureDefinitions } from "@Easy/Core/Shared/ProfilePicture/ProfilePictureDefinitions";
// import { ProfilePictureId } from "@Easy/Core/Shared/ProfilePicture/ProfilePictureId";
// import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
// import { Bin } from "@Easy/Core/Shared/Util/Bin";
// import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
// import { Task } from "@Easy/Core/Shared/Util/Task";
// import { OnLateUpdate } from "@Easy/Core/Shared/Util/Timer";
// import { Window } from "@Easy/Core/Shared/Util/Window";
// import { CoreUIController } from "../../ProtectedControllers//CoreUIController";

// @Controller({})
// export class TabListController implements OnStart {
// 	private tablistGO: GameObject;
// 	private tablistCanvas;
// 	private tablistRefs;
// 	private tablistContentGO;
// 	private tablistEntryPrefab;
// 	private cellsPerRow = 4;
// 	private rowCount = 13;
// 	private maxSlots = this.cellsPerRow * this.rowCount;
// 	private shown = false;
// 	private mouse = new Mouse();
// 	private showBin = new Bin();

// 	private dirty = false;
// 	private init = false;

// 	private profilePicSprite: Sprite;

// 	constructor() {
// 		this.tablistGO = this.coreUIController.refs.GetValue("Apps", "TabList");
// 		this.tablistCanvas = this.tablistGO.GetComponent<Canvas>()!;
// 		this.tablistRefs = this.tablistGO.GetComponent<GameObjectReferences>()!;
// 		this.tablistContentGO = this.tablistRefs.GetValue("UI", "Content");
// 		this.tablistEntryPrefab = this.tablistRefs.GetValue<Object>("UI", "TabListEntry");

// 		this.Hide(true);

// 		this.profilePicSprite = Bridge.MakeSprite(
// 			AssetBridge.Instance.LoadAsset(ProfilePictureDefinitions[ProfilePictureId.BEAR].path),
// 		);
// 	}

// 	OnStart(): void {
// 		this.FullUpdate();

// 		Airship.players.onPlayerJoined.Connect((player) => {
// 			this.dirty = true;
// 		});
// 		Airship.players.onPlayerDisconnected.Connect((player) => {
// 			this.dirty = true;
// 		});
// 		Airship.teams.onPlayerChangeTeam.Connect((player, team, oldTeam) => {
// 			this.dirty = true;
// 		});

// 		OnLateUpdate.Connect(() => {
// 			if (this.dirty) {
// 				this.dirty = false;
// 				Profiler.BeginSample("TabList.FullUpdate");
// 				this.FullUpdate();
// 				Profiler.EndSample();
// 			}
// 		});

// 		const keyboard = new Keyboard();
// 		keyboard.OnKeyDown(Key.Tab, (e) => {
// 			if (e.uiProcessed) return;
// 			if (!keyboard.IsEitherKeyDown(Key.LeftAlt, Key.LeftCommand)) {
// 				this.Show();
// 			}
// 		});
// 		keyboard.OnKeyUp(Key.Tab, (e) => {
// 			this.Hide();
// 		});

// 		Window.focusChanged.Connect((hasFocus) => {
// 			if (hasFocus) {
// 				Task.Delay(0, () => {
// 					this.Hide();
// 				});
// 			}
// 		});

// 		// Prevent window from staying open once tabbed out.
// 		// SetInterval(0.1, () => {
// 		// 	if (this.IsShown() && !Application.isFocused) {
// 		// 		this.Hide();
// 		// 	}
// 		// });

// 		// Application.OnFocusChanged((focused) => {
// 		// 	if (!focused) {
// 		// 		this.Hide();
// 		// 	}
// 		// });
// 	}

// 	public FullUpdate(): void {
// 		let teams = Airship.teams.GetTeams();
// 		// if (teams.size() > 0) {
// 		// 	teams = teams.sort((a, b) => {
// 		// 		if (a.HasLocalPlayer()) {
// 		// 			return true;
// 		// 		}
// 		// 		if (b.HasLocalPlayer()) {
// 		// 			return false;
// 		// 		}
// 		// 		return string.byte(a.id)[0] < string.byte(b.id)[0];
// 		// 	});
// 		// }
// 		let players = Airship.players.GetPlayers().sort((a, b) => {
// 			if (a === Game.localPlayer) return true;

// 			let aTeamIndex = math.huge;
// 			let bTeamIndex = math.huge;

// 			let aTeam = a.GetTeam();
// 			let bTeam = b.GetTeam();

// 			if (aTeam) {
// 				aTeamIndex = teams.indexOf(aTeam);
// 			}
// 			if (bTeam) {
// 				bTeamIndex = teams.indexOf(bTeam);
// 			}

// 			return aTeamIndex < bTeamIndex;
// 		});

// 		for (let i = 0; i < this.maxSlots; i++) {
// 			let player: Player | undefined;
// 			if (i < players.size()) {
// 				player = players[i];

// 				let entry: GameObject | undefined;
// 				let init = this.init;
// 				if (i < this.tablistContentGO.transform.childCount) {
// 					entry = this.tablistContentGO.transform.GetChild(i).gameObject;
// 				} else {
// 					entry = Object.Instantiate(this.tablistEntryPrefab, this.tablistContentGO.transform) as GameObject;
// 					init = true;
// 				}

// 				this.UpdateEntry(entry, player, init);
// 			} else {
// 				if (i < this.tablistContentGO.transform.childCount) {
// 					let entry = this.tablistContentGO.transform.GetChild(i).gameObject;
// 					Object.Destroy(entry);
// 				}
// 			}
// 		}
// 		this.init = false;
// 	}

// 	private UpdateEntry(entry: GameObject, player: Player, init: boolean): void {
// 		const refs = entry.GetComponent<GameObjectReferences>()!;
// 		const usernameText = refs.GetValue<TMP_Text>("UI", "Username");

// 		let username = player.username;
// 		if (player === Game.localPlayer) {
// 			username = "<b>" + username + "</b>";
// 		}
// 		const team = player.GetTeam();
// 		if (team) {
// 			const hex = ColorUtil.ColorToHex(team.color);
// 			username = `<color=${hex}>${username}</color>`;
// 		}

// 		const image = refs.GetValue<Image>("UI", "ProfilePicture");
// 		const profilePicture = player.GetProfilePicture();
// 		image.sprite = this.profilePicSprite;

// 		// const addFriendGo = refs.GetValue<GameObject>("UI", "AddFriendButton");
// 		// const isFriends = player.IsFriend();
// 		// addFriendGo.SetActive(!isFriends && !player.IsLocalPlayer());
// 		// if (init) {
// 		// 	CoreUI.SetupButton(addFriendGo);
// 		// 	CanvasAPI.OnClickEvent(addFriendGo, () => {
// 		// 		Dependency<FriendsController>().SendFriendRequest(player.username);
// 		// 		addFriendGo.TweenGraphicAlpha(0.5, 0.12);
// 		// 	});
// 		// }
// 		// if (isFriends) {
// 		// 	if (Dependency<FriendsController>().HasOutgoingFriendRequest(player.userId)) {
// 		// 		addFriendGo.GetComponent<Image>()!.color = new Color(1, 1, 1, 0.5);
// 		// 	} else {
// 		// 		addFriendGo.GetComponent<Image>()!.color = new Color(1, 1, 1, 1);
// 		// 	}
// 		// }

// 		usernameText.text = username;
// 	}

// 	public SetTitleText(title: string): void {
// 		let textLabel = this.tablistRefs.GetValue("UI", "TitleText") as TMP_Text;
// 		textLabel.text = title;
// 	}

// 	public Show(): void {
// 		if (this.shown) return;

// 		this.shown = true;
// 		this.tablistCanvas.enabled = true;
// 	}

// 	public Hide(force = false): void {
// 		this.showBin.Clean();
// 		if (!force) {
// 			if (!this.shown) return;
// 		}

// 		this.shown = false;
// 		this.tablistCanvas.enabled = false;
// 	}

// 	public IsShown(): boolean {
// 		return this.shown;
// 	}
// }
