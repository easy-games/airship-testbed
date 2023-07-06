import Object from "@easy-games/unity-object-utils";
import { Team } from "Shared/Team/Team";
import StringUtils from "Shared/Util/StringUtil";
import { MapPosition } from "./MapPosition";
import { GameMap } from "./Maps";

/** Map alias type. */
export type TeamMapObjects = { [teamId: string]: { [objectId: string]: MapPosition } };
/** Map alias type. */
export type MiscMapObjects = { [objectId: string]: MapPosition | MapPosition[] };

export interface MapObjects {
	/** Map objects that correspond to a specific team. */
	teamMapObjects: TeamMapObjects;
	/** Map objects that only correspond to the map. */
	miscMapObjects: MiscMapObjects;
}

export interface SaveObjectTS {
	name: string;
	position: Vector3;
	rotation: Quaternion;
}

export class LoadedMap {
	/** Map objects from Voxel Binary file. */
	private mapObjects: MapObjects = { teamMapObjects: {}, miscMapObjects: {} };

	/** The loaded map. */
	private loadedMap: GameMap;

	constructor(gameMap: GameMap, mapObjects: SaveObjectTS[]) {
		this.loadedMap = gameMap;
		this.ParseMapObjects(mapObjects);
	}

	/** Parses map objects from Voxel Binary file and builds lookup table. */
	private ParseMapObjects(mapObjects: SaveObjectTS[]): void {
		for (let i = 0; i < mapObjects.size(); i++) {
			const val = mapObjects[i];
			/* If map object name is underscore delimited, first part is team id.  */
			const parts = val.name.split("_");
			const isTeamObject = parts.size() > 1;
			if (isTeamObject) {
				const teamId = parts[0];
				const objectId = parts[1];
				if (!teamId || !objectId) continue;
				const teamBucket = this.mapObjects.teamMapObjects[teamId];
				if (!teamBucket) {
					this.mapObjects.teamMapObjects[teamId] = {};
				}
				this.mapObjects.teamMapObjects[teamId][objectId] = new MapPosition(val.position, val.rotation);
			}
			/* Otherwise, we're working with generic map objects, pool generators in buckets. */
			if (StringUtils.includes(val.name, "EmeraldGenerator")) {
				const generators = this.mapObjects.miscMapObjects["EmeraldGenerators"] as MapPosition[] | undefined;
				const mapPosition = new MapPosition(val.position, val.rotation);
				if (generators) {
					generators.push(mapPosition);
				} else {
					this.mapObjects.miscMapObjects["EmeraldGenerators"] = [mapPosition];
				}
			} else if (StringUtils.includes(val.name, "DiamondGenerator")) {
				const generators = this.mapObjects.miscMapObjects["DiamondGenerators"] as MapPosition[] | undefined;
				const mapPosition = new MapPosition(val.position, val.rotation);
				if (generators) {
					generators.push(mapPosition);
				} else {
					this.mapObjects.miscMapObjects["DiamondGenerators"] = [mapPosition];
				}
			} else {
				this.mapObjects.miscMapObjects[val.name] = new MapPosition(val.position, val.rotation);
			}
		}
	}

	/**
	 * Fetch all team map objects for a provided map object id.
	 * @param objectId A map object id.
	 * @returns All map objects for provided id.
	 */
	private GetTeamMapObjectsById(objectId: string): { [teamId: string]: MapPosition } {
		const values: { [teamId: string]: MapPosition } = {};
		Object.keys(this.mapObjects.teamMapObjects).forEach((teamId) => {
			const teamObjects = this.mapObjects.teamMapObjects[teamId as string];
			values[teamId as string] = teamObjects[objectId];
		});
		return values;
	}

	/**
	 * Fetch currently loaded game map.
	 * @returns Currently loaded game map.
	 */
	public GetLoadedGameMap(): GameMap {
		return this.loadedMap;
	}

	/**
	 * @returns Map center position and rotation if sign `center` exists.
	 */
	public GetMapCenter(): MapPosition | undefined {
		return this.mapObjects.miscMapObjects["Center"] as MapPosition | undefined;
	}

	public GetMapSpawnPlatform(): MapPosition | undefined {
		return this.mapObjects.miscMapObjects["SpawnPlatform"] as MapPosition | undefined;
	}

	/**
	 * Fetch all team map objects.
	 * @returns All team map objects.
	 */
	public GetAllTeamMapObjects(): TeamMapObjects {
		return this.mapObjects.teamMapObjects;
	}

	/**
	 * Fetch all map objects for a given team.
	 * @param teamId A team id.
	 * @returns Team map objects for a given team.
	 */
	public GetTeamMapObjects(teamId: string): { [objectId: string]: MapPosition } {
		return this.mapObjects.teamMapObjects[teamId];
	}

	/**
	 * Fetch all misc map objects.
	 * @returns All misc map objects.
	 */
	public GetMiscMapObjects(): { [objectId: string]: MapPosition | MapPosition[] } {
		return this.mapObjects.miscMapObjects;
	}

	/**
	 * Fetch all team generator map objects.
	 * @returns Map of team id to generator map position.
	 */
	public GetTeamGenerators(): { [teamId: string]: MapPosition } {
		return this.GetTeamMapObjectsById("Generator");
	}

	/**
	 * Fetch diamond generator map objects.
	 * @returns Diamond generator map objects, if exists.
	 */
	public GetMapDiamondGenerators(): MapPosition[] | undefined {
		return this.mapObjects.miscMapObjects["DiamondGenerators"] as MapPosition[] | undefined;
	}

	/**
	 * Fetch map emerald generator map objects.
	 * @returns Emerald generator map objects, if exists.
	 */
	public GetMapEmeraldGenerators(): MapPosition[] | undefined {
		return this.mapObjects.miscMapObjects["EmeraldGenerators"] as MapPosition[] | undefined;
	}

	/**
	 * Fetch all bed map objects.
	 * @returns A map of team id to bed position.
	 */
	public GetAllBeds(): { [teamId: string]: MapPosition } {
		return this.GetTeamMapObjectsById("Bed");
	}

	/**
	 * Fetch all shopkeeper map objects.
	 * @returns A map of team id to shopkeeper position.
	 */
	public GetAllShopkeepers(): { [teamId: string]: MapPosition } {
		return this.GetTeamMapObjectsById("Shop");
	}

	/**
	 * Fetch all team upgrade map objects.
	 * @returns A map of team id to team upgrade position.
	 */
	public GetAllTeamUpgrades(): { [teamId: string]: MapPosition } {
		return this.GetTeamMapObjectsById("Upgrades");
	}

	/**
	 * Returns spawn position for a specific team.
	 * @param team A team.
	 * @returns A team spawn position if it exists.
	 */
	public GetSpawnPositionForTeam(team: Team): MapPosition | undefined {
		return this.mapObjects.teamMapObjects[team.id]["Spawn"];
	}
}
