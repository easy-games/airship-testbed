import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { MapUtil } from "../Util/MapUtil";

export const enum NetworkedFieldPermissions {
	/**
	 * The field can be only changed by the server
	 */
	Server,
	/**
	 * The field can only be changed by the server _or_ owner
	 */
	Owner,
}

export interface NetworkedFieldConfiguration<
	TBehaviour extends AirshipNetworkBehaviour,
	TBehaviourPropertyKey extends keyof ExtractMembers<TBehaviour, ValidNetworkTypes>,
> {
	/**
	 * The name of the function to call when this field is changed
	 */
	readonly Hook?: keyof ExtractMembers<
		TBehaviour,
		(
			this: TBehaviour,
			value: TBehaviour[TBehaviourPropertyKey],
			oldValue: TBehaviour[TBehaviourPropertyKey],
		) => void
	>;

	/**
	 * The permissions of this network field
	 * @deprecated Not yet implemented - will be implemented soon
	 */
	readonly Permissions?: NetworkedFieldPermissions;
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
