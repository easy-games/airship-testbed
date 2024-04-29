import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { DirectMessageController } from "Client/MainMenuControllers/Social/DirectMessages/DirectMessageController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { SocketController } from "Client/MainMenuControllers/Socket/SocketController";
import { Airship } from "Shared/Airship";
import { AudioManager } from "Shared/Audio/AudioManager";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ClearCommand } from "Shared/Commands/ClearCommand";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Controller, Dependency, OnStart } from "Shared/Flamework";
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
import { LocalCharacterSingleton } from "../../../Shared/Character/LocalCharacter/LocalCharacterSingleton";
import { MainMenuBlockSingleton } from "../../MainMenuControllers/Settings/MainMenuBlockSingleton";
import { CoreUIController } from "../UI/CoreUIController";
import { MessageCommand } from "./ClientCommands/MessageCommand";
import { ReplyCommand } from "./ClientCommands/ReplyCommand";

class ChatMessageElement {
	public canvasGroup: CanvasGroup;
	public shownAt = os.clock();
	public shown = true;
	private hideBin = new Bin();

	constructor(
		public readonly gameObject: GameObject,
		public time: number,
	) {
		this.canvasGroup = gameObject.GetComponent<CanvasGroup>()!;
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
	public canvas!: Canvas;
	private content: GameObject;
	private wrapper: GameObject;
	private chatMessagePrefab: Object;
	private inputField: TMP_InputField;
	private inputWrapperImage: Image;

	private selected = false;
	private selectedBin = new Bin();

	private chatMessageElements: ChatMessageElement[] = [];

	private prevSentMessages: string[] = [];
	private historyIndex = -1;

	private commands = new Map<string, ChatCommand>();
	private lastChatMessageRenderedTime = Time.time;

	constructor(
		private readonly localEntityController: LocalCharacterSingleton,
		private readonly coreUIController: CoreUIController,
		private readonly socketController: SocketController,
		private readonly directMessageController: DirectMessageController,
		private readonly friendsController: FriendsController,
	) {
		const refs = this.coreUIController.refs.GetValue("Apps", "Chat").GetComponent<GameObjectReferences>()!;
		this.canvas = refs.GetValue("UI", "Canvas").GetComponent<Canvas>()!;
		this.content = refs.GetValue("UI", "Content");
		this.wrapper = refs.GetValue("UI", "Wrapper");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.inputWrapperImage = refs.GetValue("UI", "Input").GetComponent<Image>()!;
		this.content.gameObject.ClearChildren();

		Dependency<MainMenuSingleton>().ObserveScreenSize((st, size) => {
			if (Game.IsMobile()) {
				const scaler = this.canvas.GetComponent<CanvasScaler>()!;
				scaler.uiScaleMode = ScaleMode.ConstantPixelSize;
				scaler.scaleFactor = Game.GetScaleFactor();
				const wrapperRect = this.wrapper.GetComponent<RectTransform>()!;

				if (Game.deviceType === AirshipDeviceType.Phone) {
					wrapperRect.anchorMin = new Vector2(0, 0);
					wrapperRect.anchorMax = new Vector2(0, 1);
					wrapperRect.pivot = new Vector2(0, 1);
					wrapperRect.offsetMin = new Vector2(wrapperRect.offsetMin.x, 216);
				} else {
					wrapperRect.anchorMax = new Vector2(0, 1);
					wrapperRect.anchorMin = new Vector2(0, 0.55);
					wrapperRect.pivot = new Vector2(0, 1);
					wrapperRect.offsetMin = new Vector2(wrapperRect.offsetMin.x, 0);
					// wrapperRect.offsetMax = new Vector2(0, 0);
					// wrapperRect.offsetMin = new Vector2(0, 0);
				}
				wrapperRect.anchoredPosition = new Vector2(121, -14);
			} else {
				const wrapperRect = this.wrapper.GetComponent<RectTransform>()!;
				const wrapperImg = wrapperRect.GetComponent<Image>()!;
				wrapperImg.color = new Color(0, 0, 0, 0);
			}
		});

		this.RegisterCommand(new ClearCommand());
		this.RegisterCommand(new MessageCommand());
		this.RegisterCommand(new ReplyCommand());

		if (Game.IsMobile()) {
			this.canvas.enabled = false;
		} else {
			this.wrapper.GetComponent<Mask>()!.enabled = false;
		}
	}

	public OpenMobile(): void {
		this.canvas.enabled = true;
	}

	public HideMobile(): void {
		this.canvas.enabled = false;
	}

	public IsOpenMobile(): boolean {
		return this.canvas.enabled;
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
		CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((rawText, nameWithPrefix, senderClientId) => {
			let sender: Player | undefined;
			if (senderClientId !== undefined) {
				sender = Airship.players.FindByClientId(senderClientId);
				if (sender) {
					if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(sender.userId)) {
						return;
					}
				}
			}
			let text = rawText;
			if (nameWithPrefix) {
				text = nameWithPrefix + rawText;
			}
			this.RenderChatMessage(text, sender);
		});

		const keyboard = new Keyboard();

		// Submitting on mobile.
		CanvasAPI.OnInputFieldSubmit(this.inputField.gameObject, (data) => {
			this.SubmitInputField();
		});

		// Submitting on desktop.
		// We cancel the form submit so the input field doesn't auto deselect.
		keyboard.OnKeyDown(
			Key.Enter,
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
			Key.Escape,
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
			Key.Slash,
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
		keyboard.OnKeyDown(Key.UpArrow, (event) => {
			if (this.IsChatFocused()) {
				if (this.historyIndex + 1 < this.prevSentMessages.size()) {
					this.historyIndex++;
					let msg = this.prevSentMessages[this.historyIndex];
					this.inputField.SetTextWithoutNotify(msg);
					this.inputField.caretPosition = msg.size();
				}
			}
		});
		keyboard.OnKeyDown(Key.DownArrow, (event) => {
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
		keyboard.keyDown.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (this.selected) {
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

		const mouse = new Mouse();
		CanvasAPI.OnSelectEvent(this.inputField.gameObject, () => {
			this.selected = true;
			this.historyIndex = -1;
			if (!Game.IsMobile()) {
				this.inputWrapperImage.color = new Color(0, 0, 0, 0.4);
			}
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
			if (!Game.IsMobile()) {
				this.inputWrapperImage.color = new Color(0, 0, 0, 0);
			}
			this.CheckIfShouldHide();
		});

		SetInterval(0.5, () => {
			this.CheckIfShouldHide();
		});
	}

	private CheckIfShouldHide(): void {
		if (Game.IsMobile()) return;
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
		print(message);
		try {
			const chatMessage = GameObjectUtil.InstantiateIn(this.chatMessagePrefab, this.content.transform);
			const refs = chatMessage.GetComponent<GameObjectReferences>()!;

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

			if (Time.time > this.lastChatMessageRenderedTime && this.canvas.gameObject.active) {
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
