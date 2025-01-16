import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers//UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { UserStatus, UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Asset } from "@Easy/Core/Shared/Asset";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import FriendCard from "@Easy/Core/Shared/MainMenu/Components/Friends/FriendCard";
import NoFriendsCardComponent from "@Easy/Core/Shared/MainMenu/Components/Friends/NoFriendsCardComponent";
import SocialFriendRequestsButtonComponent from "@Easy/Core/Shared/MainMenu/Components/SocialFriendRequestsButtonComponent";
import SocialNotificationComponent from "@Easy/Core/Shared/MainMenu/Components/SocialNotificationComponent";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { ProtectedPartyController } from "../Airship/Party/PartyController";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { ClientSettingsController } from "../Settings/ClientSettingsController";
import { SocketController } from "../Socket/SocketController";
import { TransferController } from "../Transfer/TransferController";
import { RightClickMenuButton } from "../UI/RightClickMenu/RightClickMenuButton";
import { User } from "../User/User";
import { DirectMessageController } from "./DirectMessages/DirectMessageController";
import { RetryHttp429 } from "@Easy/Core/Shared/Http/HttpRetry";

@Controller({})
export class ProtectedFriendsController {
	public friends: User[] = [];
	public incomingFriendRequests: User[] = [];
	public outgoingFriendRequests: User[] = [];
	public friendStatuses: UserStatusData[] = [];
	private renderedFriendUids = new Set<string>();
	private statusText = "";
	private friendBinMap = new Map<string, Bin>();
	public friendStatusChanged = new Signal<UserStatusData>();
	private customGameTitle: string | undefined;

	private socialNotification!: SocialNotificationComponent;
	private socialNotificationBin = new Bin();
	private friendRequestsButton!: SocialFriendRequestsButtonComponent;
	private socialNotificationKey = "";
	public noFriendsCard: NoFriendsCardComponent;

	public onIncomingFriendRequestsChanged = new Signal<void>();
	public onFetchFriends = new Signal<void>();

	private friendsScrollRect!: ScrollRect;

	constructor(
		private readonly authController: AuthController,
		private readonly socketController: SocketController,
		private readonly mainMenuController: MainMenuController,
		private readonly rightClickMenuController: RightClickMenuController,
		private readonly clientSettingsController: ClientSettingsController,
	) {
		contextbridge.callback("FriendsController:SendStatusUpdate", (from) => {
			this.SendStatusUpdateYielding();
		});
	}

	public AddSocialNotification(
		key: string,
		title: string,
		username: string,
		onResult: (result: boolean) => void,
	): void {
		this.socialNotificationBin.Clean();
		this.socialNotificationKey = key;
		this.socialNotification.gameObject.SetActive(false);
		this.socialNotification.gameObject.SetActive(true);

		this.socialNotification.titleText.text = title.upper();
		this.socialNotification.usernameText.text = username;
		this.socialNotification.onResult.Connect(onResult);
	}

	public ClearSocialNotification(): void {
		this.socialNotificationBin.Clean();
		this.socialNotificationKey = "";
		this.socialNotification.gameObject.SetActive(false);
	}

	public FireNotificationKey(key: string): void {
		if (key === this.socialNotificationKey) {
			this.ClearSocialNotification();
		}
	}

	protected OnStart(): void {
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		friendsContent.ClearChildren();

		this.friendsScrollRect = this.mainMenuController.refs
			.GetValue("Social", "FriendsScrollViewGO")
			.GetComponent<ScrollRect>()!;

		this.socialNotification = this.mainMenuController.refs
			.GetValue("Social", "SocialNotification")
			.GetAirshipComponent<SocialNotificationComponent>()!;
		this.socialNotification.gameObject.SetActive(false);

		this.friendRequestsButton = this.mainMenuController.refs
			.GetValue("Social", "FriendRequestsButton")
			.GetAirshipComponent<SocialFriendRequestsButtonComponent>()!;
		this.friendRequestsButton.gameObject.SetActive(false);

		this.noFriendsCard = this.mainMenuController.refs
			.GetValue("Social", "NoFriends")
			.GetAirshipComponent<NoFriendsCardComponent>()!;
		this.noFriendsCard.gameObject.SetActive(false);

		const cachedStatusesRaw = StateManager.GetString("main-menu:friend-statuses");
		if (cachedStatusesRaw) {
			this.friendStatuses = json.decode(cachedStatusesRaw);
			this.UpdateFriendsList();
		}

		this.authController.WaitForAuthed().then(() => {
			// Game context will send status update when client receives server info.
			if (Game.coreContext === CoreContext.MAIN_MENU) {
				this.SendStatusUpdateYielding();
			}
			this.FetchFriends();
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-requested", (data) => {
			print("friend-requested: " + inspect(data));
			this.FetchFriends();
			const foundUser = this.incomingFriendRequests.find((u) => u.uid === data.initiatorId);
			if (foundUser) {
				this.socialNotification.gameObject.SetActive(false);
				this.socialNotification.gameObject.SetActive(true);

				this.socialNotification.usernameText.text = foundUser.username;

				task.spawn(async () => {
					const texture = await Airship.Players.GetProfilePictureAsync(foundUser.uid);
					if (texture) {
						this.socialNotification.userImage.texture = texture;
					}
				});

				this.AddSocialNotification(
					"friend-request:" + data.initiatorId,
					"Friend Request",
					foundUser.username,
					(result) => {
						if (result) {
							task.spawn(async () => {
								this.socialNotification.gameObject.SetActive(false);
								await this.AcceptFriendRequestAsync(foundUser.username, foundUser.uid);
							});
						} else {
							task.spawn(async () => {
								this.socialNotification.gameObject.SetActive(false);
								await this.RejectFriendRequestAsync(foundUser.uid);
							});
						}
					},
				);

				// this.socialNotification.bin.Add(
				// 	this.onIncomingFriendRequestsChanged.Connect(() => {
				// 		let found: User | undefined;
				// 		for (const u of this.incomingFriendRequests) {
				// 			if (u.uid === foundUser.uid) {
				// 				found = u;
				// 				break;
				// 			}
				// 		}
				// 		if (!found) {
				// 			this.ClearSocialNotification();
				// 		}
				// 	}),
				// );

				AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/FriendRequest.wav", {
					volumeScale: 0.3,
				});
				if (Game.coreContext === CoreContext.GAME) {
					Game.localPlayer.SendMessage(
						ChatColor.Yellow(foundUser.username) + ChatColor.Gray(" sent you a friend request."),
					);
				}
			}
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-accepted", (data) => {
			this.FetchFriends();
		});

		this.socketController.On<UserStatusData[]>("game-coordinator/friend-status-update-multi", (data) => {
			// print("status updates: " + json.encode(data));
			let lukeOnSteam = data.find((d) => d.usernameLower === "luke_on_steam");
			if (lukeOnSteam) {
				CoreLogger.Log("luke: " + json.encode(lukeOnSteam));
			}

			for (const newFriend of data) {
				const existing = this.friendStatuses.find((f) => f.userId === newFriend.userId);
				if (existing) {
					ObjectUtils.assign(existing, newFriend);
					this.friendStatusChanged.Fire(existing);
				} else {
					this.friendStatuses.push(newFriend);
					this.friendStatusChanged.Fire(newFriend);
				}
			}
			this.UpdateFriendsList();

			const saveRaw = json.encode(this.friendStatuses);
			StateManager.SetString("main-menu:friend-statuses", saveRaw);
		});

		this.socketController.On("game-coordinator/status-update-request", (data) => {
			this.SendStatusUpdateYielding();
		});

		this.Setup();
	}

	public SetIncomingFriendRequests(friendRequests: User[]): void {
		this.incomingFriendRequests = friendRequests;

		const count = friendRequests.size();
		if (count > 0) {
			this.friendRequestsButton.text.text = count + " Request" + (count > 1 ? "s" : "");
			this.friendRequestsButton.gameObject.SetActive(true);
		} else {
			this.friendRequestsButton.gameObject.SetActive(false);
		}
		this.onIncomingFriendRequestsChanged.Fire();
	}

	public Setup(): void {
		const statusTextInput = this.mainMenuController.refs.GetValue("Social", "StatusInputField") as TMP_InputField;
		let savedStatus = StateManager.GetString("social:status-text");
		if (!savedStatus || savedStatus === "") {
			this.clientSettingsController.WaitForSettingsLoaded();
			savedStatus = this.clientSettingsController.data.statusText;
		}
		if (savedStatus) {
			this.SetStatusText(savedStatus);
			statusTextInput.text = savedStatus;
		}
		CanvasAPI.OnInputFieldSubmit(statusTextInput.gameObject, (data) => {
			this.SetStatusText(data);
			EventSystem.current.ClearSelected();
		});
	}

	public FuzzySearchFriend(name: string): User | undefined {
		return undefined;
	}

	public GetFriendByUsername(username: string): User | undefined {
		return this.friends.find((f) => f.username.lower() === username.lower());
	}

	public GetFriendById(uid: string): User | undefined {
		return this.friends.find((u) => u.uid === uid);
	}

	public SetStatusText(text: string): void {
		this.statusText = text;
		StateManager.SetString("social:status-text", text);
		this.clientSettingsController.data.statusText = text;
		this.clientSettingsController.MarkAsDirty();
		this.SendStatusUpdateYielding();
	}

	public GetStatusText(): string {
		return this.statusText;
	}

	public SendStatusUpdateYielding(): void {
		Game.WaitForLocalPlayerLoaded();

		if (Game.IsEditor() && !Game.IsInternal()) {
			return;
		}

		const status: Partial<UserStatusData> = {
			userId: Game.localPlayer.userId,
			status: Game.coreContext === CoreContext.GAME ? UserStatus.IN_GAME : UserStatus.ONLINE,
			serverId: Game.serverId,
			gameId: Game.gameId,
			metadata: {
				statusText: this.statusText,
				customGameTitle: Game.gameData?.name,
			},
		};
		// CoreLogger.Log("send status update: " + json.encode(status));
		RetryHttp429(
			() => InternalHttpManager.PutAsync(AirshipUrl.GameCoordinator + "/user-status/self", json.encode(status)),
			{ retryKey: "put/game-coordinator/user-status/self" },
		).expect();
	}

	public FetchFriends(): void {
		const res = RetryHttp429(
			() => InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/friends/requests/self"),
			{ retryKey: "get/game-coordinator/friends/requests/self" },
		).expect();
		if (!res.success) {
			return;
		}
		const data = json.decode(res.data) as {
			friends: User[];
			outgoingRequests: User[];
			incomingRequests: User[];
		};
		this.friends = data.friends;
		this.SetIncomingFriendRequests(data.incomingRequests);
		this.outgoingFriendRequests = data.outgoingRequests;
		this.onFetchFriends.Fire();

		// print("friends: " + inspect(data));

		// auto decline
		// for (const user of this.incomingFriendRequests) {
		// 	task.spawn(() => {
		// 		// const res = InternalHttpManager.DeleteAsync(AirshipUrl.GameCoordinator + "/friends/uid/" + user.uid);
		// 		// InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/user-status/friends");
		// 	});
		// }

		// auto accept
		// for (const user of this.incomingFriendRequests) {
		// 	Task.Spawn(() => {
		// 		const res = HttpManager.PostAsync(
		// 			AirshipUrl.GameCoordinator + "/friends/requests/self",
		// 			json.encode({
		// 				discriminatedUsername: user.discriminatedUsername,
		// 			}),
		// 			this.authController.GetAuthHeaders(),
		// 		);

		// 		// InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + "/user-status/friends");
		// 	});
		// }
	}

	public async AcceptFriendRequestAsync(username: string, userId: string): Promise<boolean> {
		const res = await RetryHttp429(() => InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/friends/requests/self",
			json.encode({
				username: username,
			}),
		), { retryKey: "post/game-coordinator/friends/requests/self" });

		if (res.success) {
			this.SetIncomingFriendRequests(this.incomingFriendRequests.filter((u) => u.uid !== userId));

			this.FireNotificationKey("friend-request:" + userId);
		}

		return res.success;
	}

	public async RejectFriendRequestAsync(userId: string): Promise<boolean> {
		const res = await RetryHttp429(
			() => InternalHttpManager.DeleteAsync(AirshipUrl.GameCoordinator + "/friends/uid/" + userId),
			{ retryKey: "delete/game-coordinator/friends/uid/:userId" },
		);
		if (res.success) {
			this.friendStatuses = this.friendStatuses.filter((f) => f.userId !== userId);
			this.UpdateFriendsList();

			this.SetIncomingFriendRequests(this.incomingFriendRequests.filter((u) => u.uid !== userId));

			this.FireNotificationKey("friend-request:" + userId);
		}
		return res.success;
	}

	public GetFriendGo(uid: string): GameObject | undefined {
		return this.mainMenuController.refs.GetValue("Social", "FriendsContent").transform.FindChild(uid)?.gameObject;
	}

	public HasOutgoingFriendRequest(userId: string): boolean {
		return this.outgoingFriendRequests.find((f) => f.uid === userId) !== undefined;
	}

	public IsFriendsWith(userId: string): boolean {
		return this.friends.some((u) => u.uid === userId);
	}

	public SendFriendRequest(username: string): boolean {
		print('adding friend: "' + username + '"');
		const res = RetryHttp429(() => InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/friends/requests/self",
			json.encode({
				username: username,
			}),
		), { retryKey: "post/game-coordinator/friends/requests/self" }).expect();
		if (res.success) {
			print("Sent friend request to " + username);
			return true;
		}
		return false;
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

		const mainCanvasRect = this.mainMenuController.mainContentCanvas.GetComponent<RectTransform>();

		// uncomment to test with no friends.
		// sorted = [];

		// If no friends display no friends prefab
		if (sorted.size() === 0) {
			this.noFriendsCard.gameObject.SetActive(true);
		} else {
			this.noFriendsCard.gameObject.SetActive(false);
		}

		// Uncomment to simulate tons of fake friends
		// for (let i = 0; i < 20; i++) {
		// 	const dupe: UserStatusData = {
		// 		...sorted[0],
		// 		userId: "dummy" + i,
		// 	};
		// 	sorted.push(dupe);
		// }

		// Add & update
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");
		let i = 0;
		for (const friend of sorted) {
			const friendBin = new Bin();
			this.friendBinMap.set(friend.userId, friendBin);
			let go: GameObject | undefined = friendsContent.transform.FindChild(friend.userId)?.gameObject;
			let init = false;
			if (go === undefined) {
				go = Object.Instantiate(
					Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/Friend.prefab"),
					friendsContent.transform,
				) as GameObject;

				const friendCard = go.GetAirshipComponent<FriendCard>()!;
				friendCard.friendId = friend.userId;

				go.name = friend.userId;
				const friendRect = go.GetComponent<RectTransform>()!;

				const redirect = go.GetComponent<AirshipRedirectScroll>()!;
				redirect.redirectTarget = this.friendsScrollRect;

				const refs = go.GetComponent<GameObjectReferences>()!;
				const joinButton = refs.GetValue("UI", "JoinButton");

				this.renderedFriendUids.add(friend.userId);
				init = true;

				const Teleport = () => {
					if (friend.status !== UserStatus.IN_GAME) return;
					if (friend.game === undefined || friend.serverId === undefined) return;

					print(
						"Transfering to friend " +
							friend.username +
							". gameId=" +
							friend.gameId +
							", serverId=" +
							friend.serverId,
					);
					Dependency<TransferController>().TransferToGameAsync(friend.gameId, friend.serverId);
				};

				const OpenMenu = () => {
					const options: RightClickMenuButton[] = [];
					if (friend.status !== "offline") {
						if (
							Game.IsMobile() &&
							friend.status === UserStatus.IN_GAME &&
							friend.gameId &&
							friend.serverId
						) {
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
										const res = await RetryHttp429(() => InternalHttpManager.PostAsync(
											AirshipUrl.GameCoordinator + "/parties/party/join",
											json.encode({
												uid: friend.userId,
												// partyId: friend,
											}),
										), { retryKey: "post/game-coordinator/parties/party/join" });
										if (!res.success) {
											Debug.LogError(res.error);
										}
									});
								},
							},
							{
								text: "Invite to Party",
								onClick: () => {
									Dependency<ProtectedPartyController>().InviteToParty(friend.userId);
								},
							},
						);
					}
					if (!Game.IsMobile()) {
						options.push({
							text: "Send Message",
							onClick: () => {
								Dependency<DirectMessageController>().OpenFriend(friend.userId);
							},
						});
					}
					options.push({
						text: "Unfriend",
						onClick: () => {
							task.spawn(() => {
								task.spawn(() => {
									const success = this.RejectFriendRequestAsync(friend.userId);
								});
							});
						},
					});

					// let profilePanelPos = Bridge.ScreenPointToLocalPointInRectangle(
					// 	mainCanvasRect,
					// 	new Vector2(go!.transform.position.x - 5, go!.transform.position.y),
					// );
					// profilePanelPos = profilePanelPos.add(new Vector2(-friendRect.rect.width / 2, friendRect.rect.height / 2));
					// Dependency(ProfilePanelController).OpenProfilePanel(this.mainMenuController.mainContentCanvas, profilePanelPos);
					this.rightClickMenuController.OpenRightClickMenu(
						this.mainMenuController.mainContentCanvas,
						Game.IsMobile()
							? new Vector2(go!.transform.position.x, go!.transform.position.y)
							: Mouse.position,
						options,
					);
				};

				CoreUI.SetupButton(go, {
					noHoverSound: true,
				});
				CanvasAPI.OnClickEvent(go, () => {
					if (Game.IsMobile()) {
						OpenMenu();
					} else {
						Dependency<DirectMessageController>().OpenFriend(friend.userId);
					}
				});

				CanvasAPI.OnPointerEvent(go, (direction, button) => {
					if (button === PointerButton.RIGHT && direction === PointerDirection.UP) {
						OpenMenu();
					}
				});

				CanvasAPI.OnClickEvent(joinButton, () => {
					Teleport();
				});
			}
			go.transform.SetSiblingIndex(i);

			const refs = go.GetComponent<GameObjectReferences>()!;
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

	public GetFriendStatus(uid: string): UserStatusData | undefined {
		return this.friendStatuses.find((f) => f.userId === uid);
	}

	public UpdateFriendStatusUI(
		friend: UserStatusData,
		refs: GameObjectReferences,
		config: {
			loadImage: boolean;
			includeTag?: boolean;
		},
	): void {
		const username = refs.GetValue("UI", "Username") as TMP_Text;
		const status = refs.GetValue("UI", "Status") as TMP_Text;
		const statusIndicator = refs.GetValue("UI", "StatusIndicator") as Image;
		const profileImage = refs.GetValue("UI", "ProfilePicture") as RawImage;
		const canvasGroup = refs.gameObject.GetComponent<CanvasGroup>()!;
		const joinButton = refs.GetValue("UI", "JoinButton");

		if (config.loadImage) {
			task.spawn(async () => {
				const texture = await Airship.Players.GetProfilePictureAsync(friend.userId);
				if (texture) {
					profileImage.texture = texture;
				}
			});
		}

		let displayName = friend.username;
		if (displayName.size() > 16) {
			displayName = displayName.sub(0, 15);
		}
		// if (config.includeTag) {
		// 	displayName += "#" + friend.discriminator;
		// }
		username.text = displayName;

		if (friend.statusText && friend.statusText !== "") {
			status.text = friend.statusText;
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
			status.text = `Playing ${friend.game.name ?? "???"}`;
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
