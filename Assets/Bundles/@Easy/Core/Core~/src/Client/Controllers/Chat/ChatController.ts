import { Controller, OnStart } from "@easy-games/flamework-core";
import { DirectMessageController } from "Client/MainMenuControllers/Social/DirectMessages/DirectMessageController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { SocketController } from "Client/MainMenuControllers/Socket/SocketController";
import { Airship } from "Shared/Airship";
import { AudioManager } from "Shared/Audio/AudioManager";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ClearCommand } from "Shared/Commands/ClearCommand";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Player } from "Shared/Player/Player";
import { CoreSound } from "Shared/Sound/CoreSound";
import { Keyboard, Mouse } from "Shared/UserInput";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { ChatUtil } from "Shared/Util/ChatUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { SetInterval, SetTimeout } from "Shared/Util/Timer";
import { LocalEntityController } from "../Character/LocalEntityController";
import { CoreUIController } from "../UI/CoreUIController";
import { MessageCommand } from "./ClientCommands/MessageCommand";
import { ReplyCommand } from "./ClientCommands/ReplyCommand";

class ChatMessageElement {
	public canvasGroup: CanvasGroup;
	public shownAt = os.clock();
	public shown = true;
	private hideBin = new Bin();

	constructor(public readonly gameObject: GameObject, public time: number) {
		this.canvasGroup = gameObject.GetComponent<CanvasGroup>();
	}

	public Hide(): void {
		if (!this.shown) return;
		this.shown = false;
		const t = this.canvasGroup.TweenCanvasGroupAlpha(0, 0.2);
		this.hideBin.Add(() => {
			if (!t.IsDestroyed()) {
				t.Cancel();
			}
		});
	}

	public Show(): void {
		this.shownAt = os.clock();
		if (this.shown) return;
		this.shown = true;
		this.hideBin.Clean();
		this.canvasGroup.alpha = 1;
	}

	public Destroy(): void {
		this.Hide();
		SetTimeout(1, () => {
			Object.Destroy(this.gameObject);
		});
	}
}

@Controller({})
export class ChatController implements OnStart {
	private content: GameObject;
	private chatMessagePrefab: Object;
	private inputField: TMP_InputField;

	private selected = false;
	private selectedBin = new Bin();

	private chatMessageElements: ChatMessageElement[] = [];

	private prevSentMessages: string[] = [];
	private historyIndex = -1;

	private commands = new Map<string, ChatCommand>();
	private lastChatMessageRenderedTime = Time.time;

	constructor(
		private readonly localEntityController: LocalEntityController,
		private readonly coreUIController: CoreUIController,
		private readonly socketController: SocketController,
		private readonly directMessageController: DirectMessageController,
		private readonly friendsController: FriendsController,
	) {
		const refs = this.coreUIController.refs.GetValue("Apps", "Chat").GetComponent<GameObjectReferences>();
		this.content = refs.GetValue("UI", "Content");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.content.gameObject.ClearChildren();

		this.RegisterCommand(new ClearCommand());
		this.RegisterCommand(new MessageCommand());
		this.RegisterCommand(new ReplyCommand());
	}

	public RegisterCommand(command: ChatCommand) {
		this.commands.set(command.commandLabel.lower(), command);
		for (let alias of command.aliases) {
			this.commands.set(alias.lower(), command);
		}
	}

	public IsOpen(): boolean {
		return this.selected;
	}

	OnStart(): void {
		CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((text, senderClientId) => {
			let sender: Player | undefined;
			if (senderClientId !== undefined) {
				sender = Airship.players.FindByClientId(senderClientId);
			}
			this.RenderChatMessage(text, sender);
		});

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(
			KeyCode.Return,
			(event) => {
				if (EventSystem.current.currentSelectedGameObject && !this.selected) return;
				if (this.selected) {
					if (this.inputField.text === "") {
						EventSystem.current.ClearSelected();
						return;
					}
					this.SubmitInputField();
					event.SetCancelled(true);
				} else {
					if (AppManager.IsOpen()) return;
					this.inputField.Select();
				}
			},
			SignalPriority.HIGH,
		);
		keyboard.OnKeyDown(
			KeyCode.Escape,
			(event) => {
				if (this.selected) {
					EventSystem.current.ClearSelected();
					this.inputField.text = "";
					event.SetCancelled(true);
				}
			},
			SignalPriority.HIGHEST,
		);
		keyboard.OnKeyDown(
			KeyCode.Slash,
			(event) => {
				if (EventSystem.current.currentSelectedGameObject && !this.selected) return;
				if (!this.selected) {
					this.inputField.text = "/";
					this.inputField.caretPosition = 1;
					this.inputField.Select();
				}
			},
			SignalPriority.HIGH,
		);
		keyboard.OnKeyDown(KeyCode.UpArrow, (event) => {
			if (this.IsChatFocused()) {
				if (this.historyIndex + 1 < this.prevSentMessages.size()) {
					this.historyIndex++;
					let msg = this.prevSentMessages[this.historyIndex];
					this.inputField.SetTextWithoutNotify(msg);
					this.inputField.caretPosition = msg.size();
				}
			}
		});
		keyboard.OnKeyDown(KeyCode.DownArrow, (event) => {
			if (this.IsChatFocused()) {
				if (this.historyIndex - 1 >= -1) {
					this.historyIndex--;
					let msg: string;
					if (this.historyIndex === -1) {
						msg = "";
					} else {
						msg = this.prevSentMessages[this.historyIndex];
					}
					this.inputField.SetTextWithoutNotify(msg);
					this.inputField.caretPosition = msg.size();
				}
			}
		});

		// Sink key events when selected:
		keyboard.anyKeyDown.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (this.selected) {
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

		const mouse = new Mouse();
		CanvasAPI.OnSelectEvent(this.inputField.gameObject, () => {
			this.selected = true;
			this.historyIndex = -1;
			const entityInputDisabler = this.localEntityController.GetEntityInput()?.AddDisabler();
			if (entityInputDisabler !== undefined) {
				this.selectedBin.Add(entityInputDisabler);
			}
			const mouseLocker = mouse.AddUnlocker();
			this.selectedBin.Add(() => {
				mouse.RemoveUnlocker(mouseLocker);
			});
			this.CheckIfShouldHide();
		});

		CanvasAPI.OnDeselectEvent(this.inputField.gameObject, () => {
			this.selectedBin.Clean();
			this.selected = false;
			this.CheckIfShouldHide();
		});

		SetInterval(0.5, () => {
			this.CheckIfShouldHide();
		});
	}

	private CheckIfShouldHide(): void {
		if (this.IsChatFocused()) {
			for (const element of this.chatMessageElements) {
				element.Show();
			}
		} else {
			for (const element of this.chatMessageElements) {
				if (os.clock() - element.time > 10) {
					element.Hide();
				}
			}
		}
	}

	public ShowAllChatMessages(): void {
		for (const element of this.chatMessageElements) {
			element.Show();
		}
	}

	public SubmitInputField(): void {
		let text = this.inputField.text;
		this.SendChatMessage(text);
		this.inputField.SetTextWithoutNotify("");
		EventSystem.current.ClearSelected();
	}

	public SendChatMessage(message: string): void {
		this.prevSentMessages.unshift(message);
		if (this.prevSentMessages.size() > 50) {
			this.prevSentMessages.pop();
		}

		const commandData = ChatUtil.ParseCommandData(message);

		let sendChatToServer = true;

		if (commandData) {
			const command = this.commands.get(commandData.label);
			if (command) {
				command.Execute(Game.localPlayer, commandData.args);
				sendChatToServer = false;
			}
		}

		if (sendChatToServer) {
			CoreNetwork.ClientToServer.SendChatMessage.client.FireServer(message);
		}
	}

	public RenderChatMessage(message: string, sender?: Player): void {
		try {
			const chatMessage = GameObjectUtil.InstantiateIn(this.chatMessagePrefab, this.content.transform);
			const refs = chatMessage.GetComponent<GameObjectReferences>();

			const textGui = refs.GetValue<TextMeshProUGUI>("UI", "Text");
			textGui.text = message;

			const profileImage = refs.GetValue<Image>("UI", "ProfilePicture");
			const playerProfilePic = sender?.GetProfilePicture();
			if (playerProfilePic) {
				profileImage.sprite = Bridge.MakeSprite(AssetBridge.Instance.LoadAsset(playerProfilePic.path));
			} else {
				profileImage.gameObject.SetActive(false);
			}

			const element = new ChatMessageElement(chatMessage, os.clock());
			this.chatMessageElements.push(element);

			if (Time.time > this.lastChatMessageRenderedTime) {
				AudioManager.PlayGlobal(CoreSound.chatMessageReceived, {
					volumeScale: 0.24,
				});
			}
			this.lastChatMessageRenderedTime = Time.time;
		} catch (err) {
			Debug.LogError("chat error:");
			Debug.LogError(err);
		}
	}

	public ClearChatMessages(): void {
		try {
			this.chatMessageElements.forEach((element) => {
				element.Destroy();
			});

			this.chatMessageElements.clear();
		} catch (err) {
			Debug.LogError("chat error:");
			Debug.LogError(err);
		}
	}

	public IsChatFocused(): boolean {
		return this.selected;
	}
}
