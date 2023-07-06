import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { Team } from "Shared/Team/Team";
import { SetUtil } from "Shared/Util/SetUtil";
import { PlayerController } from "../Global/Player/PlayerController";
import { TeamController } from "../Global/Team/TeamController";

@Controller({})
export class BWController implements OnStart {
	/** Set of eliminated players. */
	private eliminatedPlayers = new Set<Player>();

	constructor(private readonly teamController: TeamController, private readonly playerController: PlayerController) {}

	OnStart(): void {
		/* Listen for player eliminated. */
		Network.ServerToClient.PlayerEliminated.Client.OnServerEvent((clientId) => {
			const player = this.playerController.GetPlayerFromClientId(clientId);
			if (!player) return;
			this.eliminatedPlayers.add(player);
			ClientSignals.PlayerEliminated.Fire({ player });
		});
		/* Listen for match end. */
		Network.ServerToClient.MatchEnded.Client.OnServerEvent((winningTeamId) => {
			if (winningTeamId) this.ShowWinscreen(winningTeamId);
		});
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
			// /* Show. */
			// this.winScreenDocument.enabled = true;
			// /* Update team color and win text. */
			// const teamColor = winScreenRoot.Q<VisualElement>("TeamColor");
			// UICore.SetBackgroundColor(teamColor, winningTeam.color);
			// const winText = winScreenRoot.Q<Label>("WinText");
			// winText.text = `${winningTeam.name.upper()} WINS!`;
		}
	}
}
