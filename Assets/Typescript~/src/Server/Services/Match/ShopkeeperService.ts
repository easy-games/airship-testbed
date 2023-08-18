import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { DenyRegionService } from "Imports/Core/Server/Services/Block/DenyRegionService";
import { EntityService } from "Imports/Core/Server/Services/Entity/EntityService";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { EntityPrefabType } from "Imports/Core/Shared/Entity/EntityPrefabType";
import { MathUtil } from "Imports/Core/Shared/Util/MathUtil";
import { ServerSignals } from "Server/ServerSignals";
import { Network } from "Shared/Network";
import { MapService } from "./Map/MapService";

/** Generator deny region size. */
const DENY_REGION_SIZE = new Vector3(2, 3, 2);

@Service({})
export class ShopkeeperService implements OnStart {
	/** Shopkeeper prefab. */
	private shopKeeperPrefab: Object;
	private itemShopEntityIds: number[] = [];
	private upgradeShopEntityIds: number[] = [];

	constructor(
		private readonly mapService: MapService,
		private readonly denyRegionService: DenyRegionService,
		private readonly teamService: TeamService,
		private readonly entityService: EntityService,
	) {
		this.shopKeeperPrefab = AssetBridge.LoadAsset("Shared/Resources/Entity/HumanEntity/HumanEntity.prefab");

		ServerSignals.MapLoad.Connect(() => {
			this.CreateShopKeepers();
		});
	}

	OnStart(): void {
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Network.ServerToClient.ItemShop.AddNPCs.Server.FireClient(event.player.clientId, this.itemShopEntityIds);
			Network.ServerToClient.TeamUpgradeShop.AddNPCs.Server.FireClient(
				event.player.clientId,
				this.upgradeShopEntityIds,
			);
		});
	}

	/** Creates shop shopkeepers and team upgrade shopkeepers. */
	private CreateShopKeepers(): void {
		const loadedMap = this.mapService.GetLoadedMap();
		if (!loadedMap) {
			Debug.LogError("Loaded map was not ready when spawning shopkeepers.");
			return;
		}

		this.itemShopEntityIds.clear();
		this.upgradeShopEntityIds.clear();
		for (let team of this.teamService.GetTeams()) {
			// Item Shop
			const itemShopWorldPos = loadedMap.GetWorldPosition(team.id + "_item_shop");
			const itemShopEntity = this.entityService.SpawnEntityForPlayer(
				undefined,
				EntityPrefabType.NPC_IDLE,
				itemShopWorldPos.Position,
			);
			itemShopEntity.entityDriver.SetLookVector(
				itemShopWorldPos.Rotation.mul(itemShopEntity.entityDriver.transform.forward),
			);
			itemShopEntity.SetDisplayName("Item Shop");
			itemShopEntity.GrantImmunity(math.huge);
			this.itemShopEntityIds.push(itemShopEntity.id);

			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(itemShopWorldPos.Position), DENY_REGION_SIZE);

			// Team Upgrades
			const teamUpgradeWorldPos = loadedMap.GetWorldPosition(team.id + "_upgrade_shop");
			const upgradeShopEntity = this.entityService.SpawnEntityForPlayer(
				undefined,
				EntityPrefabType.NPC_IDLE,
				teamUpgradeWorldPos.Position,
			);
			upgradeShopEntity.entityDriver.SetLookVector(
				teamUpgradeWorldPos.Rotation.mul(upgradeShopEntity.entityDriver.transform.forward),
			);
			upgradeShopEntity.SetDisplayName("Team Upgrades");
			upgradeShopEntity.GrantImmunity(math.huge);
			this.upgradeShopEntityIds.push(upgradeShopEntity.id);

			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(teamUpgradeWorldPos.Position), DENY_REGION_SIZE);
		}

		Network.ServerToClient.ItemShop.AddNPCs.Server.FireAllClients(this.itemShopEntityIds);
		Network.ServerToClient.TeamUpgradeShop.AddNPCs.Server.FireAllClients(this.upgradeShopEntityIds);
	}
}
