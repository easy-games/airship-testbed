import { AirshipPartyInternalSnapshot } from "@Easy/Core/Shared/Airship/Types/AirshipParty";
import { AirshipUserStatusData } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import PartyCard from "@Easy/Core/Shared/MainMenu/Components/Party/PartyCard";
import PartyMember from "@Easy/Core/Shared/MainMenu/Components/PartyMember";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { ProtectedFriendsController } from "./FriendsController";
import { MainMenuAddFriendsController } from "./MainMenuAddFriendsController";
import { SocialNotificationType } from "./SocialNotificationType";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class MainMenuPartyController {
	public party: AirshipPartyInternalSnapshot | undefined;
	public onPartyUpdated = new Signal<
		[newParty: AirshipPartyInternalSnapshot | undefined, oldParty: AirshipPartyInternalSnapshot | undefined]
	>();

	private partyCard!: PartyCard;
	private partyCardContents!: GameObject;
	private emptyPartyGO!: GameObject;

	private partyMemberPrefab = AssetBridge.Instance.LoadAsset<GameObject>(
		"AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/PartyMember.prefab",
	);

	private partyUpdateReceived = false;
	private partyLeaderStatusReceived = false;

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly socketController: SocketController,
	) {}

	/**
	 * @returns True if both a party leader and party has more than 1 player.
	 */
	public IsPartyLeader(): boolean {
		if (!this.party) return false;
		if (!Protected.User.localUser) return false;

		return this.party.leader === Protected.User.localUser.uid && this.party.members.size() > 1;
	}

	protected OnStart(): void {
		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-update", (data) => {
			this.partyUpdateReceived = true;
			let oldParty = this.party;
			this.party = data;
			this.onPartyUpdated.Fire(data, oldParty);
			this.UpdateParty();

			if (this.party === undefined) {
				this.partyCard.UpdateInfo(undefined);
			}
		});

		this.socketController.On<AirshipUserStatusData[]>(
			"game-coordinator/party-member-status-update-multi",
			(data) => {
				if (!this.party) return;

				this.partyLeaderStatusReceived = true;
				const partyLeader = data.find((d) => d.userId === this.party!.leader);
				this.partyCard.UpdateInfo(partyLeader);
			},
		);

		Dependency<ProtectedFriendsController>().socialNotificationHandlers.set(
			SocialNotificationType.PartyInvite,
			(username, userId, result, extraData) => {
				const data = extraData as AirshipPartyInternalSnapshot;
				if (result) {
					try {
						client.party.joinParty({ partyId: data.partyId }).expect();
						Dependency<ProtectedFriendsController>().FireNotificationKey("party-invite:" + data.leader);
					} catch {
						// empty
					}
				} else {
					// We don't have an endpoint for declining party invite. just close the UI.
					Dependency<ProtectedFriendsController>().FireNotificationKey("party-invite:" + data.leader);
				}
			},
		);

		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-invite", (data) => {
			Dependency<ProtectedFriendsController>().AddSocialNotification(
				SocialNotificationType.PartyInvite,
				"party-invite:" + data.leader,
				"Party Invite",
				data.members[0].username,
				data.members[0].uid,
				data,
			);
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/FriendRequest.mp3", {
				volumeScale: 0.3,
			});
			if (Game.coreContext === CoreContext.GAME) {
				Game.localPlayer.SendMessage(
					ChatColor.Yellow(data.members[0].username) + ChatColor.Gray(" invited you to their party."),
				);
			}
		});

		// load from cache
		this.SetupReferences();

		task.spawn(() => {
			Protected.User.WaitForLocalUser();
			if (!this.partyUpdateReceived) {
				const partyString = StateManager.GetString("airship:party");
				if (partyString) {
					this.party = json.decode(partyString);
				}
			}

			// Note: we should merge UpdateParty() with partyCard.UpdateInfo().
			// For now, we need to call this first.
			this.UpdateParty();

			if (!this.partyLeaderStatusReceived) {
				const partyLeaderStatusString = StateManager.GetString("airship:party-leader-status");
				if (partyLeaderStatusString) {
					this.partyCard.UpdateInfo(json.decode(partyLeaderStatusString));
				}
			}
		});
	}

	private SetupReferences(): void {
		this.partyCard = this.mainMenuController.refs.GetValue("Social", "PartyCard").GetAirshipComponent<PartyCard>()!;
		this.emptyPartyGO = this.mainMenuController.refs.GetValue("Social", "EmptyPartyCard");
		this.partyCardContents = this.mainMenuController.refs.GetValue("Social", "PartyCardContents");
		this.partyCardContents.SetActive(false);

		task.spawn(() => {
			Game.WaitForLocalPlayerLoaded();
			Game.localPlayer.onUsernameChanged.Connect(() => {
				this.UpdateParty();
			});
		});

		const addFriendsButton = this.mainMenuController.refs.GetValue("Social", "AddFriendsButton");
		CoreUI.SetupButton(addFriendsButton);
		CanvasAPI.OnClickEvent(addFriendsButton, () => {
			Dependency<MainMenuAddFriendsController>().Open();
		});
	}

	private UpdateParty(dontUpdateCache = false): void {
		if (!dontUpdateCache) {
			if (this.party) {
				StateManager.SetString("airship:party", json.encode(this.party));
			} else {
				StateManager.RemoveString("airship:party");
			}
		}

		if (this.party === undefined || (this.party.members.size() <= 1 && this.party.invited.size() === 0)) {
			this.partyCardContents.SetActive(false);
			this.emptyPartyGO.SetActive(true);
			return;
		}
		this.partyCardContents.SetActive(true);
		this.emptyPartyGO.SetActive(false);

		const partyContent = this.mainMenuController.refs.GetValue("Social", "PartyContent");
		const partyMemberUids = this.party.members.map((m) => m.uid);

		const leaveButton = this.mainMenuController.refs.GetValue("Social", "LeavePartyButton");
		const isLocalPlayerThePartyLeader = this.party.leader === Game.localPlayer.userId;
		if (isLocalPlayerThePartyLeader) {
			leaveButton.SetActive(false);
		} else {
			leaveButton.SetActive(true);
		}

		CoreLogger.Log("party: " + json.encode(this.party));

		// Remove old
		let membersToRemove: GameObject[] = [];
		let alreadyAddedUids: string[] = [];
		let childCount = partyContent.transform.childCount;
		for (let i = 0; i < childCount; i++) {
			const child = partyContent.transform.GetChild(i);
			if (partyMemberUids.includes(child.gameObject.name)) {
				alreadyAddedUids.push(child.gameObject.name);
			} else {
				membersToRemove.push(child.gameObject);
			}
		}
		for (const go of membersToRemove) {
			Object.Destroy(go);
		}

		// Add new & update existing
		for (const member of this.party.members) {
			let go: GameObject;
			let init = false;
			if (alreadyAddedUids.includes(member.uid)) {
				go = partyContent.transform.FindChild(member.uid)!.gameObject;
			} else {
				go = Instantiate(this.partyMemberPrefab, partyContent.transform);
				init = true;
			}

			const partyMemberComponent = go.GetAirshipComponent<PartyMember>()!;
			partyMemberComponent.SetUser(member, member.uid === this.party.leader, isLocalPlayerThePartyLeader);
		}

		CanvasAPI.OnClickEvent(leaveButton, () => {
			client.party.removeFromParty({ userToRemove: Game.localPlayer.userId }).expect();
		});
	}

	/**
	 * Sends an invite to the provided user, allowing them to join the existing party.
	 * @param userIdToAdd The userId of the user to invite
	 */
	public async InviteUser(userIdToAdd: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.inviteUser({ userToAdd: userIdToAdd });
			return { success: true, data: undefined };
		} catch {
			return {
				success: false,
				error: undefined,
			};
		}
	}

	/**
	 * Allows the party leader to remove users from the party. A client can always remove itself from the
	 * current party by calling this function and providing their own user id.
	 * @param userIdToRemove
	 */
	public async RemoveUser(userIdToRemove: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.removeFromParty({ userToRemove: userIdToRemove });
			return { success: true, data: undefined };
		} catch {
			return {
				success: false,
				error: undefined,
			};
		}
	}

	/**
	 * Joins the user to the provided party id. This may fail if the user is not allowed to join the party.
	 * @param partyId The id of the party
	 */
	public async JoinParty(partyId: string): Promise<Result<undefined, undefined>> {
		try {
			await client.party.joinParty({ partyId });
			return { success: true, data: undefined };
		} catch {
			return { success: false, error: undefined };
		}
	}
}
