import { Game } from "@Easy/Core/Shared/Game";
import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { BlockDataAPI, CoreBlockMetaKeys } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { World } from "@Easy/Core/Shared/VoxelWorld/World";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";

export default class TopDownBattleLevelGenerator extends AirshipBehaviour {
	@Header("Variables")
	public levelSize = 75;
	public wallHeight = 3;
	public wallBlockType = 1;

	private world!: World;

	public override OnEnable(): void {
		//Only the server needs to generate the level
		if (Game.IsClient()) {
			return;
		}

		//Load this world
		let foundWorld = WorldAPI.GetMainWorld();
		if (!foundWorld) {
			error("No voxel world found in game");
		}
		this.world = foundWorld;

		//Don't place blocks until the world is loaded
		this.world.OnFinishedWorldLoading(() => {
			//Make a cube at the center of the map (Our defense point)
			this.world.PlaceBlockByItemType(Vector3.zero, CoreItemType.STONE);
			this.CreateWalls();
			this.GenerateRandomizedBlocks();
		});
	}

	public CreateWalls() {
		print("Generating walls");
		//Fill an array of positions that will be each wall point
		let blockPositions: Vector3[] = [];
		//Each id is an index to the type of block. Parallel to blockPositions
		let blockIds: number[] = [];

		let blockI = 0; //Index to block positions
		let levelHalfSize = math.floor(this.levelSize / 2);

		//Close wall
		for (let i = 0; i < this.levelSize; i++) {
			for (let height = 1; height <= this.wallHeight; height++) {
				blockPositions[blockI] = new Vector3(-levelHalfSize + i, 1, levelHalfSize);
				blockIds[blockI] = this.wallBlockType;
				blockI++;
			}
		}
		//Far wall
		for (let i = 0; i < this.levelSize; i++) {
			for (let height = 1; height <= this.wallHeight; height++) {
				blockPositions[blockI] = new Vector3(-levelHalfSize + i, 1, -levelHalfSize);
				blockIds[blockI] = this.wallBlockType;
				blockI++;
			}
		}
		//Left Wall
		for (let i = 1; i < this.levelSize - 2; i++) {
			for (let height = 1; height <= this.wallHeight; height++) {
				blockPositions[blockI] = new Vector3(-levelHalfSize, 1, -levelHalfSize + i);
				blockIds[blockI] = this.wallBlockType;
				blockI++;
			}
		}
		//Right Wall
		for (let i = 1; i < this.levelSize - 2; i++) {
			for (let height = 1; height <= this.wallHeight; height++) {
				blockPositions[blockI] = new Vector3(levelHalfSize, 1, -levelHalfSize + i);
				blockIds[blockI] = this.wallBlockType;
				blockI++;
			}
		}

		//Write the blocks to the VoxelWorld
		print("WriteVoxelGroupAtTS");
		//this.world.WriteVoxelGroupAtTS({ pos: blockPositions, blockId: blockIds }, false);
	}

	public GenerateRandomizedBlocks() {}
}
