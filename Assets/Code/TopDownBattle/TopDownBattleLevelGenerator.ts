import { Game } from "@Easy/Core/Shared/Game";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";

export default class TopDownBattleLevelGenerator extends AirshipBehaviour {
	@Header("Templates")
	public baseTemplate!: GameObject;
	public wallTemplate!: GameObject;

	@Header("Variables")
	// public baseBlockType: SurvivalBlockType = SurvivalBlockType.EMERALD_BLOCK;
	// public floorBlockType: SurvivalBlockType = SurvivalBlockType.GRASS;
	// public wallBlockType: SurvivalBlockType = SurvivalBlockType.STONE_BRICK;
	// public obstacleBlockType: SurvivalBlockType = SurvivalBlockType.OAK_WOOD_PLANK;
	public levelSize = 75;
	public wallHeight = 5;
	public minBlockCount = 10;
	public maxBlockCount = 30;
	public minBlockSize = 2;
	public maxBlockSize = 6;

	private levelHalfSize = 0;

	public override OnEnable(): void {
	 	//Only the server needs to generate the level
		if (Game.IsClient()) {
			return;
		}
	 	//Store half size for conveniance
	 	this.levelHalfSize = math.floor(this.levelSize / 2);
		this.GenerateBase();
		this.GenerateWalls();
		this.GenerateObstacles();
	}

	public GenerateBase() {
		//Create the object in the scene
		let base = Object.Instantiate(this.baseTemplate, Vector3.zero, Quaternion.identity);
		//Sync the creation to all the clients
		NetworkUtil.Spawn(base);
	}

	public GenerateWalls() {
	// 	//Fill an array of positions that will be each wall point
	// 	let blockPositions: Vector3[] = [];
	// 	//Each id is an index to the type of block. Parallel to blockPositions
	// 	let blockIds: string[] = [];
	// 	let blockI = 0; //Index to block positions
	// 	//Close wall
	// 	for (let i = 0; i < this.levelSize; i++) {
	// 		for (let height = 0; height < this.wallHeight; height++) {
	// 			blockPositions[blockI] = new Vector3(-this.levelHalfSize + i, height, this.levelHalfSize);
	// 			blockIds[blockI] = this.wallBlockType;
	// 			blockI++;
	// 		}
	// 	}
	// 	//Far wall
	// 	for (let i = 0; i < this.levelSize; i++) {
	// 		for (let height = 0; height < this.wallHeight; height++) {
	// 			blockPositions[blockI] = new Vector3(-this.levelHalfSize + i, height, -this.levelHalfSize);
	// 			blockIds[blockI] = this.wallBlockType;
	// 			blockI++;
	// 		}
	// 	}
	// 	//Left Wall
	// 	for (let i = 1; i < this.levelSize; i++) {
	// 		for (let height = 0; height < this.wallHeight; height++) {
	// 			blockPositions[blockI] = new Vector3(-this.levelHalfSize, height, -this.levelHalfSize + i);
	// 			blockIds[blockI] = this.wallBlockType;
	// 			blockI++;
	// 		}
	// 	}
	// 	//Right Wall
	// 	for (let i = 1; i < this.levelSize; i++) {
	// 		for (let height = 0; height < this.wallHeight; height++) {
	// 			blockPositions[blockI] = new Vector3(this.levelHalfSize, height, -this.levelHalfSize + i);
	// 			blockIds[blockI] = this.wallBlockType;
	// 			blockI++;
	// 		}
	// 	}
	// 	//Create floor
	// 	for (let x = -this.levelHalfSize; x < this.levelHalfSize; x++) {
	// 		for (let z = -this.levelHalfSize; z < this.levelHalfSize; z++) {
	// 			blockPositions[blockI] = new Vector3(x, -1, z);
	// 			blockIds[blockI] = this.floorBlockType;
	// 			blockI++;
	// 		}
	// 	}
	// 	//Write the blocks to the VoxelWorld
	// 	this.world.PlaceBlockGroupById(blockPositions, blockIds);
	}

	public GenerateObstacles() {
		//Get a random number of blocks to spawn
		let numberOfBlocks = math.random(this.minBlockCount, this.maxBlockCount);
		for (let i = 0; i < numberOfBlocks; i++) {
			//Randomize the position and size
			let blockSize = math.random(this.minBlockSize, this.maxBlockSize);
			let foundSpot = false;
			let startingPosition = Vector3.zero;
			let count =0;
			do{
				startingPosition = new Vector3(
					math.random(-this.levelHalfSize, this.levelHalfSize),
					0,
					math.random(-this.levelHalfSize, this.levelHalfSize),
				);
				foundSpot = this.CanPlaceObstacle(startingPosition, blockSize/2);
				count++;
			}while(!foundSpot && count < 50);
			this.CreateBlock(startingPosition, blockSize);
		}
	}

	private CreateBlock(pos: Vector3, size: number){
		//Create the object in the scene
		let wall = Object.Instantiate(this.wallTemplate, pos, Quaternion.identity);
		wall.transform.localScale = Vector3.one.mul(size);
		//Sync the creation to all the clients
		NetworkUtil.Spawn(wall);
	}

	private CanPlaceObstacle(pos: Vector3, halfSize: number): boolean {
		//Keep the blocks within the map bounds
		if (
			pos.x < -this.levelHalfSize + halfSize ||
			pos.x > this.levelHalfSize - halfSize ||
			pos.z < -this.levelHalfSize + halfSize ||
			pos.z > this.levelHalfSize - halfSize
		) {
			//Too close to a wall
			return false;
		}
		//Keep the blocks away from our home base
		let flatPos = new Vector3(pos.x, 0, pos.z);
		if (flatPos.magnitude < 4+halfSize) {
			//Too close to base
			return false;
		}
		//Can place a block here
		return true;
	}
}
