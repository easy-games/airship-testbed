import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ChatController } from "Client/Controllers/Chat/ChatController";
import { AuthController } from "Client/MainMenuControllers/Auth/AuthController";
import { SocketController } from "Client/MainMenuControllers/Socket/SocketController";
import { AudioManager } from "Shared/Audio/AudioManager";
import { CoreContext } from "Shared/CoreClientContext";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Keyboard } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { MapUtil } from "Shared/Util/MapUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { Theme } from "Shared/Util/Theme";
import { decode, encode } from "Shared/json";
import { MainMenuController } from "../../MainMenuController";
import { FriendsController } from "../FriendsController";
import { FriendStatus } from "../SocketAPI";
import { DirectMessage } from "./DirectMessage";

@Controller({})
export class DirectMessageController implements OnStart {
	private incomingMessagePrefab = AssetBridge.Instance.LoadAsset(
		"@Easy/Core/Shared/Resources/Prefabs/UI/Messages/IncomingMessage.prefab",
	) as GameObject;
	private outgoingMessagePrefab = AssetBridge.Instance.LoadAsset(
		"@Easy/Core/Shared/Resources/Prefabs/UI/Messages/OutgoingMessage.prefab",
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
	private openedWindowUserId: string | undefined;
	private doScrollToBottom = 0;
	private inputFieldSelected = false;

	public lastMessagedFriend: FriendStatus | undefined;

	public onDirectMessageReceived = new Signal<DirectMessage>();

	private xPos = -320;
	private yPos = -280;

	private loadedMessagesFromUserIdFromDisk = new Set<string>();

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly friendsController: FriendsController,
		private readonly authController: AuthController,
		private readonly socketController: SocketController,
	) {}

	OnStart(): void {
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
			AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/MessageReceived.wav", {
				volumeScale: 0.3,
			});

			if (
				this.openedWindowUserId === undefined ||
				this.openedWindowUserId !== data.sender
				// !Application.isFocused
			) {
				this.IncrementUnreadCounter(data.sender, 1);
			}

			// in-game chat
			if (Game.Context === CoreContext.GAME) {
				const friend = this.friendsController.GetFriendStatus(data.sender);
				if (!friend) return;

				let text =
					ColorUtil.ColoredText(Theme.Pink, "From ") +
					ColorUtil.ColoredText(Theme.White, friend.username) +
					ColorUtil.ColoredText(Theme.Gray, ": " + data.text);
				Dependency<ChatController>().RenderChatMessage(text);
			}

			if (data.sender !== "") {
				const friend = this.friendsController.GetFriendStatus(data.sender);
				this.lastMessagedFriend = friend;
			}

			StateManager.SetString("direct-messages:" + data.sender, encode(messages));
		});
	}

	private IncrementUnreadCounter(uid: string, amount: number): void {
		let unread = MapUtil.GetOrCreate(this.unreadMessageCounterMap, uid, 0);
		unread += amount;
		this.unreadMessageCounterMap.set(uid, unread);

		const friendGo = this.friendsController.GetFriendGo(uid);
		if (friendGo) {
			const refs = friendGo.GetComponent<GameObjectReferences>();
			const badge = refs.GetValue("UI", "UnreadBadge") as GameObject;
			const badgeText = refs.GetValue("UI", "UnreadBadgeText") as TMP_Text;

			badgeText.text = unread + "";
			badge.SetActive(true);
		}
	}

	public Setup(): void {
		this.windowGo = GameObjectUtil.InstantiateIn(
			AssetBridge.Instance.LoadAsset(
				"@Easy/Core/Shared/Resources/Prefabs/UI/Messages/DirectMessageWindow.prefab",
			),
			this.mainMenuController.socialMenuCanvas.transform.GetChild(0),
		);
		this.windowGo.GetComponent<RectTransform>().anchoredPosition = new Vector2(this.xPos, this.yPos);

		this.windowGoRefs = this.windowGo.GetComponent<GameObjectReferences>();
		this.messagesContentGo = this.windowGoRefs.GetValue("UI", "MessagesContent");
		this.scrollRect = this.windowGoRefs.GetValue("UI", "ScrollRect") as ScrollRect;
		this.offlineNoticeWrapper = this.windowGoRefs.GetValue("UI", "NoticeWrapper");
		this.offlineNoticeText = this.windowGoRefs.GetValue("UI", "NoticeText") as TMP_Text;

		const closeButton = this.windowGoRefs.GetValue("UI", "CloseButton");
		CoreUI.SetupButton(closeButton);
		CanvasAPI.OnClickEvent(closeButton, () => {
			this.Close();
		});

		this.inputField = this.windowGoRefs!.GetValue("UI", "InputField") as TMP_InputField;
		CanvasAPI.OnInputFieldSubmit(this.inputField.gameObject, (data) => {
			if (this.openedWindowUserId) {
				this.SendDirectMessage(this.openedWindowUserId, this.inputField!.text);
			}
			this.inputField!.ActivateInputField();
		});
		// clear notifs on select
		CanvasAPI.OnSelectEvent(this.inputField!.gameObject, () => {
			this.inputFieldSelected = true;
			print("input field selected.");
			if (this.openedWindowUserId) {
				this.unreadMessageCounterMap.set(this.openedWindowUserId, 0);
				this.ClearUnreadBadge(this.openedWindowUserId);
			}
		});
		CanvasAPI.OnDeselectEvent(this.inputField!.gameObject, () => {
			this.inputFieldSelected = false;
		});
		const keyboard = new Keyboard();
		keyboard.AnyKeyDown.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (this.inputFieldSelected) {
				if (
					event.keyCode !== KeyCode.Return &&
					event.keyCode !== KeyCode.Escape &&
					event.keyCode !== KeyCode.UpArrow &&
					event.keyCode !== KeyCode.DownArrow
				) {
					event.SetCancelled(true);
				}
			}
		});

		const sendButton = this.windowGoRefs!.GetValue("UI", "SendButton");
		CoreUI.SetupButton(sendButton);
		CanvasAPI.OnClickEvent(sendButton, () => {
			if (this.openedWindowUserId) {
				this.SendDirectMessage(this.openedWindowUserId, this.inputField!.text);
			}
			this.inputField!.ActivateInputField();
		});
	}

	public GetFriendLastMessaged(): FriendStatus | undefined {
		return this.lastMessagedFriend;
	}

	public SendDirectMessage(uid: string, message: string): void {
		const status = this.friendsController.GetFriendStatus(uid);
		if (status === undefined) return;
		if (status.status === "offline") {
			AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/UI_Error.wav");
			return;
		}

		if (message === "") return;
		this.socketController.Emit("send-direct-message", {
			target: uid,
			text: message,
		});
		this.inputField!.text = "";
		const sentMessage: DirectMessage = {
			sender: Game.LocalPlayer.userId,
			sentAt: os.time(),
			text: message,
		};
		this.GetMessages(uid).push(sentMessage);
		this.RenderChatMessage(sentMessage, true);
		AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/SendMessage.ogg", {
			volumeScale: 0.8,
			pitch: 1.5,
		});

		if (Game.Context === CoreContext.GAME) {
			let text =
				ColorUtil.ColoredText(Theme.Pink, "To ") +
				ColorUtil.ColoredText(Theme.White, status.username) +
				ColorUtil.ColoredText(Theme.Gray, ": " + message);
			Dependency<ChatController>().RenderChatMessage(text);
		}
	}

	private RenderChatMessage(dm: DirectMessage, receivedWhileOpen: boolean): void {
		let outgoing = dm.sender === Game.LocalPlayer.userId;

		let messageGo: GameObject;
		if (outgoing) {
			messageGo = GameObjectUtil.InstantiateIn(this.outgoingMessagePrefab, this.messagesContentGo!.transform);
		} else {
			messageGo = GameObjectUtil.InstantiateIn(this.incomingMessagePrefab, this.messagesContentGo!.transform);
		}
		const messageRefs = messageGo.GetComponent<GameObjectReferences>();
		const text = messageRefs.GetValue("UI", "Text") as TMP_Text;
		text.text = dm.text;

		let doScroll = this.scrollRect!.verticalNormalizedPosition <= 0.06;

		Bridge.UpdateLayout(messageGo.transform, true);
		Bridge.UpdateLayout(this.messagesContentGo!.transform, false);

		if (doScroll) {
			this.scrollRect!.velocity = new Vector2(0, 0);
			this.scrollRect!.verticalNormalizedPosition = 0;
		}
	}

	public UpdateOfflineNotice(friendStatus: FriendStatus): void {
		if (friendStatus.status !== "offline") {
			this.offlineNoticeWrapper?.SetActive(false);
		} else {
			this.offlineNoticeText!.text = `${friendStatus.username} is offline and cannot be messaged.`;
			this.offlineNoticeWrapper?.SetActive(true);
		}
	}

	public OpenFriend(uid: string): void {
		print("open.1");
		this.openWindowBin.Clean();
		this.openedWindowUserId = uid;

		let messages = this.GetMessages(uid);

		this.messagesContentGo!.ClearChildren();

		print("open.2");
		for (const dm of messages) {
			this.RenderChatMessage(dm, false);
		}
		print("open.3");
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

		print("open.4");
		const headerUserRefs = this.windowGoRefs?.GetValue("UI", "HeaderUserRefs") as GameObjectReferences;
		let friendStatus = this.friendsController.GetFriendStatus(uid);
		if (!friendStatus) {
			Debug.LogError("Failed to find friend status.");
			return;
		}
		print("open.5");

		this.friendsController.UpdateFriendStatusUI(friendStatus, headerUserRefs, {
			loadImage: true,
			includeTag: true,
		});

		print("tween");
		this.windowGo!.GetComponent<RectTransform>().TweenAnchoredPositionY(0, 0.1);
		// this.windowGo!.transform.TweenLocalPositionY(0, 0.1);

		Bridge.UpdateLayout(this.messagesContentGo!.transform, false);
		this.scrollRect!.velocity = new Vector2(0, 0);
		this.scrollRect!.verticalNormalizedPosition = 0;

		this.inputField!.ActivateInputField();

		// clear notifs
		this.unreadMessageCounterMap.set(uid, 0);
		this.ClearUnreadBadge(uid);

		this.UpdateOfflineNotice(friendStatus);
	}

	private ClearUnreadBadge(uid: string): void {
		const friendGo = this.friendsController.GetFriendGo(uid);
		if (friendGo) {
			friendGo.GetComponent<GameObjectReferences>().GetValue("UI", "UnreadBadge").SetActive(false);
		}
	}

	private GetMessages(uid: string): Array<DirectMessage> {
		if (!this.loadedMessagesFromUserIdFromDisk.has(uid)) {
			this.loadedMessagesFromUserIdFromDisk.add(uid);
			const raw = StateManager.GetString("direct-messages:" + uid);
			if (raw) {
				const messages = decode<Array<DirectMessage>>(raw);
				this.messagesMap.set(uid, messages);
				return messages;
			}
		}

		return MapUtil.GetOrCreate(this.messagesMap, uid, []);
	}

	public Close(): void {
		this.windowGo?.transform.TweenAnchoredPositionY(this.yPos, 0.1);
		this.openedWindowUserId = undefined;
	}
}
