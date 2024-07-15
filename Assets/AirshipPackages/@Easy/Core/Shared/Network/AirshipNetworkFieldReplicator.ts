import { Player } from "../Player/Player";
import { SetInterval } from "../Util/Timer";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkedFieldsList } from "./NetworkedField";
import { ObserversRpc } from "./ObserversRpc";
import { ServerRpc } from "./ServerRpc";
import { TargetRpc } from "./TargetRpc";

type NetworkSnapshot = Map<AirshipNetworkBehaviour, NetworkField>;
type NetworkValue = defined | undefined;

interface NetworkField {
	readonly Instance: AirshipNetworkBehaviour;
	readonly Field: string;
	IsDirty: boolean;
	Value: unknown;
}

/**
 * The backing component for `@NetworkField()` usage
 *
 * If your component has one of these, it likely uses a `NetworkField` decorator on one of the components
 */
@AirshipComponentMenu("") // hidden
export default class AirshipNetworkFieldReplicator extends AirshipNetworkBehaviour {
	private fieldStates: NetworkSnapshot = new Map(); // Local store of the field values

	@TargetRpc({})
	private SendSnapshotToClient(player: Player, snapshot: NetworkSnapshot) {
		this.fieldStates = snapshot;
	}

	@ObserversRpc({ RunOnServer: false })
	private ReplicateFieldAll(fieldName: string, fieldValue: NetworkValue) {}

	/**
	 * Request the latest snapshot of the fields on this network behaviour
	 */
	@ServerRpc({ RunLocally: false })
	public RequestStateSnapshot(player: Player) {
		this.SendSnapshotToClient(player, this.fieldStates);
	}

	public BindPropertiesToBehaviour(replicator: AirshipNetworkBehaviour, properties: NetworkedFieldsList) {}

	public Start(): void {
		SetInterval(0.3, () => {});
	}
}
