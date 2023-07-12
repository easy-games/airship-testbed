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
			const itemShopPositions = loadedMap.GetWorldPositions(team.id + "_item_shop");
			for (let pos of itemShopPositions) {
				const keeper = GameObjectBridge.InstantiateAt(this.shopKeeperPrefab, pos.Position, pos.Rotation);
				NetworkBridge.Spawn(keeper, CollectionTag.ITEM_SHOP_SHOPKEEPER);
				/* Create deny region around shopkeeper. */
				this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(pos.Position), DENY_REGION_SIZE);
			}

			const teamUpgradePositions = loadedMap.GetWorldPositions(team.id + "_upgrade_shop");
			for (let pos of teamUpgradePositions) {
				const keeper = GameObjectBridge.InstantiateAt(this.shopKeeperPrefab, pos.Position, pos.Rotation);
				NetworkBridge.Spawn(keeper, CollectionTag.TEAM_UPGRADES_SHOPKEEPER);
				/* Create deny region around shopkeeper. */
				this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(pos.Position), DENY_REGION_SIZE);
			}
		}
	}
}
