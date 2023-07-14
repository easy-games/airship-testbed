import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { Network } from "Shared/Network";
import { Keyboard, Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { LocalEntityController } from "../Character/LocalEntityController";

@Controller({})
export class ChatController implements OnStart {
	private content: GameObject;
	private chatMessagePrefab: Object;
	private inputField: TMP_InputField;

	private selected = false;
	private selectedBin = new Bin();

	constructor(private localEntityController: LocalEntityController) {
		const refs = GameObject.Find("Chat").GetComponent<GameObjectReferences>();
		this.content = refs.GetValue("UI", "Content");
		this.chatMessagePrefab = refs.GetValue("UI", "ChatMessagePrefab");
		this.inputField = refs.GetValue("UI", "InputField");
		this.content.gameObject.ClearChildren();
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

		// Sink key events when selected:
		keyboard.AnyKeyDown.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			if (this.selected) {
				if (event.KeyCode !== KeyCode.Return && event.KeyCode !== KeyCode.Escape) {
					event.SetCancelled(true);
				}
			}
		});

		// keyboard.KeyDown.ConnectWithPriority(SignalPriority.HIGH, (event) => {
		// 	if (this.selected) {
		// 		if (event.Key === Key.Enter) {
		// 			if (this.inputField.text === "") {
		// 				EventSystem.current.ClearSelected();
		// 				return;
		// 			}
		// 			this.SubmitInputField();
		// 			return;
		// 		} else if (event.Key === Key.Escape) {
		// 			EventSystem.current.ClearSelected();
		// 			this.inputField.SetTextWithoutNotify("");
		// 			event.SetCancelled(true);
		// 			return;
		// 		}
		// 		// cancel input when using input field
		// 		event.SetCancelled(true);
		// 	} else if (event.Key === Key.Enter) {
		// 		this.inputField.Select();
		// 	} else if (event.Key === Key.Slash) {
		// 		this.inputField.SetTextWithoutNotify("/");
		// 		this.inputField.caretPosition = 1;
		// 		this.inputField.Select();
		// 	}
		// });

		const mouse = new Mouse();
		CanvasAPI.OnSelectEvent(this.inputField.gameObject, () => {
			this.selected = true;
			const entityInputDisabler = this.localEntityController.GetEntityInput()?.AddDisabler();
			if (entityInputDisabler !== undefined) {
				this.selectedBin.Add(entityInputDisabler);
			}
			const mouseLocker = mouse.AddUnlocker();
			this.selectedBin.Add(() => {
				mouse.RemoveUnlocker(mouseLocker);
			});
		});

		CanvasAPI.OnDeselectEvent(this.inputField.gameObject, () => {
			this.selectedBin.Clean();
			this.selected = false;
		});
	}

	public SubmitInputField(): void {
		let text = this.inputField.text;
		this.SendChatMessage(text);
		this.inputField.SetTextWithoutNotify("");
		EventSystem.current.ClearSelected();
	}

	public SendChatMessage(message: string): void {
		Network.ClientToServer.SendChatMessage.Client.FireServer(message);
	}

	public AddChatMessage(message: string): void {
		try {
			const chatMessage = GameObjectBridge.InstantiateIn(this.chatMessagePrefab, this.content.transform);
			const refs = chatMessage.GetComponent<GameObjectReferences>();
			const textGui = refs.GetValue<TextMeshProUGUI>("UI", "Text");

			textGui.text = message;
		} catch (err) {
			print("chat error.");
			print(err);
		}
	}

	public IsChatFocused(): boolean {
		return this.selected;
	}
}
