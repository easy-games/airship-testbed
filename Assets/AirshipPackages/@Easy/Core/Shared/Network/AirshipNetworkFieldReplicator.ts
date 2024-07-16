import { Game } from "../Game";
import { Player } from "../Player/Player";
import { Bin } from "../Util/Bin";
import inspect from "../Util/Inspect";
import { MapUtil } from "../Util/MapUtil";
import { Signal } from "../Util/Signal";
import { SetInterval } from "../Util/Timer";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkedField, NetworkedFieldsList } from "./NetworkedField";
import { NetworkPropertiesSnapshot, QueuedPropertyUpdate } from "./NetworkReplicatorTypes";
import { ObserversRpc } from "./ObserversRpc";
import { ServerRpc } from "./ServerRpc";
import { TargetRpc } from "./TargetRpc";

interface NetworkPropertyMetadata extends NetworkedField {
	Value: unknown;
}

type NetworkProperties = Map<string, NetworkPropertyMetadata>;
type NetworkSnapshot = Map<number, NetworkProperties>;

function isShallowEqual(a: unknown, b: unknown) {
	const typeA = typeOf(a);
	const typeB = typeOf(b);

	if (typeA !== typeB) return false;

	if (typeA !== "table") {
		return a === b;
	}

	for (const [k, v] of pairs(a!)) {
		const other = b![k as keyof typeof b] as unknown;
		if (other === undefined || other !== v) {
			return false;
		}
	}

	for (const [k, v] of pairs(b!)) {
		const other = a![k as keyof typeof b] as unknown;
		if (other === undefined || other !== v) {
			return false;
		}
	}

	return true;
}

/**
 * The backing component for `@NetworkField()` usage
 *
 * If your component has one of these, it likely uses a `NetworkField` decorator on one of the components
 */
@AirshipComponentMenu("") // hidden
export default class AirshipNetworkFieldReplicator extends AirshipNetworkBehaviour {
	private replicatorBin = new Bin();

	public readonly PropertyChanged = new Signal<
		[objectId: number, field: string, newValue: unknown, oldValue: unknown]
	>();

	private idToBehaviour = new Map<number, AirshipNetworkBehaviour>();
	private propertyUpdateQueue = new Map<number, QueuedPropertyUpdate[]>();

	private fieldStates: NetworkSnapshot = new Map(); // Local store of the field values

	@TargetRpc({})
	private ServerSendSnapshotToClient(_: Player, snapshot: NetworkPropertiesSnapshot) {
		this.ServerReplicateProperties(snapshot); // Handle it like a broadcast would
	}

	@ObserversRpc({ RunOnServer: false })
	private ServerReplicateProperties(snapshot: NetworkPropertiesSnapshot) {
		for (const [id, properties] of snapshot) {
			const behaviour = this.idToBehaviour.get(id);
			if (!behaviour) continue;

			const componentBinding = MapUtil.GetOrCreate(
				this.fieldStates,
				behaviour.AirshipNetworkId,
				(): NetworkProperties => new Map(),
			);

			for (const property of properties) {
				const bindingProperty = componentBinding.get(property.name);
				if (!bindingProperty) continue;

				const oldValue = bindingProperty?.Value;
				bindingProperty.Value = property.value;

				this.PropertyChanged.Fire(id, property.name, property.value, oldValue);
			}
		}
	}

	@ServerRpc({ RequiresOwnership: true })
	public ClientOwnerSetProperties(snapshot: NetworkPropertiesSnapshot) {
		// TODO:
	}

	/**
	 * Request the latest snapshot of the fields on this network behaviour
	 */
	@ServerRpc({ RunLocally: false })
	private ClientRequestStateSnapshot(player?: Player) {
		const snapshot: NetworkPropertiesSnapshot = new Map();

		for (const [id, properties] of this.fieldStates) {
			const behaviour = this.idToBehaviour.get(id);
			if (!behaviour) continue;

			for (const [propertyName, propertyValue] of properties) {
				const property = behaviour[propertyName as never] as unknown;
				const properties = MapUtil.GetOrCreate(snapshot, id, []);
				properties.push({
					name: propertyName,
					value: property,
				});
			}
		}

		this.ServerSendSnapshotToClient(player!, snapshot);
	}

	public ObserveNetworkProperties(behaviour: AirshipNetworkBehaviour, properties: NetworkedFieldsList) {
		const componentBinding = MapUtil.GetOrCreate(
			this.fieldStates,
			behaviour.AirshipNetworkId,
			(): NetworkProperties => new Map(),
		);
		this.idToBehaviour.set(behaviour.AirshipNetworkId, behaviour);

		for (const [, property] of properties) {
			const propertyName = property.Name;
			const propertyValue = behaviour[propertyName as never] as unknown;
			if (typeIs(propertyValue, "table") && getmetatable(propertyValue)) {
				warn(
					"Will not replicate property",
					propertyName,
					"from",
					getmetatable(behaviour),
					" - cannot replicate objects with metatables",
				);
				continue;
			}

			if (typeIs(propertyValue, "userdata")) {
				warn(
					"Will not replicate property",
					propertyName,
					"from",
					getmetatable(behaviour),
					" - cannot replicate userdata",
				);
				continue;
			}

			componentBinding.set(propertyName, {
				...property,
				Value: typeIs(propertyValue, "table") ? table.clone(propertyValue) : propertyValue,
			});
		}

		const connectBin = new Bin();
		connectBin.Add(
			this.PropertyChanged.Connect((id, propertyName, newValue, oldValue) => {
				if (id !== this.AirshipNetworkId) return;

				const networkedField = componentBinding.get(propertyName);
				if (!networkedField) {
					return;
				}

				this[propertyName as keyof this] = newValue as this[keyof this];
				networkedField.OnChanged?.(this, newValue, oldValue);
			}),
		);

		if (Game.IsClient()) {
			this.ClientRequestStateSnapshot();
		}

		return () => {
			connectBin.Clean();
		};
	}

	public OnStartServer(): void {
		this.replicatorBin.Add(
			SetInterval(
				1 / 20, // 20 hz
				() => {
					for (const [id, properties] of this.fieldStates) {
						const behaviour = this.idToBehaviour.get(id);
						if (!behaviour) {
							continue;
						}

						for (const [propertyName, propertyMetadata] of properties) {
							const newValue = behaviour[propertyName as never] as unknown;
							const oldValue = propertyMetadata.Value;

							if (!isShallowEqual(oldValue, newValue)) {
								const queuedUpdates = MapUtil.GetOrCreate(this.propertyUpdateQueue, id, []);
								queuedUpdates.push({
									name: propertyName,
									value: newValue,
								});

								const prop = properties.get(propertyName);
								if (!prop) {
									continue;
								}

								prop.Value = typeIs(newValue, "table") ? table.clone(newValue) : newValue;
								this.PropertyChanged.Fire(id, propertyName, newValue, oldValue);
							}
						}
					}

					if (this.propertyUpdateQueue.size() > 0) {
						this.ServerReplicateProperties(this.propertyUpdateQueue);
						this.propertyUpdateQueue.clear();
					}
				},
			),
		);
	}

	public OnDestroy(): void {
		this.replicatorBin.Clean();
	}
}
