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
 * The Messaging Service provides
 */
@Service({})
export class AirshipMessagingService {
	private onEvent = new Signal<[topic: string, data: string]>();
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Messaging = this;
	}

	protected OnStart(): void {
		if (!Game.IsServer()) return;
		contextbridge.subscribe<(context: LuauContext, args: { topicNamespace: string, topicName: string, data: string }) => void>(MessagingServiceBridgeTopics.IncomingMessage, (_, { topicNamespace, topicName, data }) => {
			this.onEvent.Fire(topicName, data);
		});
	}

	/**
	 * Checks that the key is valid
	 */
	private CheckTopicName(topicName: string): void {
		if (!topicName || topicName.match("^[%w%_%-]+$")[0] === undefined) {
			throw error(
				`Bad topic name provided (${topicName}). Ensure that your topic name includes only alphanumeric characters or _-`,
			);
		}
	}

	public Subscribe<T = unknown>(topic: string, callback: (data: T) => void): { success: boolean, unsubscribe: () => void } {
		this.CheckTopicName(topic);

		const retVal = this.onEvent.Connect((e, d) => {
			if (e === topic) {
				callback(json.decode(d));
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

	public Publish(topic: string, data: string): boolean {
		this.CheckTopicName(topic);
		return contextbridge.invoke<ServerBridgeApiPublish>(
			MessagingServiceBridgeTopics.Publish,
			LuauContext.Protected,
			topic,
			data,
		);
	}

}
