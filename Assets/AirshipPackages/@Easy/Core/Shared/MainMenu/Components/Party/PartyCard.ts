import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuPartyController } from "@Easy/Core/Client/ProtectedControllers/Social/MainMenuPartyController";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { AirshipUserStatusData } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Asset } from "@Easy/Core/Shared/Asset";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorParty } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import FriendCard from "../Friends/FriendCard";
import PartyCardMember from "./PartyCardMember";

export default class PartyCard extends AirshipBehaviour {
	public inviteBtn: Button;
	public warpButton: Button;
	public joinBtn: Button;
	public leaveBtn: Button;
	public dropFriendHover: GameObject;
	public emptyPartyLabel: GameObject;
	public partyMemberPrefab: GameObject;

	private loadedGameImageId: string | undefined;
	private bin = new Bin();
	private uidToMember = new Map<string, PartyCardMember>();

	protected Awake(): void {
		this.warpButton.gameObject.SetActive(false);
		this.joinBtn.gameObject.SetActive(false);

		let toRemove: Transform[] = [];
		for (let child of this.transform) {
			if (child.name.includes("PartyCardMember")) {
				toRemove.push(child);
			}
		}
		for (let r of toRemove) {
			Destroy(r.gameObject);
		}
		this.emptyPartyLabel.SetActive(true);
	}

	override Start(): void {
		this.bin.Add(
			this.joinBtn.onClick.Connect(() => {
				task.spawn(() => {
					Dependency<TransferController>().TransferToPartyLeader();
				});
			}),
		);
		this.bin.Add(
			this.warpButton.onClick.Connect((event) => {
				task.spawn(async () => {
					await Dependency<TransferController>().TransferPartyMembersToLeader();
				});
			}),
		);

		if (!Game.IsMobile()) {
			this.SetupDragFriendHooks();
		}

		const mainMenuPartyController = Dependency<MainMenuPartyController>();
		task.spawn(async () => {
			this.UpdateParty(mainMenuPartyController.party);
			this.bin.Add(
				mainMenuPartyController.onPartyUpdated.Connect((newParty) => {
					this.UpdateParty(newParty);
				}),
			);
		});

		this.bin.Add(
			this.inviteBtn.onClick.Connect(() => {
				VibrationManager.Play(VibrationFeedbackType.Heavy);
				AppManager.OpenModal(
					Asset.LoadAsset(
						"Assets/AirshipPackages/@Easy/Core/Prefabs/MainMenu/HomePage/PartyInviteModal.prefab",
					),
				);
			}),
		);
	}

	private SetupDragFriendHooks() {
		// If hovering with a friend card
		CanvasAPI.OnHoverEvent(this.gameObject, (hoverState, data) => {
			// Check if dragging a friend card
			const friendCard = data.pointerDrag?.GetAirshipComponent<FriendCard>();

			const hovering = hoverState === HoverState.ENTER && friendCard !== undefined;
			this.SetFriendHoverState(hovering);
		});

		// Watch for dropping friends on party card
		CanvasAPI.OnDropEvent(this.gameObject, (data) => {
			this.SetFriendHoverState(false);

			const draggedObject = data.pointerDrag;
			const friendId = draggedObject.GetAirshipComponent<FriendCard>()?.userId;
			if (friendId) {
				Dependency<ProtectedPartyController>()
					.InviteToParty(friendId)
					.catch((reason: unknown) => {
						Debug.LogError("Failed to invite to party: " + reason);
					});
			}
		});
	}

	private SetFriendHoverState(hovering: boolean) {
		this.dropFriendHover.SetActive(hovering === true);
	}

	private UpdateParty(party: GameCoordinatorParty.PartySnapshot | undefined): void {
		if (party === undefined) {
			this.leaveBtn.gameObject.SetActive(false);
			this.uidToMember.clear();
			for (let child of this.transform) {
				if (child.gameObject.name.includes("PartyCardMember")) {
					Destroy(child.gameObject);
				}
			}
			return;
		}

		this.leaveBtn.gameObject.SetActive(party.members.size() > 1 && party.leader !== Protected.User.localUser?.uid);
		this.emptyPartyLabel.SetActive(party.members.size() <= 1);

		for (let user of party.members) {
			if (this.uidToMember.has(user.uid)) {
				const partyMemberComp = this.uidToMember.get(user.uid)!;
				partyMemberComp.SetLeader(user.uid === party.leader);
				continue;
			}

			const go = Instantiate(this.partyMemberPrefab, this.transform);
			const partyMemberComp = go.GetAirshipComponent<PartyCardMember>()!;
			partyMemberComp.transform.SetSiblingIndex(1);
			partyMemberComp.Init(user);
			partyMemberComp.SetLeader(user.uid === party.leader);
			if (user.uid === party.leader) {
				partyMemberComp.transform.SetAsFirstSibling();
			}
			this.uidToMember.set(user.uid, partyMemberComp);
		}

		const toRemove = [];
		for (let uid of ObjectUtils.keys(this.uidToMember)) {
			if (party.members.find((p) => p.uid === uid) === undefined) {
				toRemove.push(uid);
			}
		}
		for (let uid of toRemove) {
			Destroy(this.uidToMember.get(uid)!.gameObject);
			this.uidToMember.delete(uid);
		}
	}

	public UpdateStatus(userStatus: AirshipUserStatusData | undefined) {
		const party = Dependency<MainMenuPartyController>().party;
		const isLeader = party?.leader === Protected.User.localUser?.uid;

		if (userStatus) {
			StateManager.SetString("airship:party-leader-status", json.encode(userStatus));
		} else {
			StateManager.RemoveString("airship:party-leader-status");
		}

		this.warpButton.gameObject.SetActive(isLeader && Game.IsInGame());

		const HideNowPlaying = () => {
			this.joinBtn.gameObject.SetActive(false);
		};

		if (party === undefined || party.members.size() <= 1) {
			HideNowPlaying();
			return;
		}

		if (!userStatus || userStatus.status !== "in_game") {
			HideNowPlaying();
			return;
		}

		// if (this.loadedGameImageId !== userStatus.game.icon) {
		// 	this.loadedGameImageId = userStatus.game.icon;
		// 	task.spawn(() => {
		// 		const texture = Bridge.DownloadTexture2DYielding(`${AirshipUrl.CDN}/images/${userStatus.game.icon}`);
		// 		if (texture) {
		// 			this.gameImage.texture = texture;
		// 		}
		// 	});
		// }
		// this.gameText.text = `Playing ${userStatus.game.name}`;
	}

	override OnDestroy(): void {}
}
