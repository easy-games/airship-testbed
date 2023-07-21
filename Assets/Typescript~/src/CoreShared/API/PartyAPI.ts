import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { UserAPI } from "./UserAPI";
import { decode, encode } from "Server/Lib/json";
import { SetInterval } from "Shared/Util/Timer";
import { SIOEventNames } from "CoreShared/SocketIOMessages/SOIEventNames";
import { Party, PartyStateData, PartyStatus } from "CoreShared/SocketIOMessages/Party";

export class PartyAPI {
	private static partyData: Party;
	private static partyInvites: Party[];

	static async InitAsync(): Promise<void> {
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			switch (signal.messageName) {
				case SIOEventNames.partyInvite:
					// TODO: party invite
					break;
				case SIOEventNames.partyUpdate:
					// TODO: party update
					break;
				case SIOEventNames.joinQueue:
					// TODO: join queue
					break;
				case SIOEventNames.leaveQueue:
					// TODO: leave queue
					break;
				default:
					// Ignore the non-supported messages.
					break;
			}
		});

		EasyCore.EmitAsync(SIOEventNames.refreshStatus);

		SetInterval(
			3,
			() => {
				print(
					`PartyAPI.InitAsync.SetInterval() this.partyData: ${encode(
						this.partyData,
					)}, this.partyInvites: ${encode(this.partyInvites)}`,
				);
			},
			true,
		);

		// Playfab requires the party leader to refresh their status because
		// there's no event hook to attach to when the party state changes.
		SetInterval(
			3,
			() => {
				if (!this.partyData) return;
				if (this.partyData.data.status !== PartyStatus.QUEUED) return;
				if (this.partyData.leader !== UserAPI.GetCurrentUser()?.uid) return;

				EasyCore.EmitAsync(SIOEventNames.refreshStatus);
			},
			true,
		);
	}

	static InviteToParty(userId: string) {
		EasyCore.EmitAsync(SIOEventNames.inviteToParty, encode({ userToAdd: userId }));
	}

	static JoinParty(partyId: string) {
		EasyCore.EmitAsync(SIOEventNames.joinParty, encode({ partyId: partyId }));
	}

	static RemoveFromParty(userId: string) {
		EasyCore.EmitAsync(SIOEventNames.removeFromParty, encode({ userToRemove: userId }));
	}

	static JoinQueue(queueId: string, regions: string[]) {
		EasyCore.EmitAsync(SIOEventNames.joinQueue, encode({ queueId, regions }));
	}

	static LeaveQueue() {
		EasyCore.EmitAsync(SIOEventNames.leaveQueue);
	}
}
