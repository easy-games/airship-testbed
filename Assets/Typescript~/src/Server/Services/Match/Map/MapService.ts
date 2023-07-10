import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { decode } from "Server/Lib/json";
import { ServerSignals } from "Server/ServerSignals";
import { BWEditorConfig } from "Shared/Editor/BWEditorConfig";
import { QueueMeta } from "Shared/Queue/QueueMeta";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Task } from "Shared/Util/Task";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { MatchService } from "../MatchService";
import { LoadedMap, SaveObjectTS } from "./LoadedMap";

@Service({})
export class MapService implements OnStart {
	/** Map for current match. */
	private gameMapId: string | undefined;
	/** Voxel binary file for current map. */
	private voxelBinaryFile: VoxelBinaryFile | undefined;
	/** Queue meta for current match. */
	private queueMeta: QueueMeta | undefined;
	/** Loaded map instance for current match. */
	private loadedMap: LoadedMap | undefined;
	/** Whether or not map is fully loaded. */
	private mapLoaded = false;

	OnStart(): void {
		Task.Spawn(() => {
			this.queueMeta = Dependency<MatchService>().WaitForQueueReady();

			let mapId = RandomUtil.FromArray(this.queueMeta.maps);
			if (RunUtil.IsEditor()) {
				const gameConfigFile = AssetBridge.LoadAsset<TextAsset>("Shared/Resources/BWEditorConfig.json");
				const gameConfig = decode<BWEditorConfig>(gameConfigFile.text);
				mapId = gameConfig.gameMap;
			}

			this.gameMapId = mapId;
			this.BuildMap(this.gameMapId);
		});
	}

	public BuildMap(mapId: string): void {
		/* Fetch world, load map voxel file and block defines. */
		print("Loading world " + mapId);
		const world = WorldAPI.GetMainWorld();
		this.voxelBinaryFile = AssetBridge.LoadAsset<VoxelBinaryFile>(`Server/Resources/Worlds/${mapId}.asset`);
		const blockDefines = AssetBridge.LoadAsset<TextAsset>("Shared/Resources/VoxelWorld/BlockDefines.xml");

		/* Load world. */
		// world.LoadEmptyWorld(blockDefines, "");
		// const grass = GetItemMeta(ItemType.GRASS).BlockId;
		// world.WriteVoxelAt(new Vector3(1, 1, 1), grass!);
		world.LoadWorldFromVoxelBinaryFile(this.voxelBinaryFile, blockDefines);
		/* Parse map objects and finish loading map. */
		/* TEMP: This is to get around memory pinning issue. */
		let mapObjects = new Array<SaveObjectTS>();
		const rawMaps = this.voxelBinaryFile.GetMapObjects();
		for (let i = 0; i < rawMaps.Length; i++) {
			const data = rawMaps.GetValue(i);
			mapObjects.push({
				name: data.name,
				position: data.position,
				rotation: data.rotation,
			});
		}
		this.loadedMap = new LoadedMap(mapId, mapObjects);
		ServerSignals.MapLoad.fire(this.loadedMap);
		this.mapLoaded = true;
	}

	/**
	 * Yields until map loads.
	 * @returns The loaded map.
	 */
	public WaitForMapLoaded(): LoadedMap {
		if (this.loadedMap && this.mapLoaded && this.voxelBinaryFile) return this.loadedMap;
		while (!this.loadedMap && !this.mapLoaded && !this.voxelBinaryFile) {
			Task.Wait(0.1);
		}
		return this.loadedMap!;
	}

	/**
	 * @returns The loaded map.
	 */
	public GetLoadedMap(): LoadedMap | undefined {
		return this.loadedMap;
	}

	/**
	 * @returns The game map.
	 */
	public GetGameMapId(): string | undefined {
		return this.gameMapId;
	}
}
