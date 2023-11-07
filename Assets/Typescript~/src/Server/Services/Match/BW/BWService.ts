import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { SetUtil } from "@Easy/Core/Shared/Util/SetUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Network } from "Shared/Network";
import { BedService } from "../BedService";
import { MatchService } from "../MatchService";

@Service({})
export class BWService implements OnStart {
	constructor(
		private readonly bedService: BedService,
		private readonly teamService: TeamService,
		private readonly matchService: MatchService,
		private readonly playerService: PlayerService,
	) {}

	/** Set of eliminated teams. */
	private eliminatedTeams = new Set<Team>();
	/** Set of eliminated players. */
	private eliminatedPlayers = new Set<Player>();
	/** Whether or not winner has been declared. */
	public winnerDeclared = false;
	/** Whether or not a bed has been destroyed. */
	private bedHasBeenDestroyed = false;

	OnStart(): void {
		// Listen for bed destroy for BW win condition.
		ServerSignals.BedDestroyed.Connect(() => {
			this.bedHasBeenDestroyed = true;
			this.CheckForWin();
		});
		// Listen for entity death for BW win condition, give loot.
		CoreServerSignals.EntityDeath.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (!this.matchService.IsRunning()) return;
			// Eliminate player, if applicable.
			if (event.entity instanceof CharacterEntity) {
				const team = event.entity.player?.GetTeam();
				if (event.entity.player && team && this.bedService.IsBedDestroyed(team)) {
					this.EliminatePlayer(event.entity.player);
					event.respawnTime = 0;
				}
			}
			// Give resources to killer.
			if (
				event.entity?.player &&
				event.entity instanceof CharacterEntity &&
				event.killer?.player &&
				event.killer instanceof CharacterEntity
			) {
				const deathEntityInv = event.entity.GetInventory();
				const killerEntityInv = event.killer.GetInventory();
				for (let i = 0; i < deathEntityInv.GetMaxSlots(); i++) {
					const invSlot = deathEntityInv.GetItem(i);
					if (!invSlot) continue;
					const itemType = invSlot.GetItemType();
					const itemQuantity = invSlot.GetAmount();
					if (ItemUtil.IsResource(itemType)) {
						killerEntityInv.AddItem(new ItemStack(itemType, itemQuantity));
					}
				}
			}
			// Kill message in chat
			const killerTeam = event.killer?.GetTeam();
			const deadTeam = event.entity.GetTeam();
			if (event.killer && killerTeam && deadTeam) {
				Game.BroadcastMessage(
					ColorUtil.ColoredText(killerTeam.color, event.killer.GetDisplayName()) +
						ColorUtil.ColoredText(Theme.Gray, " killed ") +
						ColorUtil.ColoredText(deadTeam.color, event.entity.GetDisplayName()),
				);
			}
		});
		// Teammates _cannot_ damage each other.
		CoreServerSignals.EntityDamage.Connect((event) => {
			if (event.canDamageAllies) {
				return;
			}

			if (
				event.fromEntity?.player &&
				event.fromEntity instanceof CharacterEntity &&
				event.entity.player &&
				event.entity instanceof CharacterEntity
			) {
				const fromEntityTeam = event.fromEntity.player.GetTeam();
				const entityTeam = event.entity.player.GetTeam();
				if (fromEntityTeam?.id === entityTeam?.id) {
					event.SetCancelled(true);
				}
			}
		});

		// Testing: place block near player ever second
		// SetInterval(1, () => {
		// 	const players = Dependency<PlayerService>().GetPlayers();
		// 	if (players.size() === 0) return;

		// 	const p = players[0];
		// 	if (p.Character) {
		// 		WorldAPI.GetMainWorld().PlaceBlock(
		// 			p.Character.model.transform.position.add(new Vector3(5, 0, 0)),
		// 			ItemType.STONE,
		// 		);
		// 	}
		// });
	}

	public EliminatePlayer(player: Player): void {
		this.eliminatedPlayers.add(player);
		ServerSignals.PlayerEliminated.Fire({ player: player });
		Network.ServerToClient.PlayerEliminated.Server.FireAllClients(player.clientId);
		// this.CheckForWin();
	}

	/**
	 * Checks if a player is on an eliminated team.
	 * @param player A player.
	 * @returns Whether or not `player` is eliminated.
	 */
	public IsPlayerEliminated(player: Player): boolean {
		return this.eliminatedPlayers.has(player);
	}

	/**
	 * Fetch all eliminated players.
	 * @returns A Set of all eliminated players.
	 */
	public GetEliminatedPlayers(): Player[] {
		return SetUtil.ToArray(this.eliminatedPlayers);
	}

	/**
	 * Fetch all eliminated players on a provided team.
	 * @param team A team.
	 * @returns A Set of all eliminated players on `team`.
	 */
	public GetEliminatedPlayersOnTeam(team: Team): Player[] {
		return SetUtil.ToArray(this.eliminatedPlayers).filter((player) => {
			return player.GetTeam()?.id === team.id;
		});
	}

	/**
	 * Fetch all alive players on a provided team.
	 * @param team A team.
	 * @returns A Set of all alive players on `team`.
	 */
	public GetAlivePlayersOnTeam(team: Team): Player[] {
		return this.playerService.GetPlayers().filter((player) => {
			return player.GetTeam()?.id === team.id && !this.eliminatedPlayers.has(player);
		});
	}

	/**
	 * Checks if a team is eliminated.
	 * @param team A team.
	 * @returns Whether or not `team` is eliminated.
	 */
	public IsTeamEliminated(team: Team): boolean {
		return this.eliminatedTeams.has(team);
	}

	/** Check for win condition. Returns whether or not win condition was met.*/
	private CheckForWin(): boolean {
		const nonEliminatedTeams: Team[] = [];
		const teams = this.teamService.GetTeams();
		/*
		 * A team is considered eliminated if **all** players
		 * are dead AND their bed is destroyed.
		 */
		teams.forEach((team) => {
			const players = SetUtil.ToArray(team.GetPlayers());
			const noPlayersOnTeam = players.size() === 0;
			const allPlayersEliminated = players.every((player) => {
				if (this.eliminatedPlayers.has(player)) return true;
				return false;
			});
			const bedDestroyed = this.bedService.IsBedDestroyed(team);
			const isEliminated = noPlayersOnTeam || (allPlayersEliminated && bedDestroyed);
			if (!isEliminated) {
				nonEliminatedTeams.push(team);
			} else {
				this.eliminatedTeams.add(team);
			}
		});
		/* If only _one_ team is not eliminated, they win. */
		if (nonEliminatedTeams.size() === 1 && this.bedHasBeenDestroyed) {
			this.DeclareWinner(nonEliminatedTeams[0]);
			return true;
		}
		return false;
	}

	/** Declares a team as winner. */
	private DeclareWinner(team: Team) {
		this.winnerDeclared = true;
		this.matchService.EndMatch(team);
	}
}
