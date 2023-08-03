import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
import { UserAPI } from "CoreShared/API/UserAPI";
import { encode } from "CoreShared/json";
import { UpdateUserDto } from "CoreShared/SocketIOMessages/UpdateUserDto";
import { UserStatus } from "CoreShared/SocketIOMessages/Status";
import { PartyAPI } from "CoreShared/API/PartyAPI";
import StringUtil from "Shared/Util/StringUtil";
import { FriendAPI } from "CoreShared/API/FriendAPI";
import { ApiHelper } from "CoreShared/ApiHelper";

export class PartyCommand extends ChatCommand {
	private usageString =
		`Usage: /party [action] [actionArgs].\n` +
		`Examples:\n` +
		`/party ?\n` +
		`/party\n` +
		`/party RESTREBEL87723#0001\n` +
		`/party updateUsername RESTREBEL87723\n` +
		`/party updateDiscriminator 0002\n` +
		`/party updateStatus in_game\n`;

	constructor() {
		super("party", ["p"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			const currentParty = PartyAPI.GetCurrentParty();

			player.SendMessage(`CurrentParty: ${encode(currentParty)}`);
			return;
		}

		if (args.size() > 0) {
			const firstArg = args[0];

			if (firstArg === "?") {
				player.SendMessage(`${this.usageString}`);
				return;
			} else if (firstArg === "invites") {
				const partyInvites = PartyAPI.GetPartyInvites();

				if (partyInvites.size() > 0) {
					player.SendMessage(`partyInvites (count: ${partyInvites.size()}):\n`);
					partyInvites.forEach((pi) => {
						player.SendMessage(encode(pi));
					});
				} else {
					player.SendMessage(`No party invites found.`);
				}

				return;
			} else if (firstArg === "invite") {
				const discriminatedUsername = args[1];

				UserAPI.GetUserAsync(discriminatedUsername).then((user) => {
					if (user) {
						PartyAPI.InviteToParty(user.uid);
						player.SendMessage(`User (${discriminatedUsername}) has been invited to your party.`);
					} else {
						player.SendMessage(
							`Unable to find user with discriminatedUsername: ${discriminatedUsername}. ${this.usageString}`,
						);
					}
				});
			} else if (firstArg === "join") {
				const partyInvites = PartyAPI.GetPartyInvites();

				if (partyInvites.size() > 0) {
					if (args.size() === 1) {
						const firstPartyId = partyInvites[0].partyId;
						PartyAPI.JoinParty(firstPartyId);
						player.SendMessage(`Joined partyId: ${firstPartyId}`);
						return;
					} else {
						const partyIdFilter = args[1];

						const foundParty = partyInvites.find((p) => StringUtil.includes(p.partyId, partyIdFilter));

						if (foundParty) {
							PartyAPI.JoinParty(foundParty.partyId);
							player.SendMessage(`Joined partyId: ${foundParty.partyId}`);
							return;
						}
					}
				}

				player.SendMessage(`No party found to join.`);
				return;
			} else if (firstArg === "remove") {
				if (args.size() === 1) {
					PartyAPI.RemoveFromParty(UserAPI.GetCurrentUser()!.uid);
					player.SendMessage(`You have left the party.`);
				} else {
					const discriminatedUsername = args[1];

					UserAPI.GetUserAsync(discriminatedUsername).then((user) => {
						if (user) {
							PartyAPI.RemoveFromParty(user.uid);

							if (user.uid === UserAPI.GetCurrentUser()?.uid) {
								player.SendMessage(`You have left the party.`);
							} else {
								player.SendMessage(`User (${discriminatedUsername}) has been removed from your party.`);
							}
						} else {
							player.SendMessage(
								`Unable to find user with discriminatedUsername: ${discriminatedUsername}. ${this.usageString}`,
							);
						}
					});
				}

				return;
			} else if (firstArg === "joinQueue") {
				//TODO: parse queueID and regions from args.

				try {
					PartyAPI.JoinQueue(ApiHelper.QUEUE_ID, ApiHelper.REGIONS);
					player.SendMessage(
						`Joined queue. queueId: ${ApiHelper.QUEUE_ID}, regions: ${encode(ApiHelper.REGIONS)}`,
					);
				} catch (err) {
					player.SendMessage(`Exception joining queue. reason: ${err}`);
				}

				return;
			} else if (firstArg === "leaveQueue") {
				PartyAPI.LeaveQueue();
				player.SendMessage(`Left queue.`);
			}
		}
	}
}
