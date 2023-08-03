import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
import { UserAPI } from "CoreShared/API/UserAPI";
import { encode } from "CoreShared/json";
import { UpdateUserDto } from "CoreShared/SocketIOMessages/UpdateUserDto";
import { UserStatus } from "CoreShared/SocketIOMessages/Status";

export class UserCommand extends ChatCommand {
	private usageString =
		`Usage: /user [action] [actionArgs].\n` +
		`Examples:\n` +
		`/user ?\n` +
		`/user\n` +
		`/user RESTREBEL87723#0001\n` +
		`/user updateUsername RESTREBEL87723\n` +
		`/user updateDiscriminator 0002\n` +
		`/user updateStatus in_game\n`;

	constructor() {
		super("user", ["u"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			const user = UserAPI.GetCurrentUser();

			player.SendMessage(`CurrentUser: ${encode(user)}`);
			return;
		}

		if (args.size() > 0) {
			const firstArg = args[0];

			if (firstArg === "?") {
				player.SendMessage(`${this.usageString}`);
				return;
			} else if (firstArg === "updateUsername") {
				const newUsername = args[1];

				UserAPI.UpdateCurrentUserDataAsync(new UpdateUserDto(newUsername))
					.then(() => {
						player.SendMessage(`Updated username: ${newUsername}`);
					})
					.catch((reason) => {
						player.SendMessage(`Exception updating username. reason: ${reason}`);
					});

				return;
			} else if (firstArg === "updateDiscriminator") {
				const newDiscriminator = args[1];

				const curUser = UserAPI.GetCurrentUser();

				if (!curUser) {
					player.SendMessage(`Unable to get current user data to update.`);
				}

				UserAPI.UpdateCurrentUserDataAsync(new UpdateUserDto(curUser!.username, newDiscriminator))
					.then(() => {
						player.SendMessage(`Updated discriminator: ${newDiscriminator}`);
					})
					.catch((reason) => {
						player.SendMessage(`Exception updating discriminator. reason: ${reason}`);
					});

				return;
			} else if (firstArg === "updateStatus") {
				const newStatus = args[1];
				const gameName = args.size() > 2 ? args[2] : "";

				try {
					UserAPI.UpdateCurrentUserStatus(newStatus as unknown as UserStatus, gameName);
					player.SendMessage(
						`Updated userStatus: ${newStatus}, gameName: ${gameName === "" ? "undefined" : gameName}`,
					);
				} catch (err) {
					player.SendMessage(`Exception updating user status. reason: ${err}`);
				}

				return;
			} else if (firstArg === "status") {
				player.SendMessage(
					`User status: ${encode({ status: UserAPI.GetUserStatus(), gameName: UserAPI.GetGameName() })}}`,
				);
			}
		}
	}
}
