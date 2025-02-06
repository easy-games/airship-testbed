import { SocketController } from "@Easy/Core/Client/ProtectedControllers//Socket/SocketController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import DirectMessagesWindow from "@Easy/Core/Shared/MainMenu/Components/DirectMessagesWindow";
import PartyChatButton from "@Easy/Core/Shared/MainMenu/Components/PartyChatButton";
import { ClientChatSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/Chat/ClientChatSingleton";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { MainMenuController } from "../../MainMenuController";
import { ProtectedFriendsController } from "../FriendsController";
import { MainMenuPartyController } from "../MainMenuPartyController";
import { DirectMessage } from "./DirectMessage";

@Controller({})
export class DirectMessageController {
	private incomingMessagePrefab = AssetBridge.Instance.LoadAsset(
		"AirshipPackages/@Easy/Core/Prefabs/UI/Messages/IncomingMessage.prefab",
	) as GameObject;
	private outgoingMessagePrefab = AssetBridge.Instance.LoadAsset(
		"AirshipPackages/@Easy/Core/Prefabs/UI/Messages/OutgoingMessage.prefab",
	) as GameObject;
	private messagesMap = new Map<string, Array<DirectMessage>>();
	private unreadMessageCounterMap = new Map<string, number>();

	private windowGo?: GameObject;
	private windowGoRefs?: GameObjectReferences;
	private messagesContentGo?: GameObject;
	private scrollRect?: ScrollRect;
	private offlineNoticeWrapper?: GameObject;
	private offlineNoticeText?: TMP_Text;
	private inputField?: TMP_InputField;
	private openWindowBin = new Bin();
	/**
	 * Either a userId or "party"
	 */
	private openedWindowTarget: string | undefined;
	private doScrollToBottom = 0;
	private inputFieldSelected = false;

	public lastMessagedFriend: UserStatusData | undefined;

	public onDirectMessageReceived = new Signal<DirectMessage>();

	private partyChatButton!: PartyChatButton;
	public onPartyMessageReceived = new Signal<DirectMessage>();
	private partyUnreadMessageCount = 0;

	private xPos = 0;
	private yPos = -479;

	private loadedMessagesFromUserIdFromDisk = new Set<string>();

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly friendsController: ProtectedFriendsController,
		private readonly socketController: SocketController,
		private readonly partyController: MainMenuPartyController,
	) {}

	protected OnStart(): void {
		this.Setup();

		this.socketController.On<DirectMessage>("game-coordinator/direct-message", (data) => {
			let messages = this.messagesMap.get(data.sender);
			if (messages === undefined) {
				messages = [];
				this.messagesMap.set(data.sender, messages);
			}

			messages.push(data);
			this.onDirectMessageReceived.Fire(data);

			// sound
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/MessageReceived.wav", {
				volumeScale: 0.3,
			});

			if (
				this.openedWindowTarget === undefined ||
				this.openedWindowTarget !== data.sender
				// !Application.isFocused
			) {
				this.IncrementUnreadCounter(data.sender, 1);
			}

			// in-game chat
			if (Game.coreContext === CoreContext.GAME) {
				const friend = this.friendsController.GetFriendStatus(data.sender);
				if (!friend) return;

				let text =
					ColorUtil.ColoredText(Theme.pink, "From ") +
					ColorUtil.ColoredText(Theme.white, friend.username) +
					ColorUtil.ColoredText(Theme.gray, ": " + data.text);
				Dependency<ClientChatSingleton>().RenderChatMessage(text);
			}

			if (data.sender !== "") {
				const friend = this.friendsController.GetFriendStatus(data.sender);
				this.lastMessagedFriend = friend;
			}

			StateManager.SetString("direct-messages:" + data.sender, json.encode(messages));
		});

		this.socketController.On<DirectMessage>("game-coordinator/party-message", (data) => {
			const messages = MapUtil.GetOrCreate(this.messagesMap, "party", []);
			messages.push(data);
			this.onPartyMessageReceived.Fire(data);

			if (this.openedWindowTarget !== "party") {
				this.partyUnreadMessageCount++;
				this.partyChatButton.SetUnreadCount(this.partyUnreadMessageCount);
			}

			// sound
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/MessageReceived.wav", {
				volumeScale: 0.3,
			});

			// in-game chat
			if (Game.coreContext === CoreContext.GAME) {
				const member = this.partyController.party?.members.find((u) => u.uid === data.sender);
				if (member) {
					let text =
						ColorUtil.ColoredText(Theme.pink, "[Party] ") +
						ColorUtil.ColoredText(Theme.white, member.username) +
						ColorUtil.ColoredText(Theme.gray, ": " + data.text);
					Dependency<ClientChatSingleton>().RenderChatMessage(text);
				}
			}

			StateManager.SetString("direct-messages:party", json.encode(messages));
		});
	}

	private IncrementUnreadCounter(uid: string, amount: number): void {
		let unread = MapUtil.GetOrCreate(this.unreadMessageCounterMap, uid, 0);
		unread += amount;
		this.unreadMessageCounterMap.set(uid, unread);

		const friendGo = this.friendsController.GetFriendGo(uid);
		if (friendGo) {
			const refs = friendGo.GetComponent<GameObjectReferences>()!;
			const badge = refs.GetValue("UI", "UnreadBadge") as GameObject;
			const badgeText = refs.GetValue("UI", "UnreadBadgeText") as TMP_Text;

			badgeText.text = unread + "";
			badge.SetActive(true);
		}
	}

	public Setup(): void {
		this.windowGo = GameObjectUtil.InstantiateIn(
			AssetBridge.Instance.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/Messages/DirectMessageWindow.prefab"),
			this.mainMenuController.socialMenuGroup.transform,
		);
		this.windowGo.GetComponent<RectTransform>()!.anchoredPosition = new Vector2(this.xPos, this.yPos);

		this.windowGoRefs = this.windowGo.GetComponent<GameObjectReferences>()!;
		this.messagesContentGo = this.windowGoRefs.GetValue("UI", "MessagesContent");
		this.scrollRect = this.windowGoRefs.GetValue("UI", "ScrollRect") as ScrollRect;
		this.offlineNoticeWrapper = this.windowGoRefs.GetValue("UI", "NoticeWrapper");
		this.offlineNoticeText = this.windowGoRefs.GetValue("UI", "NoticeText") as TMP_Text;

		this.partyChatButton = this.mainMenuController.refs
			.GetValue("Social", "PartyChatButton")
			.GetAirshipComponent<PartyChatButton>()!;
		this.partyChatButton.SetUnreadCount(0);

		const closeButton = this.windowGoRefs.GetValue("UI", "CloseButton");
		CoreUI.SetupButton(closeButton);
		CanvasAPI.OnClickEvent(closeButton, () => {
			this.Close();
		});

		this.inputField = this.windowGoRefs!.GetValue("UI", "InputField") as TMP_InputField;
		CanvasAPI.OnInputFieldSubmit(this.inputField.gameObject, (data) => {
			if (this.openedWindowTarget === "party") {
				this.SendPartyMessage(this.inputField!.text);
			} else if (this.openedWindowTarget) {
				this.SendDirectMessage(this.openedWindowTarget, this.inputField!.text);
			}
			this.inputField!.ActivateInputField();
		});
		// clear notifs on select
		CanvasAPI.OnSelectEvent(this.inputField!.gameObject, () => {
			this.inputFieldSelected = true;
			if (this.openedWindowTarget) {
				this.unreadMessageCounterMap.set(this.openedWindowTarget, 0);
				this.ClearUnreadBadge(this.openedWindowTarget);
			}
		});
		CanvasAPI.OnDeselectEvent(this.inputField!.gameObject, () => {
			this.inputFieldSelected = false;
		});
		Keyboard.onKeyDownSignal.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (this.inputFieldSelected) {
				if (
					event.key !== Key.Enter &&
					event.key !== Key.Escape &&
					event.key !== Key.UpArrow &&
					event.key !== Key.DownArrow
				) {
					event.SetCancelled(true);
				}
			}
		});

		const sendButton = this.windowGoRefs!.GetValue("UI", "SendButton");
		CoreUI.SetupButton(sendButton);
		CanvasAPI.OnClickEvent(sendButton, () => {
			if (this.openedWindowTarget === "party") {
				this.SendPartyMessage(this.inputField!.text);
			} else if (this.openedWindowTarget) {
				this.SendDirectMessage(this.openedWindowTarget, this.inputField!.text);
			}
			this.inputField!.ActivateInputField();
		});

		const directMessagesWindow = this.windowGo!.GetAirshipComponent<DirectMessagesWindow>()!;
		this.partyController.onPartyUpdated.Connect((party, oldParty) => {
			directMessagesWindow.UpdatePartyMembers(party?.members ?? []);
			if (!party || party.members.size() <= 1) {
				this.Close();
				return;
			}
			if (party?.partyId !== oldParty?.partyId) {
				this.OpenParty();
			}
		});
	}

	public GetFriendLastMessaged(): UserStatusData | undefined {
		return this.lastMessagedFriend;
	}

	public SendDirectMessage(uid: string, message: string): void {
		const status = this.friendsController.GetFriendStatus(uid);
		if (status === undefined) return;
		if (status.status === "offline") {
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/UI_Error.ogg");
			return;
		}

		if (message === "") return;
		InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/chat/message/direct",
			json.encode({
				target: uid,
				text: message,
			}),
		);
		this.inputField!.text = "";
		const sentMessage: DirectMessage = {
			sender: Game.localPlayer.userId,
			sentAt: os.time(),
			text: message,
		};
		this.GetMessages(uid).push(sentMessage);
		this.RenderChatMessage(sentMessage, true);
		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/SendMessage.ogg", {
			volumeScale: 0.8,
			pitch: 1.5,
		});

		if (Game.coreContext === CoreContext.GAME) {
			let text =
				ColorUtil.ColoredText(Theme.pink, "To ") +
				ColorUtil.ColoredText(Theme.white, status.username) +
				ColorUtil.ColoredText(Theme.gray, ": " + message);
			Dependency<ClientChatSingleton>().RenderChatMessage(text);
		}
	}

	public SendPartyMessage(message: string): void {
		if (message === "") return;
		InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/chat/message/party",
			json.encode({
				text: message,
			}),
		);
		this.inputField!.text = "";
		const sentMessage: DirectMessage = {
			sender: Game.localPlayer.userId,
			sentAt: os.time(),
			text: message,
		};
		this.GetMessages("party").push(sentMessage);
		this.RenderChatMessage(sentMessage, true, true);
		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/SendMessage.ogg", {
			volumeScale: 0.8,
			pitch: 1.5,
		});

		// predict send for sender
		// if (Game.coreContext === CoreContext.GAME) {
		// 	let text =
		// 		ColorUtil.ColoredText(Theme.pink, "[Party] ") +
		// 		ColorUtil.ColoredText(Theme.white, Game.localPlayer.username) +
		// 		ColorUtil.ColoredText(Theme.gray, ": " + message);
		// 	Dependency<ClientChatSingleton>().RenderChatMessage(text);
		// }
	}

	private RenderChatMessage(dm: DirectMessage, receivedWhileOpen: boolean, isParty?: boolean): void {
		let outgoing = dm.sender === Game.localPlayer.userId;

		let messageGo: GameObject;
		if (outgoing) {
			messageGo = Object.Instantiate(this.outgoingMessagePrefab, this.messagesContentGo!.transform);
		} else {
			messageGo = Object.Instantiate(this.incomingMessagePrefab, this.messagesContentGo!.transform);
		}
		const messageRefs = messageGo.GetComponent<GameObjectReferences>()!;
		const text = messageRefs.GetValue("UI", "Text") as TMP_Text;

		if (isParty && !outgoing) {
			const content = messageGo.transform.GetChild(0);
			const profilePictureGo = content.GetChild(0).gameObject;
			task.spawn(async () => {
				const profilePicTex = await Airship.Players.GetProfilePictureAsync(dm.sender);
				if (profilePicTex) {
					profilePictureGo.GetComponent<RawImage>()!.texture = profilePicTex;
				}
				profilePictureGo.SetActive(true);
			});
			content.GetChild(1).gameObject.SetActive(true);

			const member = this.partyController.party?.members.find((u) => u.uid === dm.sender);
			let username = member?.username ?? "Unknown";
			text.text = username + ": " + dm.text;
		} else {
			text.text = dm.text;
		}

		let doScroll = this.scrollRect!.verticalNormalizedPosition <= 0.06;

		Bridge.UpdateLayout(messageGo.transform, true);
		Bridge.UpdateLayout(this.messagesContentGo!.transform, false);

		if (doScroll) {
			this.scrollRect!.velocity = new Vector2(0, 0);
			this.scrollRect!.verticalNormalizedPosition = 0;
		}
	}

	public UpdateOfflineNotice(friendStatus: UserStatusData): void {
		if (friendStatus.status !== "offline") {
			this.offlineNoticeWrapper?.SetActive(false);
		} else {
			this.offlineNoticeText!.text = `${friendStatus.username} is offline and cannot be messaged.`;
			this.offlineNoticeWrapper?.SetActive(true);
		}
	}

	public OpenFriend(uid: string): void {
		if (Game.IsMobile()) return;
		this.openWindowBin.Clean();
		this.openedWindowTarget = uid;

		this.openWindowBin.Add(
			this.onDirectMessageReceived.Connect((dm) => {
				if (dm.sender === uid) {
					this.RenderChatMessage(dm, true);
				}
			}),
		);
		this.openWindowBin.Add(
			this.friendsController.friendStatusChanged.Connect((status) => {
				if (status.userId === uid) {
					this.UpdateOfflineNotice(status);
					this.friendsController.UpdateFriendStatusUI(status, headerUserRefs, {
						loadImage: true,
						includeTag: true,
					});
				}
			}),
		);

		const headerUserRefs = this.windowGoRefs?.GetValue("UI", "HeaderUserRefs") as GameObjectReferences;
		let friendStatus = this.friendsController.GetFriendStatus(uid);
		if (!friendStatus) {
			Debug.LogError("Failed to find friend status.");
			return;
		}

		this.friendsController.UpdateFriendStatusUI(friendStatus, headerUserRefs, {
			loadImage: true,
			includeTag: true,
		});

		const directMessagesWindow = this.windowGo!.GetAirshipComponent<DirectMessagesWindow>()!;
		directMessagesWindow.InitAsFriendChat(friendStatus);

		let messages = this.GetMessages(uid);
		for (const dm of messages) {
			this.RenderChatMessage(dm, false);
		}

		// clear notifs
		this.unreadMessageCounterMap.set(uid, 0);
		this.ClearUnreadBadge(uid);

		this.UpdateOfflineNotice(friendStatus);
	}

	public OpenParty() {
		if (Game.IsMobile()) return;

		this.openWindowBin.Clean();
		this.openedWindowTarget = "party";

		this.openWindowBin.Add(
			this.onPartyMessageReceived.Connect((dm) => {
				if (dm.sender === Game.localPlayer.userId) return;
				this.RenderChatMessage(dm, true, true);
			}),
		);

		const directMessagesWindow = this.windowGo!.GetAirshipComponent<DirectMessagesWindow>()!;
		const members = this.partyController.party?.members;
		directMessagesWindow.InitAsPartyChat(members ?? []);

		let messages = this.GetMessages("party");
		for (let msg of messages) {
			this.RenderChatMessage(msg, false, true);
		}

		this.partyChatButton.SetUnreadCount(0);
	}

	private ClearUnreadBadge(uid: string): void {
		const friendGo = this.friendsController.GetFriendGo(uid);
		if (friendGo) {
			friendGo.GetComponent<GameObjectReferences>()!.GetValue("UI", "UnreadBadge").SetActive(false);
		}
	}

	private GetMessages(uid: string): Array<DirectMessage> {
		if (!this.loadedMessagesFromUserIdFromDisk.has(uid)) {
			this.loadedMessagesFromUserIdFromDisk.add(uid);
			const raw = StateManager.GetString("direct-messages:" + uid);
			if (raw) {
				const messages = json.decode<Array<DirectMessage>>(raw);
				this.messagesMap.set(uid, messages);
				return messages;
			}
		}

		return MapUtil.GetOrCreate(this.messagesMap, uid, []);
	}

	public Close(): void {
		if (this.windowGo)
			NativeTween.AnchoredPositionY(this.windowGo.transform, this.yPos, 0.1).SetUseUnscaledTime(true);
		this.openedWindowTarget = undefined;
	}
}
