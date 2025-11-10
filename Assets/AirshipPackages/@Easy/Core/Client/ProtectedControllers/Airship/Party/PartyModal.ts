import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorClient, GameCoordinatorParty } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { ProtectedFriendsController } from "../../Social/FriendsController";
import { MainMenuPartyController } from "../../Social/MainMenuPartyController";
import { PendingSocialNotification } from "../../Social/PendingSocialNotification";
import { SocialNotificationType } from "../../Social/SocialNotificationType";
import PartyModalInvite from "./PartyModalInvite";
import PartyModalMember from "./PartyModalMember";
import PartyModalPlayer from "./PartyModalPlayer";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class PartyModal extends AirshipBehaviour {
	@Header("Player List")
	public playerPrefab: GameObject;
	public playersParent: Transform;

	@Header("Party Member")
	public memberPrefab: GameObject;
	public membersParent: Transform;

	@Header("Invites")
	public invitePrefab: GameObject;
	public invitesParent: Transform;

	@Header("Other")
	public bgButton: Button;
	public window: RectTransform;
	public leaveBtn: Button;
	public wrapper: RectTransform;

	private uidToPartyMember = new Map<string, PartyModalMember>();
	private bin = new Bin();

	override Start(): void {
		this.window.localScale = Vector3.one.mul(1.1);
		NativeTween.LocalScale(this.window, Vector3.one, 0.12).SetEaseQuadOut();

		if (Game.IsMobile()) {
			this.wrapper.localScale = Vector3.one.mul(1.7);
		}

		this.leaveBtn.gameObject.SetActive(false);

		const mainMenuPartyController = Dependency<MainMenuPartyController>();

		this.membersParent.gameObject.ClearChildren();
		task.spawn(async () => {
			this.UpdateParty(mainMenuPartyController.party);
			this.bin.Add(
				mainMenuPartyController.onPartyUpdated.Connect((newParty) => {
					this.UpdateParty(newParty);
				}),
			);
		});

		this.bin.Add(
			this.bgButton.onClick.Connect(() => {
				AppManager.Close();
			}),
		);

		this.playersParent.gameObject.ClearChildren();
		this.bin.Add(
			Airship.Players.ObservePlayers((p) => {
				// Show local player in editor for easier testing
				if (!Game.IsEditor() && p.IsLocalPlayer()) return;

				const go = Instantiate(this.playerPrefab, this.playersParent);
				const modalPlayer = go.GetAirshipComponent<PartyModalPlayer>()!;
				modalPlayer.Init(p);

				return () => {
					Destroy(go);
				};
			}),
		);

		this.bin.Add(
			this.leaveBtn.onClick.Connect(async () => {
				if (Protected.User.localUser) {
					await client.party.removeFromParty({ userToRemove: Protected.User.localUser.uid });
				}
			}),
		);

		// Invites
		this.invitesParent.gameObject.ClearChildren();

		const protectedFriendsController = Dependency<ProtectedFriendsController>();
		this.bin.Add(
			protectedFriendsController.onNewSocialNotification.Connect((notif) => {
				if (notif.type === SocialNotificationType.PartyInvite) {
					this.AddIncomingInvite(notif, notif.extraData as GameCoordinatorParty.PartySnapshot);
				}
			}),
		);

		for (let notif of protectedFriendsController.pendingSocialNotifications) {
			if (notif.type === SocialNotificationType.PartyInvite) {
				this.AddIncomingInvite(notif, notif.extraData as GameCoordinatorParty.PartySnapshot);
			}
		}
	}

	private AddIncomingInvite(notif: PendingSocialNotification, data: GameCoordinatorParty.PartySnapshot): void {
		const go = Instantiate(this.invitePrefab, this.invitesParent);
		const partyInvite = go.GetAirshipComponent<PartyModalInvite>()!;
		partyInvite.Init(notif, data);
	}

	private UpdateParty(party: GameCoordinatorParty.PartySnapshot | undefined): void {
		if (party === undefined) {
			this.leaveBtn.gameObject.SetActive(false);
			this.uidToPartyMember.clear();
			this.membersParent.gameObject.ClearChildren();
			return;
		}

		this.leaveBtn.gameObject.SetActive(party.members.size() > 1);

		for (let user of party.members) {
			if (this.uidToPartyMember.has(user.uid)) {
				const partyMemberComp = this.uidToPartyMember.get(user.uid)!;
				partyMemberComp.SetLeader(user.uid === party.leader);
				continue;
			}

			const go = Instantiate(this.memberPrefab, this.membersParent);
			const partyMemberComp = go.GetAirshipComponent<PartyModalMember>()!;
			partyMemberComp.Init(user);
			partyMemberComp.SetLeader(user.uid === party.leader);
			if (user.uid === party.leader) {
				partyMemberComp.transform.SetAsFirstSibling();
			}
			this.uidToPartyMember.set(user.uid, partyMemberComp);
		}

		const toRemove = [];
		for (let uid of ObjectUtils.keys(this.uidToPartyMember)) {
			if (party.members.find((p) => p.uid === uid) === undefined) {
				toRemove.push(uid);
			}
		}
		for (let uid of toRemove) {
			Destroy(this.uidToPartyMember.get(uid)!.gameObject);
			this.uidToPartyMember.delete(uid);
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
