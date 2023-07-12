import { MapPosition, MapPosition as WorldPosition } from "./MapPosition";

export interface WorldPositionCS {
	name: string;
	position: Vector3;
	rotation: Quaternion;
}

export class LoadedMap {
	/** Map objects from Voxel Binary file. */
	private worldPositions = new Map<string, WorldPosition[]>();

	/** The loaded map. */
	private loadedMapId: string;

	constructor(gameMapId: string, mapObjects: WorldPositionCS[]) {
		this.loadedMapId = gameMapId;
		this.ParseWorldPositionsFromCS(mapObjects);
	}

	/** Parses map objects from Voxel Binary file and builds lookup table. */
	private ParseWorldPositionsFromCS(worldPositionsFromCS: WorldPositionCS[]): void {
		for (let i = 0; i < worldPositionsFromCS.size(); i++) {
			const val = worldPositionsFromCS[i];
			const worldPosition = new WorldPosition(val.position, val.rotation);
			let array = this.worldPositions.get(val.name) ?? new Array<MapPosition>();
			array.push(worldPosition);
		}
	}

	/**
	 * Fetch currently loaded game map.
	 * @returns Currently loaded game map.
	 */
	public GetLoadedGameMapId(): string {
		return this.loadedMapId;
	}

	public GetWorldPositions(id: string): WorldPosition[] {
		return this.worldPositions.get(id) ?? [];
	}

	/**
	 * @returns Map center position and rotation if sign `center` exists.
	 */
	public GetCenter(): WorldPosition[] {
		return this.GetWorldPositions("center");
	}

	public GetSpawnPlatform(): WorldPosition[] {
		return this.GetWorldPositions("spectator_spawn");
	}
}
