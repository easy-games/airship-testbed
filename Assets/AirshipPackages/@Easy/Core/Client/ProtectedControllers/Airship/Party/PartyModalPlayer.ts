import { Airship } from "@Easy/Core/Shared/Airship";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ProtectedUtil } from "@Easy/Core/Shared/Util/ProtectedUtil";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class PartyModalPlayer extends AirshipBehaviour {
	public avatarImg: RawImage;
	public username: TMP_Text;
	public checkmark: GameObject;
	public button: Button;
	private invited = false;

	private bin = new Bin();

	public Init(username: string, uid: string): void {
		this.checkmark.SetActive(false);

		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(uid);
			this.avatarImg.texture = tex;
		});
		this.username.text = username;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.button.gameObject, (hov) => {
				if (hov === HoverState.ENTER) {
					ProtectedUtil.PlayHoverSound();
				}
			}),
		);

		this.bin.Add(
			this.button.onClick.Connect(async () => {
				if (this.invited) return;

				this.invited = true;
				ProtectedUtil.PlayClickSound();
				this.checkmark.SetActive(true);
				try {
					await client.party.inviteUser({ userToAdd: uid });
				} catch (err) {
					Debug.LogError(err);
					this.invited = false;
					this.checkmark.SetActive(false);
				}
			}),
		);
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
