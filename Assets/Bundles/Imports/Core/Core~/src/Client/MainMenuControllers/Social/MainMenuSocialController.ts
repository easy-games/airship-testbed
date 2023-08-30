import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { decode } from "Shared/json";
import { MainMenuController } from "../MainMenuController";
import { SocketController } from "../Socket/SocketController";
import { Party } from "./SocketAPI";

@Controller({})
export class MainMenuSocialController implements OnStart {
	private party: Party | undefined;

	private partyMemberPrefab = AssetBridge.LoadAsset<GameObject>(
		"Imports/Core/Shared/Resources/Prefabs/UI/MainMenu/PartyMember.prefab",
	);

	constructor(
		private readonly mainMenuController: MainMenuController,
		private readonly socketController: SocketController,
	) {}

	OnStart(): void {
		this.Setup();
	}

	private Setup(): void {
		this.UpdateParty();
		this.socketController.onEvent.Connect((eventName, data) => {
			if (eventName !== "game-coordinator/party-update") return;
			this.party = decode<Party>(data);
			this.UpdateParty();
		});
	}

	private UpdateParty(): void {
		if (this.party === undefined) {
			const partyContent = this.mainMenuController.refs.GetValue("Social", "PartyContent");
			partyContent.ClearChildren();

			const partyTitle = this.mainMenuController.refs.GetValue("Social", "PartyTitle") as TMP_Text;
			partyTitle.text = `Party (0/8)`;

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
			usernameText.text = member.username;

			const kickButton = refs.GetValue("UI", "KickButton");

			let showModTools = false;

			if (member.uid === this.party.leader && member.uid !== Game.LocalPlayer.userId) {
				showModTools = true;
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
			partyTitle.text = `Party (${this.party.members.size()}/8)`;

			if (init) {
				CanvasAPI.OnClickEvent(kickButton, () => {
					this.socketController.Emit("remove-from-party", {
						userToRemove: member.uid,
					});
				});

				CanvasAPI.OnClickEvent(leaveButton, () => {
					this.socketController.Emit("remove-from-party", {
						userToRemove: member.uid,
					});
				});
			}
		}
	}
}
