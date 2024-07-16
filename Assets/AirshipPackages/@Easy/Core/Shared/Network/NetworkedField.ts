import { Reflect } from "@Easy/Core/Shared/Flamework";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { MapUtil } from "../Util/MapUtil";

interface SyncSerializer<T, U> {
	Serialize(value: T): U;
	Deserialize(value: U): T;
}

export interface NetworkedFieldConfiguration<
	U extends AirshipNetworkBehaviour,
	K extends keyof ExtractMembers<U, ValidNetworkTypes>,
> {
	/**
	 * The name of the function to call when this field is changed
	 */
	Hook?: keyof ExtractMembers<U, (this: U, value: U[K], oldValue: U[K]) => void>;
}

type ValidNetworkTypes = boolean | string | number | object;

export interface NetworkedField {
	readonly Name: string;
	readonly OnChanged?: ChangedListener;
	// readonly Configuration: NetworkedFieldConfiguration<AirshipNetworkBehaviour, any>;
}
export type NetworkedFieldsList = Map<string, NetworkedField>;

export const NetworkedFields = new Map<AirshipNetworkBehaviour, NetworkedFieldsList>();

type ChangedListener = (obj: AirshipNetworkBehaviour, value: unknown, oldValue: unknown) => void;

/**
 * This is an experimental feature
 */
export function NetworkedField<
	U extends AirshipNetworkBehaviour,
	K extends keyof ExtractMembers<U, ValidNetworkTypes> & string,
>(config: NetworkedFieldConfiguration<U, K> = {}) {
	return (ctor: U, propertyKey: K) => {
		const fields = MapUtil.GetOrCreate(NetworkedFields, ctor, (): NetworkedFieldsList => new Map());

		// Set metadata for this NetworkedField
		fields.set(propertyKey, {
			Name: propertyKey,
			OnChanged: config.Hook ? (ctor[config.Hook] as ChangedListener) : undefined,
		});
	};
}
