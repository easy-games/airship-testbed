import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { NetworkBridge } from "Shared/NetworkBridge";
import { CollectionTag } from "Shared/Util/CollectionTag";
import { MathUtil } from "Shared/Util/MathUtil";
import { DenyRegionService } from "../Global/Block/DenyRegionService";
import { TeamService } from "../Global/Team/TeamService";
import { MapService } from "./Map/MapService";

/** Generator deny region size. */
const DENY_REGION_SIZE = new Vector3(2, 3, 2);

@Service({})
export class ShopkeeperService implements OnStart {
	/** Shopkeeper prefab. */
	private shopKeeperPrefab: Object;

	constructor(
		private readonly mapService: MapService,
		private readonly denyRegionService: DenyRegionService,
		private readonly teamService: TeamService,
	) {
		this.shopKeeperPrefab = AssetBridge.LoadAsset("Shared/Resources/Entity/HumanEntity/HumanEntity.prefab");

		ServerSignals.MapLoad.connect(() => {
			this.CreateShopKeepers();
		});
	}

	OnStart(): void {}

	/** Creates shop shopkeepers and team upgrade shopkeepers. */
	private CreateShopKeepers(): void {
		const loadedMap = this.mapService.GetLoadedMap();
		if (!loadedMap) {
			Debug.LogError("Loaded map was not ready when spawning shopkeepers.");
			return;
		}

		for (let team of this.teamService.GetTeams()) {
			const itemShopPosition = loadedMap.GetWorldPosition(team.id + "_item_shop");
            const itemShopKeeper = GameObjectBridge.InstantiateAt(this.shopKeeperPrefab, itemShopPosition.Position, itemShopPosition.Rotation);
            NetworkBridge.Spawn(itemShopKeeper, CollectionTag.ITEM_SHOP_SHOPKEEPER);
            /* Create deny region around shopkeeper. */
            this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(itemShopPosition.Position), DENY_REGION_SIZE);

			const teamUpgradePosition = loadedMap.GetWorldPosition(team.id + "_upgrade_shop");
            const upgradeShopKeeper = GameObjectBridge.InstantiateAt(this.shopKeeperPrefab, teamUpgradePosition.Position, teamUpgradePosition.Rotation);
            NetworkBridge.Spawn(upgradeShopKeeper, CollectionTag.TEAM_UPGRADES_SHOPKEEPER);
            /* Create deny region around shopkeeper. */
            this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(teamUpgradePosition.Position), DENY_REGION_SIZE);
		}
	}
}
