import { Airship } from "@Easy/Core/Shared/Airship";
import { Asset } from "@Easy/Core/Shared/Asset";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { OnLateUpdate } from "@Easy/Core/Shared/Util/Timer";

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
			Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/TabList.prefab"),
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

		Keyboard.OnKeyDown(Key.Tab, (e) => {
			if (e.uiProcessed) return;
			// if (!Application.isFocused) return;
			if (!Keyboard.IsEitherKeyDown(Key.LeftAlt, Key.LeftCommand)) {
				this.Show();
			}
		});
		Keyboard.OnKeyUp(Key.Tab, (e) => {
			this.Hide();
		});

		// Prevent window from staying open once tabbed out.
		// SetInterval(0.1, () => {
		// 	if (this.IsShown() && !Application.isFocused) {
		// 		this.Hide();
		// 	}
		// });

		Application.focusChanged.Connect((focused) => {
			this.Hide(true, true);
			task.unscaledDelay(0, () => {
				this.Hide(true, true);
			});
		});
	}

	public FullUpdate(): void {
		let teams = Airship.Teams.GetTeams();

		let players = Airship.Players.GetPlayers().sort((a, b) => {
			if (a === Game.localPlayer) return true;

			if (a.team && b.team) {
				const teamAIndex = teams.indexOf(a.team);
				const teamBIndex = teams.indexOf(b.team);
				return teamAIndex < teamBIndex;
			}

			// Players with teams should come first?
			if (a.team && !b.team) {
				return true;
			} else if (b.team && !a.team) {
				return false;
			}

			const [playerACodepoint] = utf8.codepoint(a.username);
			const [playerBCodepoint] = utf8.codepoint(b.username);

			return playerACodepoint < playerBCodepoint; // sort alphabetically if no teams
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
		const team = player.team;
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
		NativeTween.AnchoredPositionY(this.wrapperRect, this.posY, this.tweenDuration).SetUseUnscaledTime(true);
		this.canvasGroup.alpha = 0;
		NativeTween.CanvasGroupAlpha(this.canvasGroup, 1, this.tweenDuration).SetUseUnscaledTime(true);
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
			NativeTween.AnchoredPositionY(
				this.wrapperRect,
				this.posY - this.tweenDistance,
				this.tweenDuration,
			).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.canvasGroup, 0, this.tweenDuration).SetUseUnscaledTime(true);
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
