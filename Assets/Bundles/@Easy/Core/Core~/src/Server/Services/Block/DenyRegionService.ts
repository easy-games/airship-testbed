import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DenyRegionDto } from "Shared/DenyRegion/DenyRegionMeta";
import { SignalPriority } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";

/** Deny region snapshot send delay. */
const SNAPSHOT_DELAY = 0.5;

@Service({})
export class DenyRegionService implements OnStart {
	/** Sequential deny region id counter. */
	private denyRegionIdCounter = 0;
	/** Tracked deny regions for recreation on client. */
	private trackedDenyRegions: DenyRegionDto[] = [];
	/** Deny voxel positions. */
	private denyVoxelPositions = new Set<Vector3>();

	OnStart(): void {
		/* Cancel block placed if voxel position is inside of a deny region. */
		CoreServerSignals.BeforeBlockPlaced.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (this.InDenyRegion(event.pos)) event.SetCancelled(true);
		});
		/* Send deny region snapshot to late joiners. */
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Task.Delay(SNAPSHOT_DELAY, () => {
				CoreNetwork.ServerToClient.DenyRegionSnapshot.Server.FireClient(
					event.player.clientId,
					this.trackedDenyRegions,
				);
			});
		});
	}

	/**
	 * Creates a deny region at `origin` of size `size`.
	 * @param origin The deny region origin.
	 * @param size The deny region size.
	 */
	public CreateDenyRegion(origin: Vector3, size: Vector3): void {
		const newTrackedDenyRegion: DenyRegionDto = {
			origin: origin,
			size: size,
			id: tostring(this.denyRegionIdCounter++),
		};
		this.trackedDenyRegions.push(newTrackedDenyRegion);
		for (let x = origin.x - math.floor(size.x / 2); x <= origin.x + math.ceil(size.x / 2); x++) {
			for (let y = origin.y; y <= origin.y + size.y; y++) {
				for (let z = origin.z - math.floor(size.z / 2); z <= origin.z + math.ceil(size.z / 2); z++) {
					const denyPosition = new Vector3(x, y, z);
					this.denyVoxelPositions.add(denyPosition);
				}
			}
		}
		CoreNetwork.ServerToClient.DenyRegionCreated.Server.FireAllClients(newTrackedDenyRegion);
	}

	/**
	 * Checks whether or not `position` is inside of a deny region.
	 * @param position A voxel position.
	 * @returns Whether or not `position` is inside of a deny region.
	 */
	public InDenyRegion(position: Vector3): boolean {
		return this.denyVoxelPositions.has(position);
	}
}
