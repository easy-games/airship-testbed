import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { encode } from "Shared/json";
import { AuthController } from "../Auth/AuthController";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { MainMenuAddFriendsController } from "./MainMenuAddFriendsController";
import { Party } from "./SocketAPI";

@Controller({})
export class MainMenuPartyController implements OnStart {
	private party: Party | undefined;

	private partyMemberPrefab = AssetBridge.Instance.LoadAsset<GameObject>(
		"@Easy/Core/Shared/Resources/Prefabs/UI/MainMenu/PartyMember.prefab",
	);

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly socketController: SocketController,
	) {}

	OnStart(): void {
		this.socketController.On<Party>("game-coordinator/party-update", (data) => {
			this.party = data;
			this.UpdateParty();
		});

		this.socketController.On<Party>("game-coordinator/party-invite", (data) => {
			InternalHttpManager.PostAsync(
				AirshipUrl.GameCoordinator + "/parties/party/join",
				encode({
					partyId: data.partyId,
				}),
			);
		});

		this.Setup();
	}

	private Setup(): void {
		this.UpdateParty();

		Dependency<AuthController>()
			.WaitForAuthed()
			.then(() => {
				this.UpdateParty();
			});

		Game.LocalPlayer.onUsernameChanged.Connect(() => {
			this.UpdateParty();
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
		if (this.party === undefined) {
			const partyContent = this.mainMenuController.refs.GetValue("Social", "PartyContent");
			partyContent.ClearChildren();

			const partyTitle = this.mainMenuController.refs.GetValue("Social", "PartyTitle") as TMP_Text;
			partyTitle.text = `(0/8)`;

			const leaveButton = this.mainMenuController.refs.GetValue("Social", "LeavePartyButton");
			leaveButton.SetActive(false);

			return;
		}

		const partyContent = this.mainMenuController.refs.GetValue("Social", "PartyContent");
		const partyMemberUids = this.party.members.map((m) => m.uid);

		const leaveButton = this.mainMenuController.refs.GetValue("Social", "LeavePartyButton");
		if (this.party.leader === Game.LocalPlayer.userId) {
			leaveButton.SetActive(false);
		} else {
			leaveButton.SetActive(true);
		}

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

		let isLocalPartyLeader = Game.LocalPlayer.userId === this.party.leader;

		// Add new & update existing
		for (const member of this.party.members) {
			let go: GameObject;
			let init = false;
			if (alreadyAddedUids.includes(member.uid)) {
				go = partyContent.transform.FindChild(member.uid)!.gameObject;
			} else {
				go = GameObjectUtil.InstantiateIn(this.partyMemberPrefab, partyContent.transform);
				init = true;
			}

			const refs = go.GetComponent<GameObjectReferences>();

			const usernameText = refs.GetValue("UI", "Username") as TMP_Text;
			if (member.uid === Game.LocalPlayer.userId) {
				usernameText.text = Game.LocalPlayer.username;
			} else {
				usernameText.text = member.username;
			}

			const kickButton = refs.GetValue("UI", "KickButton");

			let showModTools = isLocalPartyLeader;
			if (member.uid === Game.LocalPlayer.userId) {
				showModTools = false;
			}

			if (showModTools) {
				kickButton.SetActive(true);
			} else {
				kickButton.SetActive(false);
			}

			const usernameLayout = refs.GetValue("UI", "UsernameLayout") as HorizontalLayoutGroup;
			LayoutRebuilder.ForceRebuildLayoutImmediate(usernameLayout.GetComponent<RectTransform>());

			const leftLayout = refs.GetValue("UI", "LeftLayout") as HorizontalLayoutGroup;
			LayoutRebuilder.ForceRebuildLayoutImmediate(leftLayout.GetComponent<RectTransform>());

			const partyTitle = this.mainMenuController.refs.GetValue("Social", "PartyTitle") as TMP_Text;
			partyTitle.text = `(${this.party.members.size()}/8)`;

			if (init) {
				CanvasAPI.OnClickEvent(kickButton, () => {
					InternalHttpManager.PostAsync(
						AirshipUrl.GameCoordinator + "/parties/party/remove",
						encode({
							userToRemove: member.uid,
						}),
					);
				});

				CanvasAPI.OnClickEvent(leaveButton, () => {
					InternalHttpManager.PostAsync(
						AirshipUrl.GameCoordinator + "/parties/party/remove",
						encode({
							userToRemove: member.uid,
						}),
					);
				});
			}
		}
	}
}
