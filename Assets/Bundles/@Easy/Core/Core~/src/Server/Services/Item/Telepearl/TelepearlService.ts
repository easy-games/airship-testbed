import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { ItemType } from "Shared/Item/ItemType";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Service({})
export class TelepearlService implements OnStart {
	OnStart(): void {
		CoreServerSignals.ProjectileHit.Connect((event) => {
			print("projectile itemType: " + event.projectile.itemType);
			if (event.projectile.itemType !== ItemType.TELEPEARL) {
				return;
			}

			// Verify player threw telepearl.
			print("telepearl.1");
			if (!event.projectile.shooter) {
				return;
			}
			print("telepearl.2");

			const adjustedHitPoint = event.hitPosition.add(event.velocity.normalized.mul(0.01));

			const world = WorldAPI.GetMainWorld();
            if (world) {
                const hitBlock = world?.GetBlockAt(adjustedHitPoint);

                DebugUtil.DrawSphere(event.hitPosition, Quaternion.identity, 0.1, Color.red, 4, 5);
                DebugUtil.DrawSphere(adjustedHitPoint, Quaternion.identity, 0.15, Color.blue, 4, 5);

                // Verify that we hit a voxel.
                if (!hitBlock) {
                    print(`Didn't hit block: ${adjustedHitPoint}`);
                    return;
                }
                print("telepearl.3");

                let topMostBlockPos = adjustedHitPoint;
                let foundAir = false;
                for (let i = 0; i < 30; i++) {
                    print(`topMostVoxelPoint: ${topMostBlockPos}`);

                    const testPos = topMostBlockPos.add(new Vector3(0, 1, 0));
                    const testBlock = world.GetBlockAt(testPos);

                    if (testBlock.IsAir()) {
                        foundAir = true;
                        break;
                    }

                    topMostBlockPos = testPos;
                }
                if (!foundAir) {
                    print("Failed to find air for telepearl.");
                    return;
                }

                // Land on TOP of the top-most block.
                const teleportPos = topMostBlockPos.add(new Vector3(0, 1, 0));

                // Teleport player to hit position.
                const humanoid = event.projectile.shooter.GetEntityDriver();
                humanoid.Teleport(teleportPos);
            }
		});
	}
}
