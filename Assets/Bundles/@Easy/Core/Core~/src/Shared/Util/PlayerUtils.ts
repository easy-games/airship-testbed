import inspect from "@easy-games/unity-inspect";
import { Player } from "Shared/Player/Player";
import { Levenshtein } from "Shared/Types/Levenshtein";
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
	public static FuzzyFindPlayerByName(players: readonly Player[], searchName: string): Player | undefined {
		searchName = searchName.lower();

		// Shortcut if the discriminator is specified _exactly_.
		if (searchName.match("#(%d%d%d%d)$")[0] !== undefined) {
			// lua patterns are great...
			return players.find((f) => searchName === `${f.username.lower()}#${f.usernameTag}`);
		}

		const matches = this.FuzzyFindPlayersWithName(players, searchName);

		return matches.size() > 0 ? matches[0] : undefined;
	}

	/**
	 * Looks for players in a player set using a case insensitive fuzzy search
	 * @param searchName The name of the plaeyr
	 */
	public static FuzzyFindPlayersWithName(players: readonly Player[], searchName: string): Player[] {
		const matchingPlayers = new Array<Player>();
		for (const player of players) {
			const fullUsername = `${player.username.lower()}#${player.usernameTag}`;
			if (fullUsername.find(searchName.lower(), 1, true)[0] !== undefined) {
				matchingPlayers.push(player);
			}
		}

		// With each match, we'll sort by levenschtein distance to order by best match (lower distance = higher match chance)
		// e.g. if we search `lu` and there's a user called `lu` - we'd prioritize that over `luke` even if luke was in the server first.
		matchingPlayers.sort(
			(firstPlayer, secondPlayer) =>
				Levenshtein(`${firstPlayer.username.lower()}#${firstPlayer.usernameTag}`, searchName) <
				Levenshtein(`${secondPlayer.username.lower()}#${secondPlayer.usernameTag}`, searchName),
		);

		return matchingPlayers;
	}
}
