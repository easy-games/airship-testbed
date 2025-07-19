import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { DirectMessageController } from "@Easy/Core/Client/ProtectedControllers/Social/DirectMessages/DirectMessageController";
import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { RightClickMenuButton } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { AirshipUserStatusData } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class FriendCard extends AirshipBehaviour {
	public redirectScroll: AirshipRedirectScroll;
	public bubbler: UIScrollRectEventBubbler;
	public btn: Button;
	public joinBtn: Button;
	public usernameText: TMP_Text;
	public statusText: TMP_Text;
	public statusIndicator: Image;
	public profileImage: RawImage;
	public canvasGroup: CanvasGroup;

	@NonSerialized() public canvas?: Canvas;
	@NonSerialized() public userId!: string;
	@NonSerialized() public hasAirshipAccount: boolean;

	private rectTransform: RectTransform;

	private bin = new Bin();

	public InitAsAirshipUser(userData: AirshipUserStatusData): void {
		this.userId = userData.userId;
		this.hasAirshipAccount = true;

		const Teleport = () => {
			if (userData.status !== "in_game") return;
			if (userData.game === undefined || userData.serverId === undefined) return;

			print(
				"Transfering to friend " +
					userData.username +
					". gameId=" +
					userData.gameId +
					", serverId=" +
					userData.serverId,
			);
			Dependency<TransferController>().TransferToGameAsync(userData.gameId, userData.serverId);
		};

		const OpenMenu = () => {
			const options: RightClickMenuButton[] = [];
			if (userData.status !== "offline") {
				if (Game.IsMobile() && userData.status === "in_game" && userData.gameId && userData.serverId) {
					options.push({
						text: "Teleport",
						onClick: () => {
							Teleport();
						},
					});
				}

				options.push(
					{
						text: "Join Party",
						onClick: () => {
							task.spawn(async () => {
								await client.party.joinParty({ uid: userData.userId });
							});
						},
					},
					{
						text: "Invite to Party",
						onClick: () => {
							Dependency<ProtectedPartyController>().InviteToParty(userData.userId);
						},
					},
				);
			}
			if (!Game.IsMobile()) {
				options.push({
					text: "Send Message",
					onClick: () => {
						Dependency<DirectMessageController>().OpenFriend(userData.userId);
					},
				});
			}
			options.push({
				text: "Unfriend",
				onClick: () => {
					task.spawn(() => {
						task.spawn(() => {
							const success = Dependency<ProtectedFriendsController>().RejectFriendRequestAsync(
								userData.userId,
							);
						});
					});
				},
			});
			Dependency<RightClickMenuController>().OpenRightClickMenu(
				Dependency<MainMenuController>().mainContentCanvas,
				Game.IsMobile()
					? new Vector2(this.gameObject.transform.position.x, this.gameObject.transform.position.y)
					: Mouse.position,
				options,
			);
		};

		CoreUI.SetupButton(this.gameObject, {
			noHoverSound: true,
		});

		this.bin.Add(
			this.btn.onClick.Connect(() => {
				if (Game.IsMobile()) {
					OpenMenu();
				} else {
					Dependency<DirectMessageController>().OpenFriend(userData.userId);
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.gameObject, (direction, button) => {
				if (button === PointerButton.RIGHT && direction === PointerDirection.UP) {
					OpenMenu();
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.joinBtn.gameObject, () => {
				Teleport();
			}),
		);
	}

	public UpdateSteamFriendWithNoAirshipAccount(steamFriend: AirshipSteamFriendInfo): void {
		this.usernameText.text = steamFriend.steamName;
		this.statusText.text = "On Steam";
		this.statusText.color = ColorUtil.HexToColor("#883be0");
	}

	public UpdateFriendStatus(
		userData: AirshipUserStatusData,
		config: {
			loadImage: boolean;
		},
	): void {
		if (config.loadImage) {
			task.spawn(async () => {
				const texture = await Airship.Players.GetProfilePictureAsync(userData.userId);
				if (texture) {
					this.profileImage.texture = texture;
				}
			});
		}

		let displayName = userData.username;
		if (displayName.size() > 16) {
			displayName = displayName.sub(0, 15);
		}
		// if (config.includeTag) {
		// 	displayName += "#" + friend.discriminator;
		// }
		this.usernameText.text = displayName;

		if (userData.statusText && userData.statusText !== "") {
			this.statusText.text = userData.statusText;
		} else {
			if (userData.status === "online") {
				this.statusText.text = "Online";
			} else if (userData.status === "in_game") {
				this.statusText.text = "In Game";
			} else {
				this.statusText.text = "Offline";
			}
		}
		if (userData.status === "online") {
			this.canvasGroup.alpha = 1;
			this.statusIndicator.color = ColorUtil.HexToColor("#6AFF61");
			this.statusText.color = ColorUtil.HexToColor("#0CDF61");
			this.joinBtn.gameObject.SetActive(false);
		} else if (userData.status === "in_game") {
			this.canvasGroup.alpha = 1;
			this.statusIndicator.color = ColorUtil.HexToColor("#70D4FF");
			this.statusText.color = ColorUtil.HexToColor("70D4FF");
			this.statusText.text = `Playing ${userData.game.name ?? "???"}`;
			this.joinBtn.gameObject.SetActive(true);
		} else {
			this.canvasGroup.alpha = 0.5;
			this.statusIndicator.color = ColorUtil.HexToColor("#9C9C9C");
			this.statusText.color = new Color(1, 1, 1, 1);
			this.joinBtn.gameObject.SetActive(false);
		}
	}

	public InitAsSteamFriendWithNoAirshipAccount(steamId: string): void {
		this.userId = `steam:${steamId}`;
		this.hasAirshipAccount = false;
	}

	protected override Start(): void {
		let canvasTransform: Transform | undefined = this.transform;
		while (!this.canvas) {
			canvasTransform = canvasTransform.parent;
			if (!canvasTransform) break; // Couldn't find a canvas parent

			this.canvas = canvasTransform?.GetComponent<Canvas>();
		}
		const canvasScaleFactor = this.canvas?.scaleFactor ?? 1;
		this.rectTransform = this.transform.GetComponent<RectTransform>()!;

		if (Game.IsMobile()) {
			if (this.redirectScroll) {
				this.redirectScroll.enabled = true;
			}
			this.bubbler.enabled = true;
		}

		let cloneObject: GameObject | undefined;
		let cloneRect: RectTransform | undefined;
		if (!Game.IsMobile()) {
			CanvasAPI.OnBeginDragEvent(this.gameObject, (data) => {
				cloneObject = Object.Instantiate(
					this.gameObject,
					this.transform.parent!.parent!.parent?.parent?.parent!,
				);
				cloneRect = cloneObject.GetComponent<RectTransform>()!;

				const image = cloneObject.GetComponent<Image>();
				if (image) {
					// Make image not block raycast (for detecting what we're hovering behind)
					image.raycastTarget = false;
				}
				const button = cloneObject.GetComponent<Button>();
				if (button) {
					// Keep image background
					button.colors.normalColor = new Color(0, 0, 0, 161 / 255);
				}

				cloneRect.sizeDelta = new Vector2(
					this.rectTransform.rect.width,
					(cloneRect!.rect.height = this.rectTransform.rect.height),
				);
				cloneRect.position = this.rectTransform.position;
			});

			this.bin.AddEngineEventConnection(
				CanvasAPI.OnDragEvent(this.gameObject, (data) => {
					if (!cloneRect) return;

					cloneRect!.anchoredPosition = cloneRect!.anchoredPosition.add(data.delta.div(canvasScaleFactor));
				}),
			);

			this.bin.AddEngineEventConnection(
				CanvasAPI.OnEndDragEvent(this.gameObject, () => {
					if (cloneObject) {
						Object.Destroy(cloneObject);
						cloneObject = undefined;
						cloneRect = undefined;
					}
				}),
			);
		}
	}

	protected override OnDestroy(): void {
		this.bin.Clean();
	}
}
