import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { BlockInteractService } from "@Easy/Core/Server/Services/Block/BlockInteractService";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { BlockDataAPI } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { BedState } from "Shared/Bed/BedMeta";
import { MapService } from "../Map/MapService";
import { MatchService } from "../MatchService";

@Service({})
export class BWBedService implements OnStart {
	/** Team id to bed map. */
	private teamToBed = new Map<string, BedState>();

	constructor(
		private readonly mapService: MapService,
		private readonly matchService: MatchService,
		private readonly teamService: TeamService,
	) {}

	OnStart(): void {
		// Listen for bed destroyed.
		CoreServerSignals.BeforeBlockDestroyed.Connect((event) => {
			if (event.block.blockId === ItemType.BED) {
				this.TryDestroyBed(event.blockPos, event.entity);
				print("damage block aoe.");
				Dependency<BlockInteractService>().DamageBlockAOE(undefined, event.blockPos, {
					innerDamage: 0,
					outerDamage: 0,
					damageRadius: 5,
					blockExplosiveDamage: 100,
					selfKnockbackMultiplier: 1,
				});
			}
		});

		CoreServerSignals.BlockDropped.Connect((event) => {
			if (event.itemStack.GetItemType() === ItemType.BED) {
				event.SetCancelled(true); // prevent beds dropping
			}
		});

		ServerSignals.MatchStart.Connect(() => {
			this.SpawnBeds();
		});
	}

	private TryDestroyBed(blockPos: Vector3, entity?: Entity): boolean {
		const teamId = BlockDataAPI.GetBlockData<string>(blockPos, "teamId");
		if (!teamId) return false;
		const team = this.teamService.GetTeamById(teamId);
		if (team) {
			const breakerTeam = entity?.player?.GetTeam();
			if (entity && breakerTeam) {
				Game.BroadcastMessage(
					ColorUtil.ColoredText(breakerTeam.color, entity.GetDisplayName()) +
						ColorUtil.ColoredText(Theme.aqua, " destroyed ") +
						ColorUtil.ColoredText(team.color, `${team.name} team's bed`) +
						ColorUtil.ColoredText(Theme.aqua, "!"),
				);
			} else {
				Game.BroadcastMessage(
					ColorUtil.ColoredText(team.color, `${team.name}'s bed`) +
						ColorUtil.ColoredText(Theme.aqua, " has been destroyed!"),
				);
			}
			const bedState = this.GetBedStateForTeam(team);
			if (bedState) {
				bedState.destroyed = true;
			}
			ServerSignals.BedDestroyed.Fire({ team });
			return true;
		}
		return false;
	}

	/** Spawn beds for each team. */
	private SpawnBeds(): void {
		const loadedMap = this.mapService.GetLoadedMap();
		if (!loadedMap) return;

		// Spawn beds.
		for (let team of this.teamService.GetTeams()) {
			const bedPosition = loadedMap.GetWorldPosition(team.id + "_bed");
			const bedPos = MathUtil.FloorVec(
				new Vector3(bedPosition.position.x, bedPosition.position.y, bedPosition.position.z),
			);
			const bedState: BedState = {
				teamId: team.id,
				position: bedPos,
				// _Always_ starts as not destroyed.
				destroyed: false,
			};
			this.teamToBed.set(team.id, bedState);
			const itemMeta = ItemUtil.GetItemDef(ItemType.BED);
			WorldAPI.GetMainWorld()!.PlaceBlockByItemType(bedPos, ItemType.BED, {
				blockData: {
					teamId: team.id,
					health: itemMeta.block!.health!, // this is a hack.
				},
			});
		}
	}

	/**
	 * Checks whether or not a team's bed is destroyed.
	 * @param teamId A team id.
	 * @returns Whether or not a specific team's bed is destroyed.
	 */
	public IsBedDestroyed(team: Team): boolean {
		const bedState = this.GetBedStateForTeam(team);
		if (!bedState) return true;
		return bedState.destroyed;
	}

	/**
	 * Fetch bed state with a team id.
	 * @param teamId A team id.
	 * @returns Bed state.
	 */
	public GetBedStateForTeam(team: Team): BedState | undefined {
		return this.teamToBed.get(team.id);
	}
}
