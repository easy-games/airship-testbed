import { Airship } from "@Easy/Core/Shared/Airship";
import {
	AirshipUpdateStatusDto,
	AirshipUser,
	AirshipUserStatusData,
} from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Asset } from "@Easy/Core/Shared/Asset";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import FriendCard from "@Easy/Core/Shared/MainMenu/Components/Friends/FriendCard";
import NoFriendsCardComponent from "@Easy/Core/Shared/MainMenu/Components/Friends/NoFriendsCardComponent";
import SocialFriendRequestsButtonComponent from "@Easy/Core/Shared/MainMenu/Components/SocialFriendRequestsButtonComponent";
import SocialNotificationComponent from "@Easy/Core/Shared/MainMenu/Components/SocialNotificationComponent";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { SocialNotificationType } from "./SocialNotificationType";
import { SteamFriendsProtectedController } from "./SteamFriendsProtectedController";

interface PendingSocialNotification {
	type: SocialNotificationType;
	key: string;
	title: string;
	username: string;
	userId: string;
	extraData: unknown;
}

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ProtectedFriendsController {
	public friends: AirshipUser[] = [];
	public incomingFriendRequests: AirshipUser[] = [];
	public outgoingFriendRequests: AirshipUser[] = [];
	public friendStatuses: AirshipUserStatusData[] = [];
	private renderedFriendUids = new Set<string>();
	private renderedSteamFriendsWithNoAirshipAccountSteamIds = new Set<string>();
	private allFriendCards: FriendCard[] = [];
	private statusText = "";
	private friendBinMap = new Map<string, Bin>();
	public friendStatusChanged = new Signal<AirshipUserStatusData>();
	private customGameTitle: string | undefined;

	private socialNotification!: SocialNotificationComponent;
	private socialNotificationBin = new Bin();
	private friendRequestsButton!: SocialFriendRequestsButtonComponent;
	private socialNotificationKey = "";
	public noFriendsCard: NoFriendsCardComponent;

	public onIncomingFriendRequestsChanged = new Signal<void>();
	public onFetchFriends = new Signal<void>();

	private friendsScrollRect!: ScrollRect;

	public pendingSocialNotifications: PendingSocialNotification[] = [];
	public socialNotificationHandlers = new Map<
		SocialNotificationType,
		(username: string, userId: string, result: boolean, extraData: unknown) => void
	>();

	public statusUpdateContinuationThread: thread | undefined;

	constructor(
		private readonly authController: AuthController,
		private readonly socketController: SocketController,
		private readonly mainMenuController: MainMenuController,
	) {
		contextbridge.callback("FriendsController:SendStatusUpdate", (from) => {
			this.SendStatusUpdateYielding();
		});
	}

	public AddSocialNotification(
		socialNotificationType: SocialNotificationType,
		key: string,
		title: string,
		username: string,
		userId: string,
		extraData: unknown,
	): void {
		const pendingNotif: PendingSocialNotification = {
			type: socialNotificationType,
			key,
			title,
			username,
			userId,
			extraData,
		};
		this.pendingSocialNotifications.push(pendingNotif);

		task.spawn(() => {
			this.CachePendingNotificationsYielding();
		});

		this.socialNotificationBin.Clean();
		this.socialNotificationKey = key;
		this.socialNotification.gameObject.SetActive(false);
		this.socialNotification.gameObject.SetActive(true);

		this.socialNotification.titleText.text = title.upper();
		this.socialNotification.usernameText.text = username;
		this.socialNotification.onResult.Connect((result) => {
			let index = this.pendingSocialNotifications.indexOf(pendingNotif);
			if (index > -1) {
				this.pendingSocialNotifications.remove(index);
			}
			task.spawn(() => {
				this.CachePendingNotificationsYielding();
			});

			const callback = this.socialNotificationHandlers.get(socialNotificationType);
			if (callback === undefined) {
				error("Unable to find callback handler for social notification type: " + socialNotificationType);
			}

			callback(username, userId, result, extraData);
		});

		task.spawn(async () => {
			const texture = await Airship.Players.GetProfilePictureAsync(userId);
			if (texture) {
				this.socialNotification.userImage.texture = texture;
			}
		});
	}

	private CachePendingNotificationsYielding(): void {
		const saveRaw = json.encode(this.pendingSocialNotifications);
		StateManager.SetString("main-menu:social-notifications", saveRaw);
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

		const cachedNotifications = StateManager.GetString("main-menu:social-notifications");
		if (cachedNotifications) {
			let pending: PendingSocialNotification[] = json.decode(cachedNotifications);
			for (let notif of pending) {
				this.AddSocialNotification(
					notif.type,
					notif.key,
					notif.title,
					notif.username,
					notif.userId,
					notif.extraData,
				);
			}
		}

		// Uncomment to re-enable steam guests in friends list
		// if (!Game.IsMobile()) {
		// 	task.spawn(() => {
		// 		SetInterval(
		// 			5,
		// 			() => {
		// 				this.UpdateSteamFriendsWithNoAirshipAccount();
		// 			},
		// 			true,
		// 		);
		// 	});
		// }

		this.authController.WaitForAuthed().then(() => {
			// Game context will send status update when client receives server info.
			if (Game.coreContext === CoreContext.MAIN_MENU) {
				this.SendStatusUpdateYielding();
			}
			this.FetchFriends();
		});

		this.socialNotificationHandlers.set(SocialNotificationType.FriendRequest, (username, userId, result) => {
			if (result) {
				task.spawn(async () => {
					this.socialNotification.gameObject.SetActive(false);
					await this.AcceptFriendRequestAsync(username, userId);
				});
			} else {
				task.spawn(async () => {
					this.socialNotification.gameObject.SetActive(false);
					await this.RejectFriendRequestAsync(userId);
				});
			}
		});

		this.socketController.On<{ initiatorId: string }>("user-service/friend-requested", (data) => {
			print("friend-requested: " + inspect(data));
			this.FetchFriends();
			const foundUser = this.incomingFriendRequests.find((u) => u.uid === data.initiatorId);
			if (foundUser) {
				this.socialNotification.gameObject.SetActive(false);
				this.socialNotification.gameObject.SetActive(true);

				this.socialNotification.usernameText.text = foundUser.username;

				this.AddSocialNotification(
					SocialNotificationType.FriendRequest,
					"friend-request:" + data.initiatorId,
					"Friend Request",
					foundUser.username,
					foundUser.uid,
					{},
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

				AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/FriendRequest.mp33", {
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

		this.socketController.On<AirshipUserStatusData[]>("game-coordinator/friend-status-update-multi", (data) => {
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

	public SetIncomingFriendRequests(friendRequests: AirshipUser[]): void {
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
			Protected.Settings.WaitForSettingsLoaded();
			savedStatus = Protected.Settings.data.statusText;
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

	public FuzzySearchFriend(name: string): AirshipUser | undefined {
		return undefined;
	}

	public GetFriendByUsername(username: string): AirshipUser | undefined {
		return this.friends.find((f) => f.username.lower() === username.lower());
	}

	public GetFriendById(uid: string): AirshipUser | undefined {
		return this.friends.find((u) => u.uid === uid);
	}

	public SetStatusText(text: string): void {
		this.statusText = text;
		StateManager.SetString("social:status-text", text);
		Protected.Settings.data.statusText = text;
		Protected.Settings.MarkAsDirty();
		this.SendStatusUpdateYielding();
	}

	public GetStatusText(): string {
		return this.statusText;
	}

	private CancelActiveStatusUpdateContinuationThread() {
		if (
			this.statusUpdateContinuationThread !== undefined &&
			coroutine.status(this.statusUpdateContinuationThread) !== "dead"
		) {
			task.cancel(this.statusUpdateContinuationThread);
			this.statusUpdateContinuationThread = undefined;
		}
	}

	private CreateNewStatusUpdateContinuationThread(delay: number) {
		// check again to ensure the last set continuation thread sets the delay
		// alongside async boundaries
		this.CancelActiveStatusUpdateContinuationThread();
		this.statusUpdateContinuationThread = task.delay(delay, () => {
			this.statusUpdateContinuationThread = undefined;
			this.SendStatusUpdateYielding();
		});
	}

	public SendStatusUpdateYielding(): void {
		Game.WaitForLocalPlayerLoaded();

		if (Game.IsEditor() && !Game.IsInternal()) {
			return;
		}

		this.CancelActiveStatusUpdateContinuationThread();

		const status: AirshipUpdateStatusDto = {
			status: Game.coreContext === CoreContext.GAME ? "in_game" : "online",
			serverId: Game.serverId,
			gameId: Game.gameId,
			metadata: {
				statusText: this.statusText,
				customGameTitle: Game.gameData?.name,
			},
		};

		try {
			// CoreLogger.Log("send status update: " + json.encode(status));
			const result = client.userStatus.updateUserStatus(status).expect();

			if (result.refreshIn !== undefined) {
				this.CreateNewStatusUpdateContinuationThread(result.refreshIn);
			}
		} catch (err) {
			CoreLogger.Error("Failed to refresh status. Trying again in 1 minute.");
			this.CreateNewStatusUpdateContinuationThread(60);
			return;
		}
	}

	public FetchFriends(): void {
		let result;
		try {
			result = client.friends.getRequests().expect();
		} catch {
			return;
		}

		this.friends = result.friends;
		this.SetIncomingFriendRequests(result.incomingRequests);
		this.outgoingFriendRequests = result.outgoingRequests;
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
		try {
			await client.friends.requestFriendship({ username });
			this.SetIncomingFriendRequests(this.incomingFriendRequests.filter((u) => u.uid !== userId));

			this.FireNotificationKey("friend-request:" + userId);
			return true;
		} catch {
			return false;
		}
	}

	public async RejectFriendRequestAsync(userId: string): Promise<boolean> {
		try {
			await client.friends.terminateFriendship({ uid: userId });
			this.friendStatuses = this.friendStatuses.filter((f) => f.userId !== userId);
			this.UpdateFriendsList();

			this.SetIncomingFriendRequests(this.incomingFriendRequests.filter((u) => u.uid !== userId));

			this.FireNotificationKey("friend-request:" + userId);
			return true;
		} catch {
			return false;
		}
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
		try {
			client.friends.requestFriendship({ username }).expect();
			print("Sent friend request to " + username);
			return true;
		} catch {
			return false;
		}
	}

	public UpdateSteamFriendsWithNoAirshipAccount(): void {
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");

		// Create
		for (let [userId, steamFriend] of Dependency<SteamFriendsProtectedController>().steamFriends) {
			// If they are in the rendered friends list then they have an airship account and we shouldn't render them here.
			if (this.renderedFriendUids.has(userId)) continue;
			if (!steamFriend.online) continue;

			let steamId = userId.split(":steam")[0];
			let go = friendsContent.transform.FindChild(`steam_guest:${steamId}`)?.gameObject;
			let friendCard: FriendCard;
			if (go === undefined) {
				go = Instantiate(
					Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/Friend.prefab"),
					friendsContent.transform,
				) as GameObject;
				go.name = `steam_guest:${steamId}`;

				friendCard = go.GetAirshipComponent<FriendCard>()!;
				friendCard.InitAsSteamFriendWithNoAirshipAccount(steamId);
				friendCard.redirectScroll.redirectTarget = this.friendsScrollRect;
				this.allFriendCards.push(friendCard);

				this.renderedSteamFriendsWithNoAirshipAccountSteamIds.add(steamId);
			} else {
				friendCard = go.GetAirshipComponent<FriendCard>()!;
			}

			friendCard.UpdateSteamFriendWithNoAirshipAccount(steamFriend);
		}

		this.RemoveBadCardsAndSort();
	}

	public UpdateFriendsList(): void {
		const onlineCount = this.friendStatuses.filter((f) => f.status === "online").size();
		const onlineCountText = this.mainMenuController.refs.GetValue("Social", "FriendsOnlineCounter") as TMP_Text;
		onlineCountText.text = `(${onlineCount}/${this.friendStatuses.size()})`;

		// const mainCanvasRect = this.mainMenuController.mainContentCanvas.GetComponent<RectTransform>();

		// uncomment to test with no friends.
		// sorted = [];

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
		for (const friend of this.friendStatuses) {
			const friendBin = new Bin();
			this.friendBinMap.set(friend.userId, friendBin);
			let go: GameObject | undefined = friendsContent.transform.FindChild(friend.userId)?.gameObject;
			let init = false;
			if (go === undefined) {
				go = Instantiate(
					Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/Friend.prefab"),
					friendsContent.transform,
				) as GameObject;
				go.name = friend.userId;

				const friendCard = go.GetAirshipComponent<FriendCard>()!;
				friendCard.InitAsAirshipUser(friend);
				friendCard.redirectScroll.redirectTarget = this.friendsScrollRect;
				this.allFriendCards.push(friendCard);

				this.renderedFriendUids.add(friend.userId);

				init = true;
			}

			const friendCard = go.GetAirshipComponent<FriendCard>()!;
			friendCard.UpdateFriendStatus(friend, {
				loadImage: init,
			});
			i++;
		}

		this.RemoveBadCardsAndSort();
	}

	private RemoveBadCardsAndSort(): void {
		const friendsContent = this.mainMenuController.refs.GetValue("Social", "FriendsContent");

		// Remove steam guests
		{
			let removed = new Array<string>();
			for (const renderedSteamId of this.renderedSteamFriendsWithNoAirshipAccountSteamIds) {
				if (
					this.renderedFriendUids.has(`${renderedSteamId}:steam`) ||
					!Dependency<SteamFriendsProtectedController>().steamFriends.has(`${renderedSteamId}:steam`)
				) {
					const t = friendsContent.transform.FindChild(`steam_guest:${renderedSteamId}`);
					if (t) {
						this.allFriendCards.remove(
							this.allFriendCards.indexOf(t.gameObject.GetAirshipComponent<FriendCard>()!),
						);
						Destroy(t.gameObject);
						removed.push(renderedSteamId);
					}
				}
			}
			for (let steamId of removed) {
				this.renderedSteamFriendsWithNoAirshipAccountSteamIds.delete(steamId);
			}
		}

		// Remove full airship accounts
		{
			let removed = new Array<string>();
			for (const renderedUid of this.renderedFriendUids) {
				if (this.friendStatuses.find((f) => f.userId === renderedUid) === undefined) {
					const t = friendsContent.transform.FindChild(renderedUid);
					if (t) {
						this.friendBinMap.get(renderedUid)?.Clean();
						this.friendBinMap.delete(renderedUid);
						this.allFriendCards.remove(
							this.allFriendCards.indexOf(t.gameObject.GetAirshipComponent<FriendCard>()!),
						);
						Destroy(t.gameObject);
						removed.push(renderedUid);
					}
				}
			}
			for (let uid of removed) {
				this.renderedFriendUids.delete(uid);
			}
		}

		// Sort
		let sorted = this.allFriendCards.sort((a, b) => {
			const GetStatusOrder = (status: "online" | "offline" | "in_game" | "on_steam") => {
				if (status === "in_game") {
					return 4;
				} else if (status === "online") {
					return 3;
				} else if (status === "on_steam") {
					return 2;
				} else {
					return 1;
				}
			};
			let aPrio = GetStatusOrder(a.status);
			let bPrio = GetStatusOrder(b.status);

			if (aPrio === bPrio) {
				return a.username < b.username;
			}

			return aPrio > bPrio;
		});
		for (let i = 0; i < sorted.size(); i++) {
			sorted[i].transform.SetSiblingIndex(i);
		}

		// If no friends display no friends prefab
		if (sorted.size() === 0) {
			this.noFriendsCard.gameObject.SetActive(true);
		} else {
			this.noFriendsCard.gameObject.SetActive(false);
		}
	}

	public GetFriendStatus(uid: string): AirshipUserStatusData | undefined {
		return this.friendStatuses.find((f) => f.userId === uid);
	}

	public UpdateFriendStatusUI(
		friend: AirshipUserStatusData,
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
