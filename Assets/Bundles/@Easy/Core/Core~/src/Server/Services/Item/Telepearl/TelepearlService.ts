import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { ItemType } from "Shared/Item/ItemType";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

const CHARACTER_VOXEL_SIZE = 2;

@Service({})
export class TelepearlService implements OnStart {
	OnStart(): void {
		CoreServerSignals.ProjectileHit.Connect((event) => {
			//print("projectile itemType: " + event.projectile.itemType);
			if (event.projectile.ItemType !== ItemType.TELEPEARL) {
				return;
			}

			// Verify player threw telepearl.
			if (!event.projectile.Shooter) {
				return;
			}

			const adjustedHitPoint = event.hitPosition.add(event.velocity.normalized.mul(0.01));

			const world = WorldAPI.GetMainWorld();
			if (world) {
				const hitBlock = world?.GetBlockAt(adjustedHitPoint);

				DebugUtil.DrawSphere(event.hitPosition, Quaternion.identity, 0.1, Color.red, 4, 5);
				DebugUtil.DrawSphere(adjustedHitPoint, Quaternion.identity, 0.15, Color.blue, 4, 5);

				// Verify that we hit a voxel.
				if (!hitBlock) {
					//print(`Didn't hit block: ${adjustedHitPoint}`);
					return;
				}

				let allowedHeight = 12;
				let topMostBlockPos = WorldAPI.GetVoxelPosition(adjustedHitPoint);
				let foundAir = false;
				for (let i = 0; i < allowedHeight; i++) {
					//print(`topMostVoxelPoint: ${topMostBlockPos}`);

					const testPos = topMostBlockPos.add(new Vector3(0, 1, 0));
					const testBlock = world.GetBlockAt(testPos);

					if (testBlock.IsAir()) {
						foundAir = true;
						break;
					}

					topMostBlockPos = testPos;
				}
				if (!foundAir) {
					let nonTopPos = adjustedHitPoint.sub(
						event.velocity.normalized.mul(new Vector3(CHARACTER_VOXEL_SIZE, 0, CHARACTER_VOXEL_SIZE)),
					);
					const below = nonTopPos.sub(new Vector3(0, CHARACTER_VOXEL_SIZE, 0));
					if (world.GetBlockAt(below).IsAir()) {
						nonTopPos = below;
					}
					event.projectile.Shooter.Teleport(nonTopPos);
					return;
				}

				// Land on TOP of the top-most block.
				const teleportPos = topMostBlockPos.add(new Vector3(0.5, 1.05, 0.5));

				// Teleport player to hit position.
				event.projectile.Shooter.Teleport(teleportPos);
			}
		});
	}
}
