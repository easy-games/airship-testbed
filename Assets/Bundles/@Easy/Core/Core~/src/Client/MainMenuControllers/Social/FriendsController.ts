import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import Object from "@easy-games/unity-object-utils";
import { RightClickMenuController } from "Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Mouse } from "Shared/UserInput";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI, PointerButton } from "Shared/Util/CanvasAPI";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Signal } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { decode, encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { TransferController } from "../Transfer/TransferController";
import { User } from "../User/User";
import { DirectMessageController } from "./DirectMessages/DirectMessageController";
import { FriendStatus } from "./SocketAPI";

@Controller({})
export class FriendsController implements OnStart {
	public friends: User[] = [];
	public incomingFriendRequests: User[] = [];
	public outgoingFriendRequests: User[] = [];
	public friendStatuses: FriendStatus[] = [];
	private renderedFriendUids = new Set<string>();
	private statusText = "";
	private friendBinMap = new Map<string, Bin>();
	public friendStatusChanged = new Signal<FriendStatus>();
	private customGameTitle: string | undefined;

	constructor(
		private readonly authController: AuthController,
		private readonly socketController: SocketController,
		private readonly mainMenuController: MainMenuController,
		private readonly rightClickMenuController: RightClickMenuController,
	) {}

	OnStart(): void {
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		friendsContent.ClearChildren();

		const cachedStatusesRaw = StateManager.GetString("main-menu:friend-statuses");
		if (cachedStatusesRaw) {
			this.friendStatuses = decode(cachedStatusesRaw);
			this.UpdateFriendsList();
		}

		this.authController.WaitForAuthed().then(() => {
			// Game context will send status update when client receives server info.
			if (Game.Context === CoreContext.MAIN_MENU) {
				this.SendStatusUpdate();
			}
			this.FetchFriends();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-requested", (data) => {
			this.FetchFriends();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-accepted", (data) => {
			this.FetchFriends();
			InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/user-status/friends");
		});

		this.socketController.On<FriendStatus[]>("game-coordinator/friend-status-update-multi", (data) => {
			print("friend statuses: " + inspect(data));
			for (const newFriend of data) {
				const existing = this.friendStatuses.find((f) => f.userId === newFriend.userId);
				if (existing) {
					Object.assign(existing, newFriend);
					this.friendStatusChanged.Fire(existing);
				} else {
					this.friendStatuses.push(newFriend);
					this.friendStatusChanged.Fire(newFriend);
				}
			}
			this.UpdateFriendsList();

			const saveRaw = encode(this.friendStatuses);
			StateManager.SetString("main-menu:friend-statuses", saveRaw);
		});

		this.socketController.On("game-coordinator/status-update-request", (data) => {
			this.SendStatusUpdate();
		});

		this.Setup();
	}

	public Setup(): void {
		const statusTextInput = this.mainMenuController.refs.GetValue("Social", "StatusInputField") as TMP_InputField;
		const savedStatus = StateManager.GetString("social:status-text");
		if (savedStatus) {
			this.statusText = savedStatus;
			statusTextInput.text = savedStatus;
		}
		CanvasAPI.OnInputFieldSubmit(statusTextInput.gameObject, (data) => {
			print("update status: " + data);
			this.statusText = data;
			StateManager.SetString("social:status-text", data);
			this.SendStatusUpdate();
			EventSystem.current.ClearSelected();
		});
	}

	public FuzzySearchFriend(name: string): User | undefined {
		return undefined;
	}

	public GetFriendByUsername(username: string): User | undefined {
		return this.friends.find((f) => f.username.lower() === username.lower());
	}

	public SetStatusText(text: string): void {
		this.statusText = text;
	}

	public GetStatusText(): string {
		return this.statusText;
	}

	public SendStatusUpdate(): void {
		const status: Partial<FriendStatus> = {
			userId: Game.LocalPlayer.userId,
			status: Game.Context === CoreContext.GAME ? "in_game" : "online",
			serverId: Game.serverId,
			gameId: Game.gameId,
			metadata: {
				statusText: this.statusText,
				customGameTitle: this.customGameTitle,
			},
		};
		print("Sending status update: " + inspect(status));
		InternalHttpManager.PutAsync(AirshipUrl.GameCoordinator + "/user-status/self", encode(status));
	}

	public FetchFriends(): void {
		const res = InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/friends/requests/self");
		if (!res.success) {
			return;
		}
		const data = decode(res.data) as {
			friends: User[];
			outgoingRequests: User[];
			incomingRequests: User[];
		};
		this.friends = data.friends;
		this.incomingFriendRequests = data.incomingRequests;
		this.outgoingFriendRequests = data.outgoingRequests;

		// auto accept
		for (const user of this.incomingFriendRequests) {
			Task.Spawn(() => {
				const res = HttpManager.PostAsync(
					AirshipUrl.GameCoordinator + "/friends/requests/self",
					encode({
						discriminatedUsername: user.discriminatedUsername,
					}),
					this.authController.GetAuthHeaders(),
				);

				InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/user-status/friends");
			});
		}
	}

	public GetFriendGo(uid: string): GameObject | undefined {
		return this.mainMenuController.refs.GetValue("Social", "FriendsContent").transform.FindChild(uid)?.gameObject;
	}

	public UpdateFriendsList(): void {
		let sorted = this.friendStatuses.sort((a, b) => {
			let aOnline = a.status === "online" || a.status === "in_game";
			let bOnline = b.status === "online" || b.status === "in_game";
			if (aOnline && !bOnline) {
				return true;
			}
			if (!aOnline && bOnline) {
				return false;
			}
			return a.username < b.username;
		});

		const onlineCount = this.friendStatuses.filter((f) => f.status === "online").size();
		const onlineCountText = this.mainMenuController.refs.GetValue("Social", "FriendsOnlineCounter") as TMP_Text;
		onlineCountText.text = `(${onlineCount}/${this.friendStatuses.size()})`;

		const mouse = new Mouse();

		// Add & update
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		let i = 0;
		for (const friend of sorted) {
			const friendBin = new Bin();
			this.friendBinMap.set(friend.userId, friendBin);
			let go: GameObject | undefined = friendsContent.transform.FindChild(friend.userId)?.gameObject;
			let init = false;
			if (go === undefined) {
				go = GameObjectUtil.InstantiateIn(
					AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/MainMenu/Friend.prefab"),
					friendsContent.transform,
				);
				go.name = friend.userId;

				const refs = go.GetComponent<GameObjectReferences>();
				const joinButton = refs.GetValue("UI", "JoinButton");

				this.renderedFriendUids.add(friend.userId);
				init = true;

				CoreUI.SetupButton(go, {
					noHoverSound: true,
				});
				CanvasAPI.OnClickEvent(go, () => {
					print("opening friend " + friend.username);
					Dependency<DirectMessageController>().OpenFriend(friend.userId);
				});
				CanvasAPI.OnPointerEvent(go, (direction, button) => {
					if (button === PointerButton.RIGHT) {
						print("right clicked " + friend.username);
						this.rightClickMenuController.OpenRightClickMenu(
							this.mainMenuController.mainContentCanvas,
							mouse.GetLocation(),
							[
								{
									text: "Invite to Party",
									onClick: () => {
										InternalHttpManager.PostAsync(
											AirshipUrl.GameCoordinator + "/parties/party/invite",
											encode({
												userToAdd: friend.userId,
											}),
										);
									},
								},
								{
									text: "Send Message",
									onClick: () => {
										Dependency<DirectMessageController>().OpenFriend(friend.userId);
									},
								},
								{
									text: "Unfriend",
									onClick: () => {},
								},
							],
						);
					}
				});

				CanvasAPI.OnClickEvent(joinButton, () => {
					Dependency<TransferController>().ClientTransferToServer(friend.gameId, friend.serverId);
				});
			}
			go.transform.SetSiblingIndex(i);

			const refs = go.GetComponent<GameObjectReferences>();
			this.UpdateFriendStatusUI(friend, refs, {
				loadImage: init,
			});
			i++;
		}

		// Remove
		let removed = new Array<string>();
		for (const renderedUid of this.renderedFriendUids) {
			if (this.friendStatuses.find((f) => f.userId === renderedUid) === undefined) {
				const go = friendsContent.transform.FindChild(renderedUid);
				if (go) {
					this.friendBinMap.get(renderedUid)?.Clean();
					this.friendBinMap.delete(renderedUid);
					GameObjectUtil.Destroy(go.gameObject);
					removed.push(renderedUid);
				}
			}
		}
		for (let uid of removed) {
			this.renderedFriendUids.delete(uid);
		}
	}

	public GetFriendStatus(uid: string): FriendStatus | undefined {
		return this.friendStatuses.find((f) => f.userId === uid);
	}

	public UpdateFriendStatusUI(
		friend: FriendStatus,
		refs: GameObjectReferences,
		config: {
			loadImage: boolean;
			includeTag?: boolean;
		},
	): void {
		const username = refs.GetValue("UI", "Username") as TMP_Text;
		const status = refs.GetValue("UI", "Status") as TMP_Text;
		const statusIndicator = refs.GetValue("UI", "StatusIndicator") as Image;
		const profileImage = refs.GetValue("UI", "ProfilePicture") as Image;
		const canvasGroup = refs.gameObject.GetComponent<CanvasGroup>();
		const joinButton = refs.GetValue("UI", "JoinButton");

		if (config.loadImage) {
			const texture = AssetBridge.Instance.LoadAssetIfExists<Texture2D>(
				"@Easy/Core/Shared/Resources/Images/ProfilePictures/Dom.png",
			);
			if (texture !== undefined) {
				profileImage.sprite = Bridge.MakeSprite(texture);
			}
		}

		let displayName = friend.username;
		if (displayName.size() > 16) {
			displayName = displayName.sub(0, 15);
		}
		if (config.includeTag) {
			displayName += "#" + friend.discriminator;
		}
		username.text = displayName;

		if (friend.metadata?.statusText && friend.metadata.statusText !== "") {
			status.text = friend.metadata.statusText;
		} else {
			if (friend.status === "online") {
				status.text = "Online";
			} else if (friend.status === "in_game") {
				status.text = "In Game";
			} else {
				status.text = "Offline";
			}
		}
		if (friend.status === "online") {
			canvasGroup.alpha = 1;
			statusIndicator.color = ColorUtil.HexToColor("#6AFF61");
			status.color = ColorUtil.HexToColor("#0CDF61");
			joinButton.SetActive(false);
		} else if (friend.status === "in_game") {
			canvasGroup.alpha = 1;
			statusIndicator.color = ColorUtil.HexToColor("#70D4FF");
			status.color = ColorUtil.HexToColor("70D4FF");
			status.text = `Playing ${friend.metadata?.customGameTitle ?? "???"}`;
			joinButton.SetActive(true);
		} else {
			canvasGroup.alpha = 0.5;
			statusIndicator.color = ColorUtil.HexToColor("#9C9C9C");
			status.color = new Color(1, 1, 1, 1);
			joinButton.SetActive(false);
		}
	}

	/**
	 * Allows you to include rich presence for your game in the friends sidebar. This replaces "Playing ___" with whatever you want.
	 * Note that the "Playing " will always be prefixed.
	 *
	 * Example: a customGameTitle of "BedWars | Ranked 5v5 - Aztec" will be shown as "Playing BedWars | Ranked 5v5 - Aztec"
	 *
	 * @param customGameTitle The text displayed as the game title.
	 */
	public SetCustomGameTitle(customGameTitle: string | undefined) {
		this.customGameTitle = customGameTitle;
	}
}
