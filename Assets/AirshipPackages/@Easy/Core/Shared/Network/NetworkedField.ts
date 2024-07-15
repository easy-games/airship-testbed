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
	OnChanged?(this: U, value: U[K]): void;
}

type ValidNetworkTypes = boolean | string | number;

export interface NetworkedField {
	readonly Name: string;
	// readonly Configuration: NetworkedFieldConfiguration<AirshipNetworkBehaviour, any>;
}
export type NetworkedFieldsList = Map<string, NetworkedField>;

export const NetworkedFields = new Map<AirshipNetworkBehaviour, NetworkedFieldsList>();

export function NetworkedField<
	U extends AirshipNetworkBehaviour,
	K extends keyof ExtractMembers<U, ValidNetworkTypes> & string,
>(config: NetworkedFieldConfiguration<U, K> = {}) {
	return (ctor: U, propertyKey: K) => {
		const fields = MapUtil.GetOrCreate(NetworkedFields, ctor, (): NetworkedFieldsList => new Map());
		const rpcId = `${ctor}::${propertyKey}`;

		// Set metadata for this NetworkedField
		fields.set(rpcId, {
			Name: propertyKey,
		});
	};
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

function test() {}

//
//
//
//
//
//
//
//
//
