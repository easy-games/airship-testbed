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
	private CheckKey(key: string): void {
		if (!key || key.match("^[%w%_%-]+$")[0] === undefined) {
			throw error(
				`Bad key provided (${key}). Ensure that your data store keys only include alphanumeric characters or _-`,
			);
		}
	}

	public Subscribe<T = unknown>(topic: string, callback: (data: T) => void): () => void {
		this.CheckKey(topic);

		const retVal = this.onEvent.Connect((e, d) => {
			if (e === topic) {
				callback(json.decode(d));
			}
		});

		contextbridge.invoke<ServerBridgeApiSubscribe>(
			MessagingServiceBridgeTopics.Subscribe,
			LuauContext.Protected,
			topic,
		);

		return retVal;
	}

	public Publish(topic: string, data: string): undefined {
		this.CheckKey(topic);
		contextbridge.invoke<ServerBridgeApiPublish>(
			MessagingServiceBridgeTopics.Publish,
			LuauContext.Protected,
			topic,
			data,
		);
	}

}
