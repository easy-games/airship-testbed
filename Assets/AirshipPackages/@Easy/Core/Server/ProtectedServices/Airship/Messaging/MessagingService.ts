import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export const enum MessagingServiceBridgeTopics {
	Subscribe = "MessagingService:Subscribe",
	Publish = "MessagingService:Publish",
	IncomingMessage = "MessagingService:IncomingMessage",
}

export type ServerBridgeApiSubscribe = (topic: string) => void;
export type ServerBridgeApiPublish = (topic: string, data: string) => void;

@Service({})
export class MessagingService {
	private onEvent = new Signal<[topicNamespace: string, topicName: string, data: string]>();
	public onSocketConnectionChanged = new Signal<[connected: boolean]>();
	public doReconnect = true;
	public cancelSessionReportTask: () => void | undefined;

	constructor() {
		if (!Game.IsServer()) return;
		contextbridge.callback<ServerBridgeApiSubscribe>(
			MessagingServiceBridgeTopics.Subscribe,
			(_, topic) => {
				task.spawn(() => {
					MessagingManager.SubscribeAsync("custom", topic);
				});
			},
		);

		contextbridge.callback<ServerBridgeApiPublish>(
			MessagingServiceBridgeTopics.Publish,
			(_, topic, data) => {
				this.Publish("custom", topic, data);
			},
		);
	}

	protected OnStart(): void {
		MessagingManager.Instance.OnEvent((topicNamespace, topicName, data) => {
			this.onEvent.Fire(topicNamespace, topicName, data);
			if (topicNamespace === "custom") {
				contextbridge.broadcast(MessagingServiceBridgeTopics.IncomingMessage, { topicNamespace, topicName, data });
			}
		});
		MessagingManager.SetScriptListening(true);

		task.spawn(() => {
			this.Connect();
		});

		MessagingManager.Instance.OnDisconnected((reason) => {
			CoreLogger.Warn("Disconnected from Pubsub: " + reason);
			this.onSocketConnectionChanged.Fire(false);

			if (this.doReconnect) {
				this.Connect();
			}
		});
	}

	public On<T = unknown>(topicNamespace: string, topicName: string, callback: (data: T) => void): () => void {
		task.spawn(() => {
			MessagingManager.SubscribeAsync(topicNamespace, topicName);
		});

		return this.onEvent.Connect((incomingTopicNamespace, incomingTopicName, d) => {
			if (incomingTopicNamespace === topicNamespace && incomingTopicName === topicName) {
				callback(json.decode(d));
			}
		});
	}

	public Publish(topicNamespace: string, topicName: string, data: unknown = undefined): void {
		if (data === undefined) {
			data = { _hold: "yes" };
		}
		task.spawn(() => {
			MessagingManager.PublishAsync(topicNamespace, topicName, json.encode(data));
		});
	}

	public IsConnected(): boolean {
		return MessagingManager.IsConnected();
	}

	public Connect(): void {
		if (Game.IsEditor() && !Game.IsInternal()) return;
		this.doReconnect = true;
		let connected = MessagingManager.ConnectAsyncInternal();
		this.onSocketConnectionChanged.Fire(connected);
	}
}
