import {
	MessagingServiceBridgeTopics,
	ServerBridgeApiPublish,
	ServerBridgeApiSubscribe
} from "@Easy/Core/Server/ProtectedServices/Airship/Messaging/MessagingService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipDataStoreLockInfo, AirshipDataStoreLockMode } from "@Easy/Core/Shared/Airship/Types/AirshipDataStore";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

/**
 * The Messaging Service provides Publish/Subscribe functionality for communicating across different game servers.
 */
@Service({})
export class AirshipMessagingService {
	private onEvent = new Signal<[topic: string, data: any]>();
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Messaging = this;
	}

	protected OnStart(): void {
		if (!Game.IsServer()) return;
		contextbridge.subscribe<(context: LuauContext, args: { topicNamespace: string, topicName: string, data: string }) => void>(MessagingServiceBridgeTopics.IncomingMessage, (_, { topicNamespace, topicName, data }) => {
			this.onEvent.Fire(topicName, json.decode(data));
		});
	}

	private CheckTopicName(topicName: string): void {
		if (!topicName || topicName.match("^[%w%_%-]+$")[0] === undefined) {
			throw `Bad topic name provided (${topicName}). Ensure that your topic name includes only alphanumeric characters or _-`;
		}
	}

	/**
	 * Subscribes to a topic, allowing you to receive messages published to that topic.
	 * @param topic The topic to subscribe to.
	 * @param callback The function that will be called when a message is received on the subscribed topic.
	 * @returns An object containing a success flag (if the topic was able to be subscribed to) and an unsubscribe function.
	 */
	public Subscribe<T = unknown>(topic: string, callback: (data: T) => void): { success: boolean, unsubscribe: () => void } {
		this.CheckTopicName(topic);

		const retVal = this.onEvent.Connect((e, d) => {
			if (e === topic) {
				callback(d);
			}
		});

		const success = contextbridge.invoke<ServerBridgeApiSubscribe>(
			MessagingServiceBridgeTopics.Subscribe,
			LuauContext.Protected,
			topic,
		);

		if (!success) {
			retVal(); // Go ahead and unsubscribe since the request wasn't successful. No-op returned method
			return {
				success: false,
				unsubscribe: () => { },
			};
		}

		return {
			success,
			unsubscribe: retVal,
		};
	}

	/**
	 * Publishes data to a topic, allowing other subscribers to receive the message.
	 * @param topic The topic to publish to.
	 * @param data The data to be sent
	 * @returns A boolean indicating whether the publish was successful.
	 */
	public Publish(topic: string, data: any): boolean {
		this.CheckTopicName(topic);
		return contextbridge.invoke<ServerBridgeApiPublish>(
			MessagingServiceBridgeTopics.Publish,
			LuauContext.Protected,
			topic,
			json.encode(data),
		);
	}

}
