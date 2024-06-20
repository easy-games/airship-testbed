import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller, Dependency, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreLogger } from "@Easy/Core/Shared/Logger/CoreLogger";
import PartyCard from "@Easy/Core/Shared/MainMenu/Components/Party/PartyCard";
import PartyMember from "@Easy/Core/Shared/MainMenu/Components/PartyMember";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { EncodeJSON } from "@Easy/Core/Shared/json";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { FriendsController } from "./FriendsController";
import { MainMenuAddFriendsController } from "./MainMenuAddFriendsController";

@Controller({})
export class MainMenuPartyController implements OnStart {
	public party: Party | undefined;
	public onPartyUpdated = new Signal<[newParty: Party | undefined, oldParty: Party | undefined]>();

	private partyCard!: PartyCard;
	private emptyPartyGO!: GameObject;

	private partyMemberPrefab = AssetBridge.Instance.LoadAsset<GameObject>(
		"AirshipPackages/@Easy/Core/Prefabs/UI/MainMenu/PartyMember.prefab",
	);

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly socketController: SocketController,
	) {}

	OnStart(): void {
		this.socketController.On<Party>("game-coordinator/party-update", (data) => {
			let oldParty = this.party;
			this.party = data;
			this.onPartyUpdated.Fire(data, oldParty);
			this.UpdateParty();

			if (this.party === undefined) {
				this.partyCard.SetLeaderStatus(undefined);
			}
		});

		this.socketController.On<UserStatusData[]>("game-coordinator/party-member-status-update-multi", (data) => {
			if (!this.party) return;

			const partyLeader = data.find((d) => d.userId === this.party!.leader);
			this.partyCard.SetLeaderStatus(partyLeader);
		});

		this.socketController.On<Party>("game-coordinator/party-invite", (data) => {
			Dependency<FriendsController>().AddSocialNotification(
				"party-invite:" + data.leader,
				"Party Invite",
				data.members[0].username,
				(result) => {
					if (result) {
						const res = InternalHttpManager.PostAsync(
							AirshipUrl.GameCoordinator + "/parties/party/join",
							EncodeJSON({
								partyId: data.partyId,
							}),
						);
						if (res.success) {
							Dependency<FriendsController>().FireNotificationKey("party-invite:" + data.leader);
						} else {
							Debug.LogError(res.error);
						}
					} else {
						// We don't have an endpoint for declining party invite. just close the UI.
						Dependency<FriendsController>().FireNotificationKey("party-invite:" + data.leader);
					}
				},
			);
			AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/FriendRequest.wav");
			if (Game.coreContext === CoreContext.GAME) {
				Game.localPlayer.SendMessage(
					ChatColor.Yellow(data.members[0].username) + ChatColor.Gray(" invited you to their party."),
				);
			}
		});

		this.Setup();
	}

	private Setup(): void {
		this.partyCard = this.mainMenuController.refs.GetValue("Social", "PartyCard").GetAirshipComponent<PartyCard>()!;
		this.emptyPartyGO = this.mainMenuController.refs.GetValue("Social", "EmptyPartyCard");

		this.UpdateParty();

		Dependency<AuthController>()
			.WaitForAuthed()
			.then(() => {
				this.UpdateParty();
			});

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

		// const profilePictureButton = this.mainMenuController.refs.GetValue("UI", "ProfilePictureButton");
		// CoreUI.SetupButton(profilePictureButton);
		// CanvasAPI.OnClickEvent(profilePictureButton, () => {
		// 	Dependency<ChangeUsernameController>().Open();
		// });
	}

	private UpdateParty(): void {
		if (this.party === undefined || this.party.members.size() <= 1) {
			this.partyCard.gameObject.SetActive(false);
			this.emptyPartyGO.SetActive(true);
			return;
		}
		this.partyCard.gameObject.SetActive(true);
		this.emptyPartyGO.SetActive(false);

		const partyContent = this.mainMenuController.refs.GetValue("Social", "PartyContent");
		const partyMemberUids = this.party.members.map((m) => m.uid);

		const leaveButton = this.mainMenuController.refs.GetValue("Social", "LeavePartyButton");
		if (this.party.leader === Game.localPlayer.userId) {
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

		let isLocalPartyLeader = Game.localPlayer.userId === this.party.leader;

		// Add new & update existing
		for (const member of this.party.members) {
			let go: GameObject;
			let init = false;
			if (alreadyAddedUids.includes(member.uid)) {
				go = partyContent.transform.FindChild(member.uid)!.gameObject;
			} else {
				go = Object.Instantiate(this.partyMemberPrefab, partyContent.transform);
				init = true;
			}

			const partyMemberComponent = go.GetAirshipComponent<PartyMember>()!;
			partyMemberComponent.SetUser(member, isLocalPartyLeader);
		}

		CanvasAPI.OnClickEvent(leaveButton, () => {
			InternalHttpManager.PostAsync(
				AirshipUrl.GameCoordinator + "/parties/party/remove",
				EncodeJSON({
					userToRemove: Game.localPlayer.userId,
				}),
			);
		});
	}

	/**
	 * Sends an invite to the provided user, allowing them to join the existing party.
	 * @param userIdToAdd The userId of the user to invite
	 */
	public async InviteUser(userIdToAdd: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/invite",
			EncodeJSON({ userToAdd: userIdToAdd }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to invite user to party. Status Code: ${res.statusCode}\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}

	/**
	 * Allows the party leader to remove users from the party. A client can always remove itself from the
	 * current party by calling this function and providing their own user id.
	 * @param userIdToRemove
	 */
	public async RemoveUser(userIdToRemove: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/remove",
			EncodeJSON({ userToRemove: userIdToRemove }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to remove user from party. Status Code: ${res.statusCode}\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}

	/**
	 * Joins the user to the provided party id. This may fail if the user is not allowed to join the party.
	 * @param partyId The id of the party
	 */
	public async JoinParty(partyId: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/join",
			EncodeJSON({ partyId }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to join party. Status Code: ${res.statusCode}\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}
}
