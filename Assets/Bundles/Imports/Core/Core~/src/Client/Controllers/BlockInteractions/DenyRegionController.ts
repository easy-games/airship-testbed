import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DenyRegionDto } from "Shared/DenyRegion/DenyRegionMeta";
import { SignalPriority } from "Shared/Util/Signal";

@Controller({ loadOrder: -1 })
export class DenyRegionController implements OnStart {
	/** Set of processed deny region ids. */
	private processedDenyRegionIds = new Set<string>();
	/** Deny voxel positions. */
	private denyVoxelPositions = new Set<Vector3>();

	OnStart(): void {
		/* Listen for incoming deny region snapshots. */
		CoreNetwork.ServerToClient.DenyRegionSnapshot.Client.OnServerEvent((denyRegions) => {
			denyRegions.forEach((denyRegion) => this.CreateDenyRegionFromDto(denyRegion));
		});
		/* Listen for created deny regions. */
		CoreNetwork.ServerToClient.DenyRegionCreated.Client.OnServerEvent((denyRegion) => {
			this.CreateDenyRegionFromDto(denyRegion);
		});
		/* Cancel block placed if voxel position is inside of a deny region. */
		CoreClientSignals.BeforeBlockPlaced.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (this.InDenyRegion(event.pos)) event.SetCancelled(true);
		});
	}

	/** Creates a deny region from an incoming Dto. */
	private CreateDenyRegionFromDto(denyRegion: DenyRegionDto): void {
		/* Do not process deny regions twice. */
		if (this.processedDenyRegionIds.has(denyRegion.id)) return;
		this.processedDenyRegionIds.add(denyRegion.id);
		/* Recreate region. */
		const origin = denyRegion.origin;
		const size = denyRegion.size;
		for (let x = origin.x - math.floor(size.x / 2); x <= origin.x + math.ceil(size.x / 2); x++) {
			for (let y = origin.y; y <= origin.y + size.y; y++) {
				for (let z = origin.z - math.floor(size.z / 2); z <= origin.z + math.ceil(size.z / 2); z++) {
					const denyPosition = new Vector3(x, y, z);
					this.denyVoxelPositions.add(denyPosition);
				}
			}
		}
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
