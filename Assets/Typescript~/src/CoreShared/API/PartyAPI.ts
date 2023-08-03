import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { UserAPI } from "./UserAPI";
import { decode, encode } from "CoreShared/json";
import { SetInterval, SetTimeout } from "Shared/Util/Timer";
import { SIOEventNames } from "CoreShared/SocketIOMessages/SOIEventNames";
import { Party, PartyStatus } from "CoreShared/SocketIOMessages/Party";

export class PartyAPI {
	private static partyData: Party;
	private static partyInvites: Party[] = [];

	static async InitAsync(): Promise<void> {
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			switch (signal.messageName) {
				case SIOEventNames.partyInvite:
					{
						const partyInvite = decode<Party[]>(signal.jsonMessage)[0];
						if (!this.partyInvites.find((p) => p.partyId === partyInvite.partyId)) {
							this.partyInvites.push(partyInvite);

							CoreSignals.PartyInviteReceived.Fire(partyInvite);
						}
					}
					break;
				case SIOEventNames.partyUpdate:
					this.partyData = decode<Party[]>(signal.jsonMessage)[0];

					CoreSignals.PartyUpdated.Fire(this.partyData);
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

		this.RefreshPartyStatus();

		const initTime = Time.time;
		print(`PartyAPI initTime: ${initTime}`);

		const checkPartyData = () => {
			if (!this.partyData) {
				SetTimeout(0.1, checkPartyData);
			} else {
				print(`PartyAPI partyData took ${Time.time - initTime} seconds to acquire.`);
			}
		};

		checkPartyData();

		// SetInterval(
		// 	3,
		// 	() => {
		// 		print(
		// 			`PartyAPI.InitAsync.SetInterval() this.partyData: ${encode(
		// 				this.partyData,
		// 			)}, this.partyInvites: ${encode(this.partyInvites)}`,
		// 		);
		// 	},
		// 	true,
		// );

		// Playfab requires the party leader to refresh their status while queuing
		// because there's no event hook to attach to when the party state changes.
		SetInterval(
			3,
			() => {
				if (!this.partyData) return;
				if (this.partyData.data.status !== PartyStatus.QUEUED) return;
				if (this.partyData.leader !== UserAPI.GetCurrentUser()?.uid) return;

				this.RefreshPartyStatus();
			},
			true,
		);
	}

	private static RefreshPartyStatus(): void {
		EasyCore.EmitAsync(SIOEventNames.refreshStatus);
	}

	static GetCurrentParty(): Party {
		return this.partyData;
	}

	static GetPartyInvites(): Party[] {
		return this.partyInvites;
	}

	static InviteToParty(userId: string) {
		EasyCore.EmitAsync(SIOEventNames.inviteToParty, encode([{ userToAdd: userId }]));
	}

	static JoinParty(partyId: string) {
		EasyCore.EmitAsync(SIOEventNames.joinParty, encode([{ partyId: partyId }]));
	}

	static RemoveFromParty(userId: string) {
		EasyCore.EmitAsync(SIOEventNames.removeFromParty, encode([{ userToRemove: userId }]));
	}

	static JoinQueue(queueId: string, regions: string[]) {
		EasyCore.EmitAsync(SIOEventNames.joinQueue, encode([{ queueId, regions }]));
	}

	static LeaveQueue() {
		EasyCore.EmitAsync(SIOEventNames.leaveQueue);
	}
}
