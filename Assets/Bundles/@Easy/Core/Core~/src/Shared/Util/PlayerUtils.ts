import { Player } from "Shared/Player/Player";
import StringUtils from "Shared/Types/StringUtil";

export class PlayerUtils {
	/**
	 * Looks for the given player in a player set using a case insensitive fuzzy search
	 *
	 * e.g. `luke`, `lu` would match `Luke#0001`, `Luke#0002` etc.
	 *
	 * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
	 * @param searchName The name of the plaeyr
	 */
	public static FuzzyFindPlayerByName(players: Player[], searchName: string): Player | undefined {
		for (const player of players) {
			const fullUsername = `${player.username}#${player.usernameTag}`;
			if (fullUsername.lower().find(searchName.lower(), 1, true)) {
				return player;
			}
		}
	}

	/**
	 * Looks for players in a player set using a case insensitive fuzzy search
	 * @param searchName The name of the plaeyr
	 */
	public static FuzzyFindPlayersWithName(players: Player[], searchName: string): Player[] {
		const matchingPlayers = new Array<Player>();
		for (const player of players) {
			const fullUsername = `${player.username}#${player.usernameTag}`;
			if (fullUsername.lower().find(searchName.lower(), 1, true)) {
				matchingPlayers.push(player);
			}
		}
		return matchingPlayers;
	}
}
