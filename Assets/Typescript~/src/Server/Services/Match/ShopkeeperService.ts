import { OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { NetworkBridge } from "Shared/NetworkBridge";
import { CollectionTag } from "Shared/Util/CollectionTag";
import { Task } from "Shared/Util/Task";
import { LoadedMap } from "./Map/LoadedMap";
import { MapService } from "./Map/MapService";
import { DenyRegionService } from "../Global/Block/DenyRegionService";
import { MathUtil } from "Shared/Util/MathUtil";

/** Generator deny region size. */
const DENY_REGION_SIZE = new Vector3(2, 3, 2);

@Service({})
export class ShopkeeperService implements OnStart {
	/** Loaded map data. */
	private loadedMap: LoadedMap | undefined;
	/** Shopkeeper prefab. */
	private shopKeeperPrefab: Object;

	constructor(private readonly mapService: MapService, private readonly denyRegionService: DenyRegionService) {
		this.shopKeeperPrefab = AssetBridge.LoadAsset("Shared/Resources/Entity/HumanEntity/HumanEntity.prefab");
	}

	OnStart(): void {
		Task.Spawn(() => {
			/* Wait map and match started before creating generators. */
			this.loadedMap = this.mapService.WaitForMapLoaded();
			ServerSignals.MatchStart.connect(() => this.CreateShopKeepers());
		});
	}

	/** Creates shop shopkeepers and team upgrade shopkeepers. */
	private CreateShopKeepers(): void {
		/* Shop shopkeepers. */
		const shops = this.loadedMap!.GetAllShopkeepers();
		ObjectUtil.values(shops).forEach((mapPosition) => {
			const keeper = GameObjectBridge.InstantiateAt(
				this.shopKeeperPrefab,
				mapPosition.Position,
				mapPosition.Rotation,
			);
			NetworkBridge.Spawn(keeper, CollectionTag.ITEM_SHOP_SHOPKEEPER);
			/* Create deny region around shopkeeper. */
			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(mapPosition.Position), DENY_REGION_SIZE);
		});
		/* Team upgrade shopkeepers. */
		const upgrades = this.loadedMap!.GetAllTeamUpgrades();
		ObjectUtil.values(upgrades).forEach((mapPosition) => {
			const keeper = GameObjectBridge.InstantiateAt(
				this.shopKeeperPrefab,
				mapPosition.Position,
				mapPosition.Rotation,
			);
			NetworkBridge.Spawn(keeper, CollectionTag.TEAM_UPGRADES_SHOPKEEPER);
			/* Create deny region around shopkeeper. */
			this.denyRegionService.CreateDenyRegion(MathUtil.FloorVec(mapPosition.Position), DENY_REGION_SIZE);
		});
	}
}
