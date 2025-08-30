import { CoreUIController } from "@Easy/Core/Client/ProtectedControllers/CoreUIController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { ChatMessageNetworkEvent, CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { PartyCommand } from "@Easy/Core/Shared/MainMenu/Singletons/Chat/ClientCommands/PartyCommand";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { ProtectedPlayer } from "@Easy/Core/Shared/Player/ProtectedPlayer";
import { Protected } from "@Easy/Core/Shared/Protected";
import StringUtils from "@Easy/Core/Shared/Types/StringUtil";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ChatUtil } from "@Easy/Core/Shared/Util/ChatUtil";
import { ProtectedUtil } from "@Easy/Core/Shared/Util/ProtectedUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { MainMenuBlockSingleton } from "../../../../Client/ProtectedControllers//Settings/MainMenuBlockSingleton";
import ChatMessage from "./ChatMessage";
import ChatWindow from "./ChatWindow";
import { MessageCommand } from "./ClientCommands/MessageCommand";
import { ReplyCommand } from "./ClientCommands/ReplyCommand";

class ChatMessageElement {
	public canvasGroup: CanvasGroup;
	public shownAt = os.clock();
	public shown = true;
	public sender: ProtectedPlayer | undefined;
	private hideBin = new Bin();

	constructor(public readonly gameObject: GameObject, public time: number, public readonly messageId?: string, public readonly nameWithPrefix?: string) {
		this.canvasGroup = gameObject.GetComponent<CanvasGroup>()!;
	}

	public Hide(instant: boolean = false): void {
		if (!this.shown) return;
		let fadeTime = 0.2;

		if (instant) { fadeTime = 0 };

		this.shown = false;
		const t = NativeTween.CanvasGroupAlpha(this.canvasGroup, 0, fadeTime)?.SetUseUnscaledTime(true);
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

@Singleton()
export class ClientChatSingleton {
	public canvas!: Canvas;
	private content: GameObject;
	private wrapper: RectTransform;
	private chatMessagePrefab: GameObject;
	private inputField: TMP_InputField;
	private inputWrapperImage: Image;
	private inputTransform!: RectTransform;

	private selected = false;
	private selectedBin = new Bin();

	private chatMessageElements: ChatMessageElement[] = [];

	private prevSentMessages: string[] = [];
	private historyIndex = -1;

	private commands = new Map<string, ChatCommand>();
	private lastChatMessageRenderedTime = Time.time;

	public chatWindow: ChatWindow;

	constructor() {
		const refs = Dependency<CoreUIController>().refs.GetValue("Apps", "Chat").GetComponent<GameObjectReferences>()!;
		this.canvas = refs.GetValue("UI", "Canvas").GetComponent<Canvas>()!;
		this.content = refs.GetValue("UI", "Content");
		this.wrapper = refs.GetValue("UI", "Wrapper");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.inputTransform = refs.GetValue("UI", "Input");
		this.chatWindow = this.canvas.gameObject.GetAirshipComponent<ChatWindow>()!;
		this.inputWrapperImage = this.inputTransform.GetComponent<Image>()!;
		this.content.gameObject.ClearChildren();

		task.spawn(() => {
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
					wrapperRect.anchoredPosition = new Vector2(ProtectedUtil.GetNotchHeight() + 190, -14);
				} else {
					const wrapperRect = this.wrapper.GetComponent<RectTransform>()!;
					const wrapperImg = wrapperRect.GetComponent<Image>()!;
					wrapperImg.color = new Color(0, 0, 0, 0);
				}
			});
		});

		if (Game.IsProtectedLuauContext()) {
			this.RegisterCommand(new MessageCommand());
			this.RegisterCommand(new ReplyCommand());
			this.RegisterCommand(new PartyCommand());

			contextbridge.callback<() => boolean>("ClientChatSingleton:IsOpen", () => {
				return this.IsOpen();
			});
		}

		if (Game.IsMobile()) {
			this.canvas.enabled = false;
		} else {
			this.wrapper.GetComponent<Mask>()!.enabled = false;
		}

		contextbridge.callback<(val: boolean) => void>("ClientChatSingleton:SetUIEnabled", (from, val) => {
			this.canvas.gameObject.SetActive(val);
		});
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

	public AddMessage(rawText: string, messageId: string | undefined, nameWithPrefix: string | undefined, senderClientId: number | undefined): void {
		let sender: ProtectedPlayer | undefined;
		if (senderClientId !== undefined) {
			sender = Protected.ProtectedPlayers.FindByConnectionId(senderClientId);
			if (sender) {
				if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(sender.userId)) {
					return;
				}
			}
		}
		this.RenderChatMessage(rawText, messageId, sender, nameWithPrefix);
	}

	protected OnStart(): void {
		const isMainMenu = Game.coreContext === CoreContext.MAIN_MENU;
		if (isMainMenu) return;

		contextbridge.subscribe(
			"Chat:ProcessLocalMessage",
			(context: LuauContext, msg: ChatMessageNetworkEvent) => {
				if (msg.type === "sent") {
					this.AddMessage(msg.message, msg.internalMessageId, msg.senderPrefix, msg.senderClientId);
				} else if (msg.type === "update") {
					this.UpdateChatMessage(msg.internalMessageId, msg.message);
				} else if (msg.type === "remove") {
					this.ClearChatMessage(msg.internalMessageId);
				}
			},
		);

		// TODO: Does this ever run? It seems to be on the client that the subscription in AirshipChatSingleton is what sends events here
		// TODO: It does so through the contextbridge Chat:ProcessLocalMessage event
		CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((msg) => {
			if (msg.type === "sent") {
				this.AddMessage(msg.message, msg.internalMessageId, msg.senderPrefix, msg.senderClientId);
			} else if (msg.type === "update") {
				this.UpdateChatMessage(msg.internalMessageId, msg.message);
			} else if (msg.type === "remove") {
				this.ClearChatMessage(msg.internalMessageId);
			}
		});

		if (Game.IsMobile()) {
			// Submitting on mobile.
			CanvasAPI.OnInputFieldSubmit(this.inputField.gameObject, (data) => {
				this.SubmitInputField();
			});

			this.ShowChatInput();
		} else {
			this.HideChatInput();
		}

		// Submitting on desktop.
		// We cancel the form submit so the input field doesn't auto deselect.
		Keyboard.OnKeyDown(
			Key.Enter,
			(event) => {
				if (DevConsole.IsOpen) return;
				if (EventSystem.current.currentSelectedGameObject && !this.selected) return;
				if (this.selected) {
					this.SubmitInputField();
					event.SetCancelled(true);
				} else {
					if (AppManager.IsOpen()) return;
					this.inputField.Select();
				}
			},
			SignalPriority.HIGH,
		);
		Keyboard.OnKeyDown(
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
		Keyboard.OnKeyDown(
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
		Keyboard.OnKeyDown(Key.UpArrow, (event) => {
			if (this.IsChatFocused()) {
				if (this.historyIndex + 1 < this.prevSentMessages.size()) {
					this.historyIndex++;
					let msg = this.prevSentMessages[this.historyIndex];
					this.inputField.SetTextWithoutNotify(msg);
					this.inputField.caretPosition = msg.size();
				}
			}
		});
		Keyboard.OnKeyDown(Key.DownArrow, (event) => {
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
		Keyboard.onKeyDownSignal.ConnectWithPriority(SignalPriority.HIGH, (event) => {
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

		CanvasAPI.OnSelectEvent(this.inputField.gameObject, () => {
			this.selected = true;
			this.historyIndex = -1;
			if (!Game.IsMobile()) {
				this.ShowChatInput();
			}
			// todo: movement disabler
			const disableId = contextbridge.invoke<() => number | undefined>(
				"LocalCharacterSingleton:AddInputDisabler",
				LuauContext.Game,
			);
			if (disableId !== undefined) {
				this.selectedBin.Add(() => {
					contextbridge.invoke<(id: number) => void>(
						"LocalCharacterSingleton:RemoveInputDisabler",
						LuauContext.Game,
						disableId,
					);
				});
			}
			this.selectedBin.Add(Mouse.AddUnlocker());
			this.CheckIfShouldHide();
		});

		CanvasAPI.OnDeselectEvent(this.inputField.gameObject, () => {
			this.selectedBin.Clean();
			this.selected = false;
			if (!Game.IsMobile()) {
				this.HideChatInput();
			}
			this.CheckIfShouldHide();
		});

		SetInterval(0.5, () => {
			this.CheckIfShouldHide();
		});
	}

	private ShowChatInput(): void {
		const t = NativeTween.SizeDelta(
			this.inputTransform,
			new Vector2(this.inputTransform.sizeDelta.x, 40),
			0.04,
		)?.SetUseUnscaledTime(true);
		if (!Game.IsMobile()) {
			this.chatWindow.FocusDesktop();
		}

		// this.chatInputBin.Add(() => {
		// 	t.Cancel();
		// });
		// this.inputWrapperImage.color = new Color(0, 0, 0, 0.8);
		// this.inputField.textComponent.alpha = 1;
	}

	private HideChatInput(): void {
		const t = NativeTween.SizeDelta(
			this.inputTransform,
			new Vector2(this.inputTransform.sizeDelta.x, 0),
			0.04,
		)?.SetUseUnscaledTime(true);
		this.selected = false;

		if (!Game.IsMobile()) {
			this.chatWindow.UnfocusDesktop();
		}
		// this.chatInputBin.Add(() => {
		// 	t.Cancel();
		// });
		// this.inputWrapperImage.color = new Color(0, 0, 0, 0);
		// this.inputField.textComponent.alpha = 0;
	}

	private CheckIfShouldHide(): void {
		if (Game.IsMobile()) return;
		if (this.IsChatFocused()) {
			for (const element of this.chatMessageElements) {
				element.gameObject.SetActive(true);
				element.Show();
			}
		} else {
			for (const element of this.chatMessageElements) {
				const latestMessage = this.chatMessageElements[this.chatMessageElements.size() - 1];

				// This makes it so the last message shown is the client's 
				if (Protected.Settings.IsChatMuteEnabled() && element !== latestMessage && !element.sender?.IsLocalPlayer()) {
					element.Hide(true);
					continue;
				};

				if (os.clock() - element.time > 10) {
					element.Hide();
				};
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
		if (text === "") {
			EventSystem.current.ClearSelected();
			return;
		}

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

	public RenderChatMessage(message: string, messageId?: string, sender?: ProtectedPlayer, nameWithPrefix?: string): void {
		if (nameWithPrefix) {
			message = ChatColor.White(nameWithPrefix) + ChatColor.White(message);
		}
		try {
			const chatMessageGO = Instantiate<GameObject>(this.chatMessagePrefab, this.content.transform);
			const chatMessage = chatMessageGO.GetAirshipComponent<ChatMessage>()!;
			const refs = chatMessageGO.GetComponent<GameObjectReferences>()!;

			const textGui = refs.GetValue<TMP_Text>("UI", "Text");
			textGui.text = message;

			const profileImage = refs.GetValue<RawImage>("UI", "ProfilePicture");
			if (sender) {
				task.spawn(async () => {
					const texture = await Airship.Players.GetProfilePictureAsync(sender.userId);
					if (texture) {
						profileImage.texture = texture;
					} else {
						profileImage.gameObject.SetActive(false);
					}
				});
			} else {
				// system message
				textGui.margin = new Vector4(0, 8, 8, 8);
				profileImage.gameObject.SetActive(false);
			}

			const url = this.detectUrlInChatMessage(message);
			if (url) {
				chatMessage.SetUrl(url);
			}

			const element = new ChatMessageElement(chatMessageGO, os.clock(), messageId, nameWithPrefix);
			element.sender = sender;
			this.chatMessageElements.push(element);

			if (Protected.Settings.IsChatMuteEnabled() && !sender?.IsLocalPlayer()) {
				element.Hide(true);
				return;
			};

			// if (Time.time > this.lastChatMessageRenderedTime && this.canvas.gameObject.activeInHierarchy) {
			// 	AudioManager.PlayGlobal(CoreSound.chatMessageReceived, {
			// 		volumeScale: 0.24,
			// 	});
			// }
			this.lastChatMessageRenderedTime = Time.time;
		} catch (err) {
			Debug.LogError("chat error:");
			Debug.LogError(err);
		}
	}

	private detectUrlInChatMessage(message: string) {
		const domainPattern = "%f[%w][%w-]+%.[a-z]+[%w%p]*%f[%A]";
		const match = string.match(Bridge.RemoveRichText(message), domainPattern);
		let url: string | undefined;
		if (match !== undefined && match.size() > 0) {
			url = match[0] as string;
			if (!StringUtils.startsWith(url.lower(), "https://")) {
				url = "https://" + url;
			}
			print("found chat url: " + url);
		}

		return url;
	}

	public ClearChatMessage(messageId: string): void {
		const index = this.chatMessageElements.findIndex((element) => element.messageId === messageId);
		if (index !== -1) {
			const element = this.chatMessageElements[index];
			element.Destroy();
			this.chatMessageElements.remove(index);
		}
	}

	public UpdateChatMessage(messageId: string, text: string): void {
		const index = this.chatMessageElements.findIndex((element) => element.messageId === messageId);

		if (index === -1) return;

		const element = this.chatMessageElements[index];
		if (element.nameWithPrefix) {
			text = ChatColor.White(element.nameWithPrefix) + ChatColor.White(text);
		}
		const refs = element.gameObject.GetComponent<GameObjectReferences>()!;
		const textGui = refs.GetValue<TMP_Text>("UI", "Text");
		textGui.text = text;
		const chatMessage = element.gameObject.GetAirshipComponent<ChatMessage>()!;
		if (chatMessage) {
			const url = this.detectUrlInChatMessage(text);
			if (url) {
				chatMessage.SetUrl(url);
			} else {
				chatMessage.RemoveUrl();
			}
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
