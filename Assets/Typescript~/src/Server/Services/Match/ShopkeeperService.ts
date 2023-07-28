import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { Network } from "Shared/Network";
import { MathUtil } from "Shared/Util/MathUtil";
import { DenyRegionService } from "../Global/Block/DenyRegionService";
import { EntityService } from "../Global/Entity/EntityService";
import { TeamService } from "../Global/Team/TeamService";
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

		ServerSignals.MapLoad.connect(() => {
			this.CreateShopKeepers();
		});
	}

	OnStart(): void {
		ServerSignals.PlayerJoin.Connect((event) => {
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
				EntityPrefabType.HUMAN,
				itemShopWorldPos.Position,
			);
			itemShopEntity.entityDriver.SetLookVector(itemShopWorldPos.Rotation.eulerAngles);
			itemShopEntity.SetDisplayName("Item Shop");
			itemShopEntity.GrantImmunity(math.huge);
			this.itemShopEntityIds.push(itemShopEntity.id);

			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(itemShopWorldPos.Position), DENY_REGION_SIZE);

			// Team Upgrades
			const teamUpgradeWorldPos = loadedMap.GetWorldPosition(team.id + "_upgrade_shop");
			const upgradeShopEntity = this.entityService.SpawnEntityForPlayer(
				undefined,
				EntityPrefabType.HUMAN,
				teamUpgradeWorldPos.Position,
			);
			upgradeShopEntity.entityDriver.SetLookVector(teamUpgradeWorldPos.Rotation.eulerAngles);
			upgradeShopEntity.SetDisplayName("Team Upgrades");
			upgradeShopEntity.GrantImmunity(math.huge);
			this.upgradeShopEntityIds.push(upgradeShopEntity.id);

			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(teamUpgradeWorldPos.Position), DENY_REGION_SIZE);
		}

		Network.ServerToClient.ItemShop.AddNPCs.Server.FireAllClients(this.itemShopEntityIds);
		Network.ServerToClient.TeamUpgradeShop.AddNPCs.Server.FireAllClients(this.upgradeShopEntityIds);
	}
}
