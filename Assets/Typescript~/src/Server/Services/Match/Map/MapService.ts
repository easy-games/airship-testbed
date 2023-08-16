import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { BWEditorConfig } from "Imports/Core/Shared/Editor/BWEditorConfig";
import { RandomUtil } from "Imports/Core/Shared/Util/RandomUtil";
import { RunUtil } from "Imports/Core/Shared/Util/RunUtil";
import { Task } from "Imports/Core/Shared/Util/Task";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { decode } from "Imports/Core/Shared/json";
import { ServerSignals } from "Server/ServerSignals";
import { MapLoadEvent } from "Server/Signals/MapLoadEvent";
import { QueueMeta } from "Shared/Queue/QueueMeta";
import { MatchService } from "../MatchService";
import { LoadedMap } from "./LoadedMap";
import { WorldPosition } from "./MapPosition";

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
		this.loadedMap = new LoadedMap(mapId);
		const rawMaps = this.voxelBinaryFile.GetMapObjects();
		for (let i = 0; i < rawMaps.Length; i++) {
			const data = rawMaps.GetValue(i);
			this.loadedMap.AddWorldPositions(data.name, new WorldPosition(data.position, data.rotation));
		}

		world.WaitForFinishedLoading().expect();

		ServerSignals.MapLoad.Fire(new MapLoadEvent(this.loadedMap));
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
