import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { OnStart, Service } from "@easy-games/flamework-core";
import { LoadedMap } from "../Map/LoadedMap";
import { MapService } from "../Map/MapService";

@Service({})
export class EnchantTableService implements OnStart {
	/** The **currently** loaded map. */
	private loadedMap: LoadedMap | undefined;
	/** Reference to enchant table prefab. This is **only** spawned on the **server**. */
	private enchantTablePrefab: Object;

	constructor(private readonly mapService: MapService, private readonly teamService: TeamService) {
		this.enchantTablePrefab = AssetBridge.Instance.LoadAsset<Object>(
			"Server/Resources/Prefabs/EnchantTable.prefab",
		);
	}

	OnStart(): void {
		task.spawn(() => {
			this.loadedMap = this.mapService.WaitForMapLoaded();
			this.SpawnEnchantTables();
		});
	}

	/**
	 * Spawns an enchant table at every team's spawn. This assumes that a sign named `${team_id}_misc_2`
	 * exists at each spawn.
	 */
	private SpawnEnchantTables(): void {
		if (!this.loadedMap) return;
		const halfBlock = 0.5;
		const teams = this.teamService.GetTeams();
		for (const team of teams) {
			const tableSpawnPos = this.loadedMap.GetWorldPosition(`${team.id}_misc_2`);
			if (tableSpawnPos) {
				const enchantTable = GameObjectUtil.InstantiateAt(
					this.enchantTablePrefab,
					tableSpawnPos.position.sub(new Vector3(0, halfBlock, 0)),
					tableSpawnPos.rotation,
				);
				NetworkUtil.Spawn(enchantTable);
			}
		}
	}
}
