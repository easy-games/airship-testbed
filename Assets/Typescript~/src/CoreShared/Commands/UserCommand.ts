import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
import { UserAPI } from "CoreShared/API/UserAPI";
import { encode } from "CoreShared/json";

export class UserCommand extends ChatCommand {
	constructor() {
		super("user");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			const user = UserAPI.GetCurrentUser();

			player.SendMessage(`CurrentUser: ${encode(user)}`);
			return;
		}

		if (args.size() > 0) {
			const discriminatedUsername = args[0];

			UserAPI.GetUserAsync(discriminatedUsername)
				.then((user) => {
					if (user) {
						player.SendMessage(`UserData: ${encode(user)}`);
					} else {
						player.SendMessage(
							`Unable to find user data for discriminatedUsername: ${discriminatedUsername}`,
						);
					}
				})
				.catch((reason) => {
					player.SendMessage(
						`Exception finding user data for discriminatedUsername: ${discriminatedUsername}. reason: ${reason}`,
					);
				});

			return;
		}
	}
}
