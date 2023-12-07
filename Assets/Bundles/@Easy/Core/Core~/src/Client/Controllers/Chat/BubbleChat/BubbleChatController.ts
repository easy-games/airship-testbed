import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { PlayerController } from "Client/Controllers/Player/PlayerController";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Entity } from "Shared/Entity/Entity";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Player } from "Shared/Player/Player";
import StringUtils from "Shared/Types/StringUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";

@Controller({})
export class BubbleChatController implements OnStart {
	private static MAX_DISPLAYED_MESSAGES = 3;
	/** Map from transform to minimized status (true = minimized) */
	private chatContainerMinimized = new Map<Transform, boolean>();
	/** Map from chat message to original text */
	private bubbleChatContents = new Map<TextMeshProUGUI, string>();

	OnStart(): void {
		// Register BubbleChat container on spawn
		CoreClientSignals.EntitySpawn.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			this.GetOrCreateChatContainer(event.entity);
		});

		CoreNetwork.ServerToClient.PlayerChatted.Client.OnServerEvent((rawMessage, senderClientId) => {
			let sender: Player | undefined;
			if (senderClientId !== undefined) {
				sender = Dependency<PlayerController>().GetPlayerFromClientId(senderClientId);
			}
			if (sender?.character) {
				const messageSanitized = this.SanitizeRawChatInput(rawMessage);
				this.RenderBubble(messageSanitized, sender.character);
			}
		});

		// Replace distant bubbles with "..."
		task.spawn(() => {
			while (true) {
				task.wait(0.5);

				const cameraPosition = Camera.main.transform.position;

				for (const [containerTransform, minimized] of this.chatContainerMinimized) {
					// Clear out destroyed containers
					if (!containerTransform.gameObject) {
						this.chatContainerMinimized.delete(containerTransform);
						continue;
					}

					const shouldBeMinimized = this.ShouldChatBeMinimized(containerTransform, cameraPosition);
					if (shouldBeMinimized === minimized) continue;

					this.chatContainerMinimized.set(containerTransform, shouldBeMinimized);

					const canvas = containerTransform.FindChild("Canvas");
					if (!canvas) continue;

					// Loop over all bubbles within the container and replace their contents
					const childTextComponents = canvas.gameObject.GetComponentsInChildren<TextMeshProUGUI>();
					const size = childTextComponents.Length;
					for (let i = 0; i < size; i++) {
						const textComponent = childTextComponents.GetValue(i);
						this.UpdateTextComponentContents(textComponent, shouldBeMinimized);
					}
				}
			}
		});
	}

	private startSendingRandomMessages(entity: Entity, i = 0) {
		Task.Delay(10, () => {
			const messageList = [
				"Hi",
				"How is it going",
				"I'm gunna get some diamonds",
				"hey can you join my party? I want to play super pet simulator with tim",
			];
			this.RenderBubble(messageList[i % messageList.size()], entity);
			this.startSendingRandomMessages(entity, i + 1);
		});
	}

	private SanitizeRawChatInput(input: string): string {
		input = StringUtils.trim(input);
		const maxLength = 80;

		if (input.size() < maxLength) return input;

		const shrunkString = input.sub(0, math.min(input.size(), maxLength - 2));
		return StringUtils.trim(shrunkString) + "...";
	}

	private RenderBubble(text: string, sender: Entity) {
		const chatContainer = this.GetOrCreateChatContainer(sender);
		const canvas = chatContainer.transform.Find("Canvas");
		if (!canvas) {
			warn("No canvas found for BubbleChat", chatContainer.name);
			return;
		}

		const chatMessageAsset = AssetBridge.Instance.LoadAsset<Object>(
			"@Easy/Core/Client/Resources/Prefabs/BubbleChatMessage.prefab",
		);
		const chatMessageObject = GameObjectUtil.Instantiate(chatMessageAsset);

		// Set message contents
		const refs = chatMessageObject.GetComponent<GameObjectReferences>();
		const messageObject = refs.GetValue("Content", "Message");
		const textComponent = messageObject.GetComponent<TextMeshProUGUI>();
		textComponent.text = text;

		const isMinimized = this.chatContainerMinimized.get(chatContainer.transform) ?? false;
		this.UpdateTextComponentContents(textComponent, isMinimized);

		chatMessageObject.transform.SetParent(canvas.transform, false);

		chatMessageObject.transform.localScale = new Vector3(0.6, 0.6, 0.6);
		chatMessageObject.transform.TweenLocalScale(new Vector3(1, 1, 1), 0.2).SetEase(EaseType.QuadInOut);

		// Purge if child count is too high
		if (canvas.transform.GetChildCount() > BubbleChatController.MAX_DISPLAYED_MESSAGES) {
			const firstChild = canvas.transform.GetChild(0);
			GameObjectUtil.Destroy(firstChild.gameObject);
		}

		const messageCanvasGroup = chatMessageObject.GetComponent<CanvasGroup>();
		const messageBackgroundImage = chatMessageObject.GetComponent<Image>();

		// Tween to semi-transparent state
		task.delay(8, () => {
			if (chatMessageObject === undefined) return;

			messageBackgroundImage.TweenGraphicAlpha(0.4, 2);
		});

		// Destroy
		task.delay(20, () => {
			if (!chatMessageObject) return;

			messageCanvasGroup.TweenCanvasGroupAlpha(0, 0.3);
			GameObjectUtil.Destroy(chatMessageObject, 2);
		});
	}

	/** Creates a chat container for an entity (or returns one if it already exists) */
	private GetOrCreateChatContainer(entity: Entity): GameObject {
		const existingChatContainer = entity.model.gameObject.transform.Find("BubbleChatContainer");
		if (existingChatContainer) {
			return existingChatContainer.gameObject;
		}

		const chatContainer = AssetCache.LoadAsset<Object>(
			"@Easy/Core/Client/Resources/Prefabs/BubbleChatContainer.prefab",
		);
		const chatContainerObject = GameObjectUtil.Instantiate(chatContainer);
		chatContainerObject.name = "BubbleChatContainer";
		const chatTransform = chatContainerObject.transform;

		const canvas = chatTransform.Find("Canvas");
		if (canvas) {
			canvas.gameObject.ClearChildren();

			const canvasComponent = canvas.GetComponent<Canvas>();
			if (entity.IsLocalCharacter()) {
				const isFirstPerson = Dependency<LocalEntityController>().IsFirstPerson();
				canvasComponent.enabled = !isFirstPerson;
				Dependency<LocalEntityController>().FirstPersonChanged.Connect((isFirst) => {
					canvasComponent.enabled = !isFirst;
				});
			}
		}

		chatTransform.SetParent(entity.model.gameObject.transform);
		chatTransform.localPosition = new Vector3(0, 3.2, 0);

		const shouldBeMinimized = this.ShouldChatBeMinimized(chatTransform, Camera.main.transform.position);
		this.chatContainerMinimized.set(chatContainerObject.transform, shouldBeMinimized);
		return chatContainerObject;
	}

	private ShouldChatBeMinimized(chatTransform: Transform, cameraPosition: Vector3) {
		const dist = chatTransform.position.sub(cameraPosition).magnitude;
		const shouldBeMinimized = dist > 30;
		return shouldBeMinimized;
	}

	private UpdateTextComponentContents(textComponent: TextMeshProUGUI, shouldBeMinimized: boolean) {
		if (shouldBeMinimized) {
			// Store current contents
			if (!this.bubbleChatContents.has(textComponent)) {
				this.bubbleChatContents.set(textComponent, textComponent.text);
				const connectionId = textComponent.gameObject.GetComponent<DestroyWatcher>().OnDestroyedEvent(() => {
					this.bubbleChatContents.delete(textComponent);
					Bridge.DisconnectEvent(connectionId);
				});
			}
			textComponent.text = "...";
			return;
		}

		// Needs to be set back to original value
		const oldValue = this.bubbleChatContents.get(textComponent);
		if (oldValue) {
			textComponent.text = oldValue;
		}
	}
}
