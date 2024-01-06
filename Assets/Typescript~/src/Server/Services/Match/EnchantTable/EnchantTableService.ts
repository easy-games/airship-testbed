import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { OnStart, Service } from "@easy-games/flamework-core";
import { StatusEffectService } from "Server/Services/Global/StatusEffect/StatusEffectService";
import { EnchantTableMeta } from "Shared/Enchant/EnchantMeta";
import { Network } from "Shared/Network";
import { LoadedMap } from "../Map/LoadedMap";
import { MapService } from "../Map/MapService";

@Service({})
export class EnchantTableService implements OnStart {
	/** The **currently** loaded map. */
	private loadedMap: LoadedMap | undefined;
	/** Reference to enchant table prefab. This is **only** spawned on the **server**. */
	private enchantTablePrefab: Object;
	/** Mapping of network object id to enchant table data. */
	private enchantTableMap = new Map<number, { gameObject: GameObject; teamId: string; unlocked: boolean }>();

	constructor(
		private readonly mapService: MapService,
		private readonly teamService: TeamService,
		private readonly entityService: EntityService,
		private readonly statusEffectService: StatusEffectService,
	) {
		this.enchantTablePrefab = AssetBridge.Instance.LoadAsset<Object>(
			"Server/Resources/Prefabs/EnchantTable.prefab",
		);
	}

	OnStart(): void {
		Network.ClientToServer.EnchantTable.EnchantTableStateRequest.server.SetCallback((_clientId, nob) => {
			return this.HandleTableStateRequest(nob);
		});
		Network.ClientToServer.EnchantTable.EnchantTableRepairRequest.server.OnClientEvent((clientId, nob) => {
			this.HandleEnchantTableRepairRequest(clientId, nob);
		});
		Network.ClientToServer.EnchantTable.EnchantPurchaseRequest.server.OnClientEvent((clientId, nob) => {
			this.HandleEnchantPurchaseRequest(clientId, nob);
		});
		task.spawn(() => {
			this.loadedMap = this.mapService.WaitForMapLoaded();
			task.delay(2, () => this.SpawnEnchantTables());
		});
	}

	/**
	 * Spawns an enchant table at every team's spawn location. The specific spawn location is
	 * determined by the `${team_id}_misc_2` sign.
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
				// NOTE: If you try to fetch the nob BEFORE you call `NetworkUtil.Spawn`
				// it will ALWAYS be 0. Dropping this here just in case it saves
				// someone a bit of time.
				const nob = enchantTable.GetComponent<NetworkObject>().ObjectId;
				this.enchantTableMap.set(nob, {
					gameObject: enchantTable,
					teamId: team.id,
					unlocked: false,
				});
			}
		}
	}

	/**
	 * Returns enchant table data that corresponds to provided table id.
	 *
	 * @param tableNob The network object id of the enchant table being queried.
	 * @returns Relevant enchant table data.
	 */
	private HandleTableStateRequest(tableNob: number): { teamId: string; unlocked: boolean } {
		const enchantTableData = this.enchantTableMap.get(tableNob);
		return {
			teamId: enchantTableData?.teamId ?? "-1",
			unlocked: enchantTableData?.unlocked ?? false,
		};
	}

	/**
	 * Validates incoming repair request and repairs enchant table if applicable.
	 *
	 * @param requestor The client id of the user requesting the table repair.
	 * @param tableNob The network object id of the table being repaired.
	 * @returns Whether or not enchant table was successfully repaired.
	 */
	private HandleEnchantTableRepairRequest(requestor: number, tableNob: number): boolean {
		const tableData = this.enchantTableMap.get(tableNob);
		if (!tableData) return false;
		if (tableData.unlocked) return false;
		const requestorEntity = this.entityService.GetEntityByClientId(requestor);
		if (!requestorEntity) return false;
		if (!(requestorEntity instanceof CharacterEntity)) return false;
		const distanceToTable = tableData.gameObject.transform.position.sub(requestorEntity.GetPosition()).magnitude;
		if (distanceToTable > 20) return false;
		const canAfford = requestorEntity
			.GetInventory()
			.HasEnough(EnchantTableMeta.repairCurrency, EnchantTableMeta.repairCost);
		if (!canAfford) return false;
		requestorEntity.GetInventory().Decrement(EnchantTableMeta.repairCurrency, EnchantTableMeta.repairCost);
		tableData.unlocked = true;
		Network.ServerToClient.EnchantTable.EnchantTableUnlocked.server.FireAllClients(tableNob);
		this.BroadcastTableRepairedMessage(tableData.teamId);
		return true;
	}

	/**
	 * Broadcasts a global message on table repair.
	 *
	 * @param teamId The team whose enchant table was unlocked.
	 */
	private BroadcastTableRepairedMessage(teamId: string): void {
		const team = this.teamService.GetTeamById(teamId);
		if (!team) return;
		Game.BroadcastMessage(
			`${ChatColor.Color(team.color, team.name)} team's ${ChatColor.Aqua("Enchant Table")} was repaired.`,
		);
	}

	/**
	 * Validates incoming purchase request and grants status effect if applicable.
	 *
	 * @param requestor The client id of the user requesting the enchant purchase.
	 * @param tableNob The network object id of the table being used.
	 * @returns Whether or not purchase was successful.
	 */
	private HandleEnchantPurchaseRequest(requestor: number, tableNob: number): boolean {
		const tableData = this.enchantTableMap.get(tableNob);
		if (!tableData) return false;
		if (!tableData.unlocked) return false;
		const requestorEntity = this.entityService.GetEntityByClientId(requestor);
		if (!requestorEntity) return false;
		if (!(requestorEntity instanceof CharacterEntity)) return false;
		const distanceToTable = tableData.gameObject.transform.position.sub(requestorEntity.GetPosition()).magnitude;
		if (distanceToTable > 20) return false;
		const canAfford = requestorEntity
			.GetInventory()
			.HasEnough(EnchantTableMeta.purchaseCurrency, EnchantTableMeta.purchaseCost);
		if (!canAfford) return false;
		requestorEntity.GetInventory().Decrement(EnchantTableMeta.purchaseCurrency, EnchantTableMeta.purchaseCost);
		this.statusEffectService.RemoveAllStatusEffectsFromClient(requestor);
		const enchant = RandomUtil.FromArray(EnchantTableMeta.enchantPool);
		this.statusEffectService.AddStatusEffectToClient(requestor, enchant.type, enchant.tier);
		return true;
	}
}
