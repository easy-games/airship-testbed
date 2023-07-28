import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { Network } from "Shared/Network";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { SignalPriority } from "Shared/Util/Signal";
import { SetInterval, SetTimeout } from "Shared/Util/Timer";
import { LocalEntityController } from "../Character/LocalEntityController";
import { ChatCommand } from "CoreShared/Commands/ChatCommand";
import { ChatUtil } from "CoreShared/Util/ChatUtil";
import { PlayerController } from "../Player/PlayerController";
import { Game } from "Shared/Game";
import { FriendsCommand } from "CoreShared/Commands/FriendsCommand";
import { encode } from "CoreShared/json";

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
			t.Cancel();
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

	constructor(private localEntityController: LocalEntityController) {
		const refs = GameObject.Find("Chat").GetComponent<GameObjectReferences>();
		this.content = refs.GetValue("UI", "Content");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.content.gameObject.ClearChildren();

		this.RegisterCommand(new FriendsCommand());
	}

	public RegisterCommand(command: ChatCommand) {
		this.commands.set(command.commandLabel.lower(), command);
		for (let alias of command.aliases) {
			this.commands.set(alias.lower(), command);
		}
	}

	OnStart(): void {
		Network.ServerToClient.ChatMessage.Client.OnServerEvent((text) => {
			this.AddChatMessage(text);
		});

		const keyboard = new Keyboard();
		keyboard.OnKeyDown(
			KeyCode.Return,
			(event) => {
				if (this.selected) {
					if (this.inputField.text === "") {
						EventSystem.current.ClearSelected();
						return;
					}
					this.SubmitInputField();
					event.SetCancelled(true);
				} else {
					this.inputField.Select();
				}
			},
			SignalPriority.HIGH,
		);
		keyboard.OnKeyDown(
			KeyCode.Escape,
			(event) => {
				if (this.selected) {
					if (this.inputField.text === "") {
						EventSystem.current.ClearSelected();
						return;
					}
					this.SubmitInputField();
					event.SetCancelled(true);
				}
			},
			SignalPriority.HIGH,
		);
		keyboard.OnKeyDown(
			KeyCode.Slash,
			(event) => {
				if (!this.selected) {
					this.inputField.SetTextWithoutNotify("/");
					this.inputField.caretPosition = 1;
					this.inputField.Select();
				}
			},
			SignalPriority.HIGH,
		);
		keyboard.OnKeyDown(KeyCode.UpArrow, (event) => {
			print("up.1");
			if (this.IsChatFocused()) {
				print("up.2");
				if (this.historyIndex + 1 < this.prevSentMessages.size()) {
					this.historyIndex++;
					let msg = this.prevSentMessages[this.historyIndex];
					print("up.3 " + msg);
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
		keyboard.AnyKeyDown.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (this.selected) {
				if (
					event.KeyCode !== KeyCode.Return &&
					event.KeyCode !== KeyCode.Escape &&
					event.KeyCode !== KeyCode.UpArrow &&
					event.KeyCode !== KeyCode.DownArrow
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
				if (os.clock() - element.time > 5) {
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

		print(`SendChatMessage() commandData: ${encode(commandData)}`);

		let sendChatToServer = true;

		if (commandData) {
			const command = this.commands.get(commandData.label);
			if (command) {
				command.Execute(Game.LocalPlayer, commandData.args);
				sendChatToServer = false;
			}
		}

		if (sendChatToServer) {
			Network.ClientToServer.SendChatMessage.Client.FireServer(message);
		}
	}

	public AddChatMessage(message: string): void {
		try {
			const chatMessage = GameObjectUtil.InstantiateIn(this.chatMessagePrefab, this.content.transform);
			const refs = chatMessage.GetComponent<GameObjectReferences>();
			const textGui = refs.GetValue<TextMeshProUGUI>("UI", "Text");

			textGui.text = message;

			const element = new ChatMessageElement(chatMessage, os.clock());
			this.chatMessageElements.push(element);
		} catch (err) {
			Debug.LogError("chat error:");
			Debug.LogError(err);
		}
	}

	public IsChatFocused(): boolean {
		return this.selected;
	}
}
