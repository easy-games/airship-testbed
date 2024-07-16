import { CoreUIController } from "@Easy/Core/Client/ProtectedControllers/CoreUIController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { MainMenuSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/MainMenuSingleton";
import { ProtectedPlayer } from "@Easy/Core/Shared/Player/ProtectedPlayer";
import { Protected } from "@Easy/Core/Shared/Protected";
import { CoreSound } from "@Easy/Core/Shared/Sound/CoreSound";
import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ChatUtil } from "@Easy/Core/Shared/Util/ChatUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { MainMenuBlockSingleton } from "../../../../Client/ProtectedControllers//Settings/MainMenuBlockSingleton";
import { MessageCommand } from "./ClientCommands/MessageCommand";
import { ReplyCommand } from "./ClientCommands/ReplyCommand";

class ChatMessageElement {
	public canvasGroup: CanvasGroup;
	public shownAt = os.clock();
	public shown = true;
	private hideBin = new Bin();

	constructor(public readonly gameObject: GameObject, public time: number) {
		this.canvasGroup = gameObject.GetComponent<CanvasGroup>()!;
	}

	public Hide(): void {
		if (!this.shown) return;
		this.shown = false;
		const t = NativeTween.CanvasGroupAlpha(this.canvasGroup, 0, 0.2);
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
	private chatMessagePrefab: Object;
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

	constructor() {
		const refs = Dependency<CoreUIController>().refs.GetValue("Apps", "Chat").GetComponent<GameObjectReferences>()!;
		this.canvas = refs.GetValue("UI", "Canvas").GetComponent<Canvas>()!;
		this.content = refs.GetValue("UI", "Content");
		this.wrapper = refs.GetValue("UI", "Wrapper");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.inputTransform = refs.GetValue("UI", "Input");
		this.inputWrapperImage = this.inputTransform.GetComponent<Image>()!;
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

		this.RegisterCommand(new MessageCommand());
		this.RegisterCommand(new ReplyCommand());

		if (Game.IsMobile()) {
			this.canvas.enabled = false;
		} else {
			this.wrapper.GetComponent<Mask>()!.enabled = false;
		}

		contextbridge.callback<(val: boolean) => void>("ClientChatSingleton:SetUIEnabled", (from, val) => {
			this.canvas.gameObject.SetActive(val);
		});

		if (Game.IsInGame()) {
			task.delay(0, () => {
				const overlayCanvas = Object.Instantiate(
					AssetCache.LoadAsset(
						"AirshipPackages/@Easy/Core/Prefabs/UI/MobileControls/AirshipOverlayCanvas.prefab",
					),
					CoreRefs.protectedTransform,
				);
				// const controls = new Preferred();
				// controls.ObserveControlScheme((scheme) => {
				// 	if (scheme === ControlScheme.Touch) {
				// 		overlayCanvas.SetActive(true);
				// 	} else {
				// 		overlayCanvas.SetActive(false);
				// 	}
				// });
			});
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

	public AddMessage(rawText: string, nameWithPrefix: string | undefined, senderClientId: number | undefined): void {
		let sender: ProtectedPlayer | undefined;
		if (senderClientId !== undefined) {
			sender = Protected.protectedPlayers.FindByClientId(senderClientId);
			if (sender) {
				if (Dependency<MainMenuBlockSingleton>().IsUserIdBlocked(sender.userId)) {
					return;
				}
			}
		}
		let text = rawText;
		if (nameWithPrefix) {
			text = ChatColor.White(nameWithPrefix) + ChatColor.White(rawText);
		}
		this.RenderChatMessage(text, sender);
	}

	protected OnStart(): void {
		const isMainMenu = Game.coreContext === CoreContext.MAIN_MENU;
		if (isMainMenu) return;

		contextbridge.callback<
			(rawText: string, nameWithPrefix: string | undefined, senderClientId: number | undefined) => void
		>("Chat:AddMessage", (fromContext, rawText, nameWithPrefix, senderClientId) => {
			this.AddMessage(rawText, nameWithPrefix, senderClientId);
		});

		CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((rawText, nameWithPrefix, senderClientId) => {
			this.AddMessage(rawText, nameWithPrefix, senderClientId);
		});

		// Submitting on mobile.
		CanvasAPI.OnInputFieldSubmit(this.inputField.gameObject, (data) => {
			this.SubmitInputField();
		});
		this.HideChatInput();

		// Submitting on desktop.
		// We cancel the form submit so the input field doesn't auto deselect.
		Keyboard.OnKeyDown(
			Key.Enter,
			(event) => {
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
		const t = NativeTween.SizeDelta(this.inputTransform, new Vector2(this.inputTransform.sizeDelta.x, 40), 0.04);
		// this.chatInputBin.Add(() => {
		// 	t.Cancel();
		// });
		// this.inputWrapperImage.color = new Color(0, 0, 0, 0.8);
		// this.inputField.textComponent.alpha = 1;
	}

	private HideChatInput(): void {
		const t = NativeTween.SizeDelta(this.inputTransform, new Vector2(this.inputTransform.sizeDelta.x, 0), 0.04);
		this.selected = false;
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

	public RenderChatMessage(message: string, sender?: ProtectedPlayer): void {
		print(message);
		try {
			const chatMessage = GameObjectUtil.InstantiateIn(this.chatMessagePrefab, this.content.transform);
			const refs = chatMessage.GetComponent<GameObjectReferences>()!;

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

			const element = new ChatMessageElement(chatMessage, os.clock());
			this.chatMessageElements.push(element);

			if (Time.time > this.lastChatMessageRenderedTime && this.canvas.gameObject.activeInHierarchy) {
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
