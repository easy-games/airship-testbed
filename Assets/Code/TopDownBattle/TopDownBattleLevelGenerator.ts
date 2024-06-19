import { Game } from "@Easy/Core/Shared/Game";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";

export default class TopDownBattleLevelGenerator extends AirshipBehaviour {
	@Header("Referneces")
	public floorTransform!: Transform;

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
		if (!Game.IsServer()) {
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
	 	//Fill an array of positions that will be each wall point

	 	//Close wall
		this.CreateBlock(new Vector3(0, 0, -this.levelHalfSize), 
				new Vector3(this.levelSize, this.wallHeight, 1));

		//Far wall
		this.CreateBlock(new Vector3(0, 0, this.levelHalfSize), 
		new Vector3(this.levelSize, this.wallHeight, 1));
		
		//Left Wall
		this.CreateBlock(new Vector3(-this.levelHalfSize, 0, 0), 
		new Vector3(1, this.wallHeight, this.levelSize-.5));

		//Right Wall
		this.CreateBlock(new Vector3(this.levelHalfSize, 0, 0), 
		new Vector3(1, this.wallHeight, this.levelSize-.5));

		//Create floor
		this.floorTransform.localScale = new Vector3(this.levelSize, 1, this.levelSize);
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
			this.CreateBlock(startingPosition, Vector3.one.mul(blockSize));
		}
	}

	private CreateBlock(pos: Vector3, size: Vector3){
		//Create the object in the scene
		let wall = Object.Instantiate(this.wallTemplate, pos, Quaternion.identity);
		wall.transform.localScale = size;
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
