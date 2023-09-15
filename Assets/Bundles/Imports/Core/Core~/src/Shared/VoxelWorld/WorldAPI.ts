import { BlockHitDamageFunc } from "./BlockHitDamageFunc";
import { World } from "./World";

export class WorldAPI {
	private static world: World | undefined;
	public static DefaultVoxelHealth = 10;
	public static ChildVoxelId = 32;

	public static GetMainWorld(): World | undefined {
		if (this.world) {
			return this.world;
		}

		const voxelWorld = GameObject.Find("VoxelWorld")?.GetComponent<VoxelWorld>() as VoxelWorld | undefined;
        if (voxelWorld) {
            this.world = new World(voxelWorld);
        }   
		return this.world;
	}

	public static BlockHitDamageFunc: BlockHitDamageFunc = (player, block, blockPos, breakBlockMeta) => {
		return breakBlockMeta.damage;
	};
}
