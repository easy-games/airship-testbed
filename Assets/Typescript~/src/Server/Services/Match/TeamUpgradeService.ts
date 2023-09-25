import { OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { EntityService } from "Imports/Core/Server/Services/Entity/EntityService";
import { GeneratorService } from "Imports/Core/Server/Services/Generator/GeneratorService";
import { PlayerService } from "Imports/Core/Server/Services/Player/PlayerService";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { CharacterEntity } from "Imports/Core/Shared/Entity/Character/CharacterEntity";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { Player } from "Imports/Core/Shared/Player/Player";
import { Team } from "Imports/Core/Shared/Team/Team";
import { ColorUtil } from "Imports/Core/Shared/Util/ColorUtil";
import { SetUtil } from "Imports/Core/Shared/Util/SetUtil";
import { SignalPriority } from "Imports/Core/Shared/Util/Signal";
import { Task } from "Imports/Core/Shared/Util/Task";
import { Theme } from "Imports/Core/Shared/Util/Theme";
import { ServerSignals } from "Server/ServerSignals";
import { Network } from "Shared/Network";
import { TeamUpgradeStateDto } from "Shared/TeamUpgrade/TeamUpgradeMeta";
import { TeamUpgradeType } from "Shared/TeamUpgrade/TeamUpgradeType";
import { TeamUpgradeUtil } from "Shared/TeamUpgrade/TeamUpgradeUtil";
import { GeneratorSpawnService } from "./GeneratorSpawnService";

/** Snapshot send delay after user connects. */
const SNAPSHOT_SEND_DELAY = 2;

@Service({})
export class TeamUpgradeService implements OnStart {
	/** Mapping of team to team upgrade states. */
	private teamUpgradeMap = new Map<Team, Map<TeamUpgradeType, TeamUpgradeStateDto>>();

	constructor(
		private readonly teamService: TeamService,
		private readonly entityService: EntityService,
		private readonly playerService: PlayerService,
		private readonly generatorService: GeneratorService,
		private readonly generatorSpawnService: GeneratorSpawnService,
	) {}

	OnStart(): void {
		/* Apply persistent upgrade effects. */
		this.ApplyPersistentUpgradeEffects();
		/* Apply generator upgrade effects. */
		this.ApplyGeneratorUpgradeEffects();
		/* Initialize on match start. */
		ServerSignals.MatchStart.Connect(() => {
			this.InitializeTeamUpgrades();
		});
		/* Handle incoming upgrade requests. */
		Network.ClientToServer.TeamUpgrade.UpgradeRequest.Server.SetCallback((clientId, upgradeType, tier) => {
			const player = this.playerService.GetPlayerFromClientId(clientId);
			if (!player) return false;

			return this.HandleUpgradePurchaseRequest(player, upgradeType, tier);
		});
		/* Handle late joiners. */
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Task.Delay(SNAPSHOT_SEND_DELAY, () => {
				const team = event.player.GetTeam();
				if (!team) return;
				const teamUpgradeMap = this.teamUpgradeMap.get(team);
				if (!teamUpgradeMap) return;
				const dtos = Object.values(teamUpgradeMap);
				Network.ServerToClient.TeamUpgrade.UpgradeSnapshot.Server.FireClient(event.player.clientId, dtos);
			});
		});
		print("TeamUpgradeService.2");
	}

	/** Apply active team upgrade effects. */
	private ApplyPersistentUpgradeEffects(): void {
		/* Damage. */
		CoreServerSignals.EntityDamage.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			const fromTeam = event.fromEntity?.player?.GetTeam();
			if (!fromTeam) return;
			const upgradeMapForTeam = this.teamUpgradeMap.get(fromTeam);
			if (!upgradeMapForTeam) return;
			const damageUpgradeState = upgradeMapForTeam.get(TeamUpgradeType.DAMAGE);
			if (!damageUpgradeState) return;
			const damageUpgradeTier = damageUpgradeState.currentUpgradeTier;
			if (damageUpgradeTier > 0) {
				const damageMultiplier = TeamUpgradeUtil.GetUpgradeTierForType(
					TeamUpgradeType.DAMAGE,
					damageUpgradeTier,
				).value;
				/* Apply multiplier. */
				event.amount *= 1 + damageMultiplier / 100;
			}
		});
		/* Armor protection. */
		CoreServerSignals.EntityDamage.ConnectWithPriority(SignalPriority.HIGH, (event) => {
			const entityTeam = event.entity.player?.GetTeam();
			if (!entityTeam) return;
			const upgradeMapForTeam = this.teamUpgradeMap.get(entityTeam);
			if (!upgradeMapForTeam) return;
			const armorProtectionUpgradeState = upgradeMapForTeam.get(TeamUpgradeType.ARMOR_PROTECTION);
			if (!armorProtectionUpgradeState) return;
			const armorProtectionUpgradeTier = armorProtectionUpgradeState.currentUpgradeTier;
			if (armorProtectionUpgradeTier > 0) {
				const damageReduction = TeamUpgradeUtil.GetUpgradeTierForType(
					TeamUpgradeType.ARMOR_PROTECTION,
					armorProtectionUpgradeTier,
				).value;
				/* Apply multiplier. */
				event.amount *= damageReduction / 100;
			}
		});
		/* READ: Break speed handling lives in `BlockHitDamageCalc.ts`.*/
	}

	/** Apply generator upgrade effects. */
	private ApplyGeneratorUpgradeEffects(): void {
		ServerSignals.TeamUpgradePurchase.Connect((event) => {
			/* Handle team generator upgrades. */
			if (event.upgradeType === TeamUpgradeType.TEAM_GENERATOR) {
				const ironGenerators = this.generatorSpawnService.GetTeamGeneratorByType(event.team, ItemType.IRON);
				const tierMeta = TeamUpgradeUtil.GetUpgradeTierForType(event.upgradeType, event.tier);
				switch (event.tier) {
					case 1: {
						/* Increase generator speed. */
						ironGenerators?.forEach((generator) => {
							const newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100);
							this.generatorService.UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed);
						});
						break;
					}
					case 2: {
						/* Increase generator speed. */
						ironGenerators?.forEach((generator) => {
							const newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100);
							this.generatorService.UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed);
						});
						break;
					}
					case 3: {
						/* Spawn emeralds. */
						if (ironGenerators && ironGenerators.size() > 0) {
							const emeraldGeneratorSpawnPos = ironGenerators[0].dto.pos;
							const generatorId = this.generatorService.CreateGenerator(emeraldGeneratorSpawnPos, {
								item: ItemType.EMERALD,
								spawnRate: 45,
								stackLimit: 3,
								label: false,
							});
							this.generatorSpawnService.RegisterNewGeneratorForTeam(event.team, generatorId);
							break;
						}
					}
				}
			}
			/* Handle diamond generator upgrades. */
			if (event.upgradeType === TeamUpgradeType.DIAMOND_GENERATOR) {
				const ironGenerators = this.generatorSpawnService.GetTeamGeneratorByType(event.team, ItemType.IRON);
				const tierMeta = TeamUpgradeUtil.GetUpgradeTierForType(event.upgradeType, event.tier);
				switch (event.tier) {
					case 1: {
						/* Spawn diamonds. */
						if (ironGenerators && ironGenerators.size() > 0) {
							const diamondGeneratorSpawnPos = ironGenerators[0].dto.pos;
							const generatorId = this.generatorService.CreateGenerator(diamondGeneratorSpawnPos, {
								item: ItemType.DIAMOND,
								spawnRate: 25,
								stackLimit: 6,
								label: false,
							});
							this.generatorSpawnService.RegisterNewGeneratorForTeam(event.team, generatorId);
						}
						break;
					}
					case 2: {
						/* Increase diamond generator speed. */
						const diamondGenerators = this.generatorSpawnService.GetTeamGeneratorByType(
							event.team,
							ItemType.DIAMOND,
						);
						diamondGenerators?.forEach((generator) => {
							const newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100);
							this.generatorService.UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed);
						});
						break;
					}
					case 3: {
						/* Increase diamond generator speed. */
						const diamondGenerators = this.generatorSpawnService.GetTeamGeneratorByType(
							event.team,
							ItemType.DIAMOND,
						);
						diamondGenerators?.forEach((generator) => {
							const newSpeed = generator.originalSpawnRate / (1 + tierMeta.value / 100);
							this.generatorService.UpdateGeneratorSpawnRateById(generator.dto.id, newSpeed);
						});
						break;
					}
				}
			}
		});
	}

	/** Initializes team upgrades to their default state. */
	private InitializeTeamUpgrades(): void {
		const teams = this.teamService.GetTeams();
		teams.forEach((team) => {
			const defaultTeamUpgradeStates = new Map<TeamUpgradeType, TeamUpgradeStateDto>();
			Object.values(TeamUpgradeType).forEach((upgradeType) => {
				const teamUpgradeMeta = TeamUpgradeUtil.GetTeamUpgradeMeta(upgradeType);
				const dto: TeamUpgradeStateDto = {
					teamUpgrade: teamUpgradeMeta,
					teamId: team.id,
					currentUpgradeTier: 0,
				};
				defaultTeamUpgradeStates.set(upgradeType, dto);
			});
			this.teamUpgradeMap.set(team, defaultTeamUpgradeStates);
		});
	}

	/**
	 * Fetch team upgrade state for a particular team and upgrade type.
	 * @param team A team.
	 * @param upgradeType A team upgrade type.
	 * @returns Teams current upgrade state for upgrade type.
	 */
	public GetUpgradeStateForTeam(team: Team, upgradeType: TeamUpgradeType): TeamUpgradeStateDto | undefined {
		return this.teamUpgradeMap.get(team)?.get(upgradeType);
	}

	/**
	 * Fetch team upgrade state for a particular player and upgrade type.
	 * @param player A player.
	 * @param upgradeType A team upgrade type.
	 * @returns Players current upgrade state for upgrade type.
	 */
	public GetUpgradeStateForPlayer(player: Player, upgradeType: TeamUpgradeType): TeamUpgradeStateDto | undefined {
		const playerTeam = player.GetTeam();
		if (!playerTeam) return undefined;
		return this.GetUpgradeStateForTeam(playerTeam, upgradeType);
	}

	/** Process incoming upgrade purchase request. */
	private HandleUpgradePurchaseRequest(player: Player, upgradeType: TeamUpgradeType, tier: number): boolean {
		const playerEntity = this.entityService.GetEntityByClientId(player.clientId);
		/* Validate entity. */
		if (!playerEntity || !(playerEntity instanceof CharacterEntity)) return false;
		const playerInv = playerEntity.GetInventory();
		const purchaseForTeam = player.GetTeam();
		/* Validate team. */
		if (!purchaseForTeam) return false;
		const upgradeState = this.teamUpgradeMap.get(purchaseForTeam)?.get(upgradeType);
		/* Validate update state. */
		if (!upgradeState) return false;
		const currentTier = upgradeState.currentUpgradeTier;
		/* Validate that upgrade is not maxed out. */
		const maxUpgrades = TeamUpgradeUtil.GetUpgradeTierCountForType(upgradeType);
		if (currentTier === maxUpgrades) return false;
		/* Validate that tier request is next tier. */
		if (tier !== currentTier + 1) return false;
		const nextTier = currentTier + 1;
		const nextTierMeta = TeamUpgradeUtil.GetUpgradeTierForType(upgradeType, nextTier);
		const canAfford = playerInv.HasEnough(nextTierMeta.currency, nextTierMeta.cost);
		/* Validate that player can afford upgrade. */
		if (!canAfford) return false;
		/* Accept upgrade request. */
		playerInv.Decrement(nextTierMeta.currency, nextTierMeta.cost);
		upgradeState.currentUpgradeTier = math.clamp(upgradeState.currentUpgradeTier + 1, 1, maxUpgrades);
		ServerSignals.TeamUpgradePurchase.Fire({
			team: purchaseForTeam,
			upgradeType: upgradeType,
			tier: upgradeState.currentUpgradeTier,
		});
		const clientIds = SetUtil.ToArray(purchaseForTeam.GetPlayers()).mapFiltered((player) => player.clientId);
		clientIds.forEach((clientId) => {
			Network.ServerToClient.TeamUpgrade.UpgradeProcessed.Server.FireClient(
				clientId,
				player.clientId,
				upgradeType,
				upgradeState.currentUpgradeTier,
			);
		});
		const meta = TeamUpgradeUtil.GetTeamUpgradeMeta(upgradeType);
		purchaseForTeam.SendMessage(
			ColorUtil.ColoredText(Theme.Aqua, "<b>" + player.username + "</b>") +
				ColorUtil.ColoredText(Theme.Yellow, " unlocked ") +
				ColorUtil.ColoredText(Theme.Aqua, meta.displayName) +
				ColorUtil.ColoredText(Theme.Yellow, " for the team."),
		);
		return true;
	}
}
