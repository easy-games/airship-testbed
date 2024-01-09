import { CharacterCameraMode } from "@Easy/Core/Client/Controllers/Character/CharacterCameraMode";
import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { PlayerController } from "@Easy/Core/Client/Controllers/Player/PlayerController";
import { TeamController } from "@Easy/Core/Client/Controllers/Team/TeamController";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { SetUtil } from "@Easy/Core/Shared/Util/SetUtil";
import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Network } from "Shared/Network";

@Controller({})
export class BWController implements OnStart {
	/** Set of eliminated players. */
	private eliminatedPlayers = new Set<Player>();

	constructor(private readonly teamController: TeamController, private readonly playerController: PlayerController) {}

	OnStart(): void {
		Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.LOCKED);
		Dependency<LocalEntityController>().SetDefaultFirstPerson(true);

		// Listen for player eliminated.
		Network.ServerToClient.PlayerEliminated.client.OnServerEvent((clientId: number) => {
			const player = this.playerController.GetPlayerFromClientId(clientId);
			if (!player) return;
			this.eliminatedPlayers.add(player);
			ClientSignals.PlayerEliminated.Fire({ player });
		});
		// Listen for match end.
		Network.ServerToClient.MatchEnded.client.OnServerEvent((winningTeamId?: string) => {
			if (winningTeamId) this.ShowWinscreen(winningTeamId);
		});

		// Listen for team assignements.
		CoreClientSignals.PlayerChangeTeam.Connect((teamSignal) => {
			if (!teamSignal.player.character || teamSignal.player.character?.IsLocalCharacter()) {
				return;
			}
			const team = teamSignal.player.character?.GetTeam();
			if (team) {
				this.SetTeamColor(teamSignal.player.character, team);
			}
		});

		CoreClientSignals.EntitySpawn.Connect((spawnSignal) => {
			Profiler.BeginSample("SetTeamColor");
			const team = spawnSignal.entity.GetTeam();
			if (team) {
				this.SetTeamColor(spawnSignal.entity, team);
			}
			Profiler.EndSample();
		});
	}

	private SetTeamColor(entity: Entity, team: Team) {
		if (entity.IsLocalCharacter() || !entity.player) {
			return;
		}
		// Show a glow to indicate friend or foe.
		const sameTeam = team?.id === Game.localPlayer.character?.GetTeam()?.id;
		const targetColor = sameTeam ? Color.cyan : Color.red;
		const strength = sameTeam ? 0 : 1;
		entity.animator.SetFresnelColor(targetColor, 5, strength);
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
		return this.playerController.GetPlayers().filter((player) => {
			return player.GetTeam()?.id === team.id && !this.eliminatedPlayers.has(player);
		});
	}

	/** Show winscreen for `winningTeamId`. */
	private ShowWinscreen(winningTeamId: string): void {
		const winningTeam = this.teamController.GetTeam(winningTeamId);
		if (winningTeam) {
			// const winScreenRoot = this.GetWinscreenRoot();
			// this.winScreenDocument.enabled = true;
			// const teamColor = winScreenRoot.Q<VisualElement>("TeamColor");
			// UICore.SetBackgroundColor(teamColor, winningTeam.color);
			// const winText = winScreenRoot.Q<Label>("WinText");
			// winText.text = `${winningTeam.name.upper()} WINS!`;
		}
	}
}
