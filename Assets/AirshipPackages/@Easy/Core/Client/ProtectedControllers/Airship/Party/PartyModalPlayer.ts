import { Airship } from "@Easy/Core/Shared/Airship";
import { Player } from "@Easy/Core/Shared/Player/Player";
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

	private bin = new Bin();

	public Init(player: Player): void {
		this.checkmark.SetActive(false);

		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(player.userId);
			this.avatarImg.texture = tex;
		});
		this.username.text = player.username;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.button.gameObject, (hov) => {
				if (hov === HoverState.ENTER) {
					ProtectedUtil.PlayHoverSound();
				}
			}),
		);

		this.bin.Add(
			this.button.onClick.Connect(async () => {
				ProtectedUtil.PlayClickSound();
				this.checkmark.SetActive(true);
				await client.party.inviteUser({ userToAdd: player.userId });
			}),
		);
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
