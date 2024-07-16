export interface QueuedPropertyUpdate {
	readonly name: string;
	readonly value: unknown;
}

export type NetworkPropertiesSnapshot = Map<number, QueuedPropertyUpdate[]>;
