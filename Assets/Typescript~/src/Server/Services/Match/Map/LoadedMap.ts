import { WorldPosition } from "./MapPosition";


export class LoadedMap {
	/** Map objects from Voxel Binary file. */
    private worldPositions = new Map<string, WorldPosition>();

    private defaultWorldPosition = new WorldPosition(new Vector3(0, 0, 0), Quaternion.identity);

	/** The loaded map. */
	private loadedMapId: string;

	constructor(gameMapId: string) {
		this.loadedMapId = gameMapId;
	}

    public AddWorldPositions(key: string, worldPosition: WorldPosition) {
        this.worldPositions.set(key, worldPosition);
    }

	/**
	 * Fetch currently loaded game map.
	 * @returns Currently loaded game map.
	 */
	public GetLoadedGameMapId(): string {
		return this.loadedMapId;
	}

	public GetWorldPosition(id: string): WorldPosition {
		return this.worldPositions.get(id) ?? this.defaultWorldPosition;
	}

    public GetWorldPositionsForTag(tag: string): WorldPosition[] {
        let results = new Array<WorldPosition>();

        let i = 1;
        while (this.HasWorldPosition(tag + i)) {
            results.push(this.GetWorldPosition(tag + i));
            i++;
        }

        return results;
    }

    public HasWorldPosition(id: string): boolean {
        return this.worldPositions.has(id);
    }

	/**
	 * @returns Map center position and rotation if sign `center` exists.
	 */
	public GetCenter(): WorldPosition {
		return this.GetWorldPosition("center");
	}

	public GetSpawnPlatform(): WorldPosition {
		return this.GetWorldPosition("spectator_spawn");
	}
}
