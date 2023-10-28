import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { ShopElement } from "./ItemShop/ItemShopMeta";
import { MatchState } from "./Match/MatchState";
import { MapLoadEvent } from "./Signals/MapLoadEvent";
import { MatchStartServerEvent } from "./Signals/MatchStartServerEvent";
import { TeamUpgradeType } from "./TeamUpgrade/TeamUpgradeType";

export type BlockHitSignal = { blockId: number; blockPos: Vector3; readonly player: Player };

export const ServerSignals = {
	...CoreServerSignals,
	/** Fired when match enters `MatchState.RUNNING`. */
	MatchStart: new Signal<MatchStartServerEvent>(),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	/** Fired when match enters `MatchState.POST`. */
	MatchEnded: new Signal<{ winningTeam?: Team }>(),
	MapLoad: new Signal<MapLoadEvent>(),
	/** Fired when a player successfully purchases a shop item. */
	ShopPurchase: new Signal<{ player: Player; shopItem: ShopElement }>(),
	/** Fired when a team upgrade is successfully purchased. */
	TeamUpgradePurchase: new Signal<{ team: Team; upgradeType: TeamUpgradeType; tier: number }>(),
	/** Fired when a player is eliminated. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	/** Fired when a bed is destroyed. */
	BedDestroyed: new Signal<{ team: Team }>(),
};
