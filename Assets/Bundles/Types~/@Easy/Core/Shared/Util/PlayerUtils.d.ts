import { Player } from "../Player/Player";
export declare class PlayerUtils {
    /**
     * Looks for the given player in a player set using a case insensitive fuzzy search
     *
     * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
     * @param searchName The name of the plaeyr
     */
    static FuzzyFindPlayerByName(players: readonly Player[], searchName: string): Player | undefined;
    /**
     * Looks for players in a player set using a case insensitive fuzzy search
     * @param searchName The name of the player
     */
    static FuzzyFindPlayersWithName(players: readonly Player[], searchName: string): Player[];
}
