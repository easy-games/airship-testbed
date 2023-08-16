import { FriendAPI } from "Shared/API/FriendAPI";
import { Player } from "Shared/Player/Player";
import { encode } from "Shared/json";
import { ChatCommand } from "./ChatCommand";

export class FriendsCommand extends ChatCommand {
	private usageString =
		`Usage: /fr [action] [actionArgs].\n` +
		`Examples:\n` +
		`/fr ?\n` +
		`/fr add RESTREBEL87723#0001\n` +
		`/fr remove RESTREBEL87723#0001\n` +
		`/fr list\n`;

	constructor() {
		super("friend", ["fr"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage(`${this.usageString}`);
			return;
		}

		const action = args[0];

		if (action === "?") {
			player.SendMessage(`${this.usageString}`);
			return;
		}

		if (action === "add") {
			if (args.size() < 2) {
				player.SendMessage(`Invalid arguments. Must provide a discriminatedUsername. ${this.usageString}`);
				return;
			}

			const discriminatedUsername = args[1];

			FriendAPI.RequestFriendshipAsync(discriminatedUsername).then((resultObj) => {
				player.SendMessage(`Friend request sent to: ${discriminatedUsername}. Status: ${resultObj.result}`);
			});

			return;
		}

		if (action === "remove") {
			if (args.size() < 2) {
				player.SendMessage(`Invalid arguments. Must provide a discriminatedUsername. ${this.usageString}`);
				return;
			}

			const discriminatedUsername = args[1];

			const fsd = FriendAPI.GetFriendStatusData(discriminatedUsername);

			if (fsd) {
				FriendAPI.TerminateFriendshipAsync(fsd.userId).then(() => {
					player.SendMessage(`Friendship has been terminated for ${discriminatedUsername}.`);
				});
			} else {
				player.SendMessage(
					`Unable to find friend with discriminatedUsername: ${discriminatedUsername}. ${this.usageString}`,
				);
			}

			return;
		}

		if (action === "list") {
			const fsds = FriendAPI.GetFriendsWithStatus();

			if (fsds.isEmpty()) {
				player.SendMessage(`No friends found.`);
			} else {
				player.SendMessage(`friends (count: ${fsds.size()}):\n`);
				fsds.forEach((fsd) => {
					player.SendMessage(encode(fsd));
				});
			}

			return;
		}

		if (action === "requests") {
			FriendAPI.GetFriendRequestsAsync().then((friendRequests) => {
				if (friendRequests.incomingRequests.isEmpty() && friendRequests.outgoingRequests.isEmpty()) {
					player.SendMessage(`No friend requests found.`);
				} else {
					player.SendMessage(
						"requests:\n" +
							encode({
								incoming: friendRequests.incomingRequests,
								outgoing: friendRequests.outgoingRequests,
							}),
					);
				}
			});

			return;
		}
	}
}
