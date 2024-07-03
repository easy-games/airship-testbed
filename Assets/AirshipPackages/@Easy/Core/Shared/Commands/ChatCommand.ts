import { Player } from "@Easy/Core/Shared/Player/Player";

/**
 * A chat command that can be run by clients. Commands are executed
 * on the server.
 */
export abstract class ChatCommand {
	/**
	 * @param commandLabel Default command name. For example: ``teleport``.
	 * @param aliases Optional additional set of command labels that will execute this command. For example: ``tp`` (as an alias for teleport).
	 * @param usage Displayed when looking for command help. For example a usage of: ``<player>`` would display as ``/teleport <player>``.
	 * @param description Description of how the command works. For example: ``Teleport to a target player.``
	 */
	constructor(
		public commandLabel: string,
		public aliases: string[] = [],
		public usage: string = "",
		public description: string = "",
	) {}

	/**
	 * Execute is run on the server when a client runs a command.
	 * 
	 * @param player The player running the command.
	 * @param args A list of arguments to the command (all contents after the command label split by space).
	 * For example in the command ``/teleport 1 2 3`` args would be ``1``, ``2``, ``3``.
	 */
	public abstract Execute(player: Player, args: string[]): void;
}
