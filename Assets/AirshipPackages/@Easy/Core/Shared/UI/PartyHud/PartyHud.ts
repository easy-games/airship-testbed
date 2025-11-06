import { Airship, Platform } from "../../Airship";
import { AirshipUser } from "../../Airship/Types/AirshipUser";
import { GameCoordinatorParty } from "../../TypePackages/game-coordinator-types";
import { Bin } from "../../Util/Bin";
import ObjectUtils from "../../Util/ObjectUtils";
import PartyHudMember from "./PartyHudMember";

export default class PartyHud extends AirshipBehaviour {
	// @Header("Config")
	// @Tooltip("Only shows the Party Button when mouse is unlocked.")
	// public conditionalBtn = true;

	@Header("Member")
	public membersParent: Transform;
	public memberPrefab: GameObject;

	@Header("Other")
	public partyBtn: Button;

	private partyBtnGO: GameObject;
	private uidToMember = new Map<string, PartyHudMember>();
	private bin = new Bin();

	override Start(): void {
		this.partyBtnGO = this.partyBtn.gameObject;
		this.membersParent.gameObject.ClearChildren();

		task.spawn(async () => {
			const party = await Platform.Client.Party.GetParty();
			this.UpdateParty(party);

			this.bin.Add(
				Platform.Client.Party.onPartyChange.Connect((party) => {
					this.UpdateParty(party);
				}),
			);
		});

		this.bin.Add(
			this.partyBtn.onClick.Connect(() => {
				Airship.Menu.OpenPartyMenu();
			}),
		);
	}

	private UpdateParty(party: GameCoordinatorParty.PartySnapshot): void {
		// Add new entries
		for (let member of party.members) {
			if (!this.uidToMember.has(member.uid)) {
				this.AddMember(member, member.uid === party.leader);
			}
		}

		// Delete old entries
		let toRemove: string[] = [];
		for (let uid of ObjectUtils.keys(this.uidToMember)) {
			if (party.members.find((m) => m.uid === uid) === undefined) {
				toRemove.push(uid);
			}
		}
		for (let uid of toRemove) {
			const comp = this.uidToMember.get(uid)!;
			Destroy(comp.gameObject);
			this.uidToMember.delete(uid);
		}

		// Hide when only one member in party
		this.membersParent.gameObject.SetActive(party.members.size() > 1);
	}

	private AddMember(user: AirshipUser, leader: boolean): void {
		const go = Instantiate(this.memberPrefab, this.membersParent);
		const memberComp = go.GetAirshipComponent<PartyHudMember>();
		if (!memberComp) error("[PartyHud]: Missing PartyHudMember component on member prefab.");

		this.uidToMember.set(user.uid, memberComp);
		memberComp.Init(user);
		if (leader) {
			memberComp.SetLeader(true);
		}
	}

	protected Update(dt: number): void {
		// if (this.conditionalBtn) {
		// 	this.partyBtnGO.SetActive(!Mouse.IsLocked());
		// }
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
