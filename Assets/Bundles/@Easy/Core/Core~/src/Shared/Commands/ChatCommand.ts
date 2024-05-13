import { Player } from "@Easy/Core/Shared/Player/Player";

export abstract class ChatCommand {
	constructor(
		public commandLabel: string,
		public aliases: string[] = [],
		public usage: string = "",
		public description: string = "",
	) {}

	public abstract Execute(player: Player, args: string[]): void;
}
