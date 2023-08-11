import { World } from "./World";

export class WorldAPI {
	private static world: World | undefined;
	public static DefaultVoxelHealth = 10;
	public static ChildVoxelId = 32;

	public static GetMainWorld(): World {
		if (this.world) {
			return this.world;
		}

		const voxelWorld = GameObject.Find("VoxelWorld").GetComponent<VoxelWorld>();
		this.world = new World(voxelWorld);
		return this.world;
	}
}
