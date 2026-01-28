import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { GameCoordinatorUsers } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PartyCardMember extends AirshipBehaviour {
	public avatarImg: RawImage;
	public crown: GameObject;
	public button: Button;
	private user: GameCoordinatorUsers.PublicUser;
	public kickOverlay: Image;

	private bin = new Bin();

	override Start(): void {}

	public Init(user: GameCoordinatorUsers.PublicUser): void {
		if (!Game.IsClient()) return;

		this.user = user;

		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(user.uid);
			if (this.avatarImg) {
				this.avatarImg.texture = tex;
				this.avatarImg.color = Color.white;
			}
		});

		this.bin.Add(
			Dependency<ProtectedPartyController>().ObserveIsPartyLead((isPartyLead) => {
				this.SetIsLocalLeader(isPartyLead);
			}),
		);

		this.bin.Add(
			this.button.onClick.Connect(() => {
				Dependency<ProtectedPartyController>().RemoveFromParty(this.user.uid);
			}),
		);
		this.kickOverlay.gameObject.SetActive(false);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hov) => {
				if (!Dependency<ProtectedPartyController>().IsPartyLeader()) return;
				if (this.user.uid === Protected.User.localUser?.uid) return;
				this.kickOverlay.gameObject.SetActive(hov === HoverState.ENTER);
			}),
		);
	}

	public SetLeader(leader: boolean): void {
		this.crown.SetActive(leader);
		if (leader) {
			this.transform.SetAsFirstSibling();
		}
	}

	private SetIsLocalLeader(leader: boolean): void {
		if (this.user.uid === Protected.User.localUser?.uid) {
			this.button.enabled = false;
			return;
		}

		this.button.enabled = leader;
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
