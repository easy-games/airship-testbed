import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export const enum MessagingServiceBridgeTopics {
	Subscribe = "MessagingService:Subscribe",
	Unsubscribe = "MessagingService:Unsubscribe",
	Publish = "MessagingService:Publish",
	IncomingMessage = "MessagingService:IncomingMessage",
}

export type ServerBridgeApiSubscribe = (topic: string) => void;
export type ServerBridgeApiUnsubscribe = (topic: string) => void;
export type ServerBridgeApiPublish = (topic: string, data: string) => { success: boolean };

enum Scope {
	Game = 0,
	Server = 1,
}

/**
 * The maximum delay in seconds for any retry attempt.
 */
const MAX_DELAY_SECONDS = 45;

/**
 * The base value for exponential backoff calculation.
 */
const EXPONENTIAL_BASE = 2;

/**
 * The initial delay in seconds for the first retry attempt.
 */
const INITIAL_DELAY_SECONDS = 1;

/**
 * The minimum percentage of the calculated delay to use.
 * This creates a range for the "full jitter" strategy, which randomizes
 * the delay between min_percent*calculated and calculated to prevent
 * thundering herd problems when multiple clients retry simultaneously.
 */
const MIN_DELAY_PERCENT = 0.7;

function calculateDelay(attempts: number): number {
	if (attempts <= 0) {
		return 0;
	}
	// Calculate exponential backoff: initialDelay * (base ^ attempts)
	const calculatedDelay = INITIAL_DELAY_SECONDS * math.pow(EXPONENTIAL_BASE, attempts);

	// Apply jitter: random value between MIN_DELAY_PERCENT*calculatedDelay and calculatedDelay
	const minDelay = calculatedDelay * MIN_DELAY_PERCENT;
	const jitter = (calculatedDelay - minDelay) * math.random();
	const jitteredDelay = minDelay + jitter;

	// Cap the delay at the maximum allowed value
	return math.min(MAX_DELAY_SECONDS, jitteredDelay);
}

@Service({})
export class MessagingService {
	private subscriptionCounts = new Map<string, { topic: TopicDescription; count: number }>();
	private onEvent = new Signal<[topic: TopicDescription, data: string]>();
	private airshipGameEvents = new Signal<[data: any]>();
	private airshipServerEvents = new Signal<[data: any]>();
	public onSocketConnectionChanged = new Signal<[connected: boolean]>();
	public doReconnect = true;
	private customMessagesSent: number = 0;
	private customMessagesReceived: number = 0;
	private unsuccessfulReconnectAttempts: number = 0;
	private lastReconnectAttempt: number = 0;

	constructor() {
		if (!Game.IsServer()) return;
		contextbridge.callback<ServerBridgeApiSubscribe>(MessagingServiceBridgeTopics.Subscribe, (_, topicName) => {
			this.addSubscription({
				scope: Scope.Game,
				topicNamespace: "custom",
				topicName: topicName,
			});
		});

		contextbridge.callback<ServerBridgeApiUnsubscribe>(MessagingServiceBridgeTopics.Unsubscribe, (_, topicName) => {
			this.removeSubscription({
				scope: Scope.Game,
				topicNamespace: "custom",
				topicName: topicName,
			});
		});

		contextbridge.callback<ServerBridgeApiPublish>(MessagingServiceBridgeTopics.Publish, (_, topic, data) => {
			const wasSuccessful = MessagingManager.PublishAsync(Scope.Game, "custom", topic, data);
			if (wasSuccessful) {
				this.customMessagesSent++;
			}
			return {
				success: wasSuccessful,
			};
		});
	}

	private getSubscriptionKey(topic: TopicDescription): string {
		return `${topic.scope}:${topic.topicNamespace}:${topic.topicName}`;
	}

	private addSubscription(topic: TopicDescription): void {
		const key = this.getSubscriptionKey(topic);
		if (this.subscriptionCounts.has(key)) {
			const count = this.subscriptionCounts.get(key)!.count + 1;
			this.subscriptionCounts.set(key, { count, topic });
		} else {
			this.subscriptionCounts.set(key, { count: 1, topic });
			task.defer(() => MessagingManager.SubscribeAsync(topic.scope, topic.topicNamespace, topic.topicName));
		}
	}

	private removeSubscription(topic: TopicDescription) {
		const key = this.getSubscriptionKey(topic);
		if (this.subscriptionCounts.has(key)) {
			const count = this.subscriptionCounts.get(key)!.count - 1;
			if (count <= 0) {
				this.subscriptionCounts.delete(key);
				task.defer(() => MessagingManager.UnsubscribeAsync(topic.scope, topic.topicNamespace, topic.topicName));
			} else {
				this.subscriptionCounts.set(key, { count, topic });
			}
		}
	}

	protected OnStart(): void {
		this.Subscribe(
			{
				scope: Scope.Game,
				topicNamespace: "airship",
				topicName: "multiplex",
			},
			(data) => {
				this.airshipGameEvents.Fire(json.decode(data));
			},
		);

		this.Subscribe(
			{
				scope: Scope.Server,
				topicNamespace: "airship",
				topicName: "multiplex",
			},
			(data) => {
				this.airshipServerEvents.Fire(json.decode(data));
			},
		);

		MessagingManager.Instance.OnEvent((topic, data) => {
			this.onEvent.Fire(topic, data);
			if (topic.scope === Scope.Game && topic.topicNamespace === "custom") {
				this.customMessagesReceived++;
				// cannot broadcast from within a subscribed function
				task.defer(() =>
					contextbridge.broadcast(MessagingServiceBridgeTopics.IncomingMessage, {
						// Cannot broadcast unity object
						topic: {
							scope: topic.scope,
							topicNamespace: topic.topicNamespace,
							topicName: topic.topicName,
						} satisfies TopicDescription,
						data,
					}),
				);
			}
		});

		MessagingManager.Instance.OnDisconnected((reason) => {
			reason = reason || "Unknown reason";
			if (time() - this.lastReconnectAttempt < 5) {
				this.unsuccessfulReconnectAttempts++;
			} else {
				this.unsuccessfulReconnectAttempts = 0;
			}
			const delay = calculateDelay(this.unsuccessfulReconnectAttempts);
			const delayMsg = this.doReconnect && delay ? "Retrying in " + math.floor(delay) + " seconds." : "";
			warn(`Disconnected from messaging. ${delayMsg}` + reason);
			this.onSocketConnectionChanged.Fire(false);

			if (this.doReconnect) {
				task.defer(() => {
					if (delay) {
						task.wait(delay);
					}
					this.Connect();
				});
			}
		});

		// Disabled in editor since agones is not running.
		if (!Game.IsEditor()) {
			SetInterval(30, () => {
				AgonesCore.Agones.SetAnnotation("MessagingCustomSent", `${this.customMessagesSent}`);
				AgonesCore.Agones.SetAnnotation("MessagingCustomReceived", `${this.customMessagesReceived}`);
			});
		}

		task.defer(() => {
			this.Connect();
		});
	}

	public Subscribe(topic: TopicDescription, callback: (data: string) => void): { unsubscribe: () => void } {
		const unsubscribe = this.onEvent.Connect((evTopic, d) => {
			if (
				topic.scope === evTopic.scope &&
				topic.topicNamespace === evTopic.topicNamespace &&
				topic.topicName === evTopic.topicName
			) {
				callback(d);
			}
		});

		this.addSubscription(topic);

		return {
			unsubscribe: () => {
				unsubscribe();
				this.removeSubscription(topic);
			},
		};
	}

	public async Publish(topic: TopicDescription, data: string): Promise<boolean> {
		if (data === undefined) {
			throw "Data cannot be undefined when publishing to a topic.";
		}

		return MessagingManager.PublishAsync(topic.scope, topic.topicNamespace, topic.topicName, data);
	}

	public IsConnected(): boolean {
		return MessagingManager.IsConnected();
	}

	public Connect(): void {
		if (Game.IsEditor()) return;
		this.lastReconnectAttempt = time();
		this.doReconnect = true;
		let connected = MessagingManager.ConnectAsyncInternal();

		if (connected) {
			for (const [_, { topic }] of this.subscriptionCounts) {
				task.defer(() => {
					const res = MessagingManager.SubscribeAsync(topic.scope, topic.topicNamespace, topic.topicName);
					if (!res) {
						warn(`Failed to re-subscribe to topic: ${topic.topicName} (${topic.topicNamespace})`);
						this.subscriptionCounts.delete(this.getSubscriptionKey(topic));
					}
				});
			}
		}
		this.onSocketConnectionChanged.Fire(connected);
	}
}
