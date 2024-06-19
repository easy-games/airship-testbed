import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { UserStatus, UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class PartyCard extends AirshipBehaviour {
	public layoutElement!: LayoutElement;
	public gameImage!: RawImage;
	public gameText!: TMP_Text;
	public gameArrow!: Image;
	public gameButton!: Button;

	private loadedGameImageId: string | undefined;
	private bin = new Bin();

	override Start(): void {
		this.layoutElement.preferredHeight = 84;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameButton.gameObject, (hov) => {
				this.gameArrow.transform
					.TweenAnchoredPositionX(hov === HoverState.ENTER ? -10 : -20, 0.5)
					.SetEaseBounceOut();
				// this.gameArrow.color = hov === HoverState.ENTER ? Theme.primary : Theme.white;
				// this.gameText.color = hov === HoverState.ENTER ? Theme.primary : Theme.white;
				// this.gameButton.GetComponent<Image>()!.color =
				// 	hov === HoverState.ENTER ? Theme.white : ColorUtil.HexToColor("191A1D");
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameButton.gameObject, () => {
				Dependency<TransferController>().TransferToPartyLeader();
			}),
		);
	}

	public SetLeaderStatus(userStatus: UserStatusData | undefined) {
		if (userStatus === undefined) {
			this.layoutElement.preferredHeight = 84;
			return;
		}

		this.layoutElement.preferredHeight = 124;
		if (userStatus.status !== UserStatus.IN_GAME) {
			this.layoutElement.preferredHeight = 84;
			return;
		}

		if (this.loadedGameImageId !== userStatus.game.icon) {
			this.loadedGameImageId = userStatus.game.icon;
			task.spawn(() => {
				const texture = Bridge.DownloadTexture2DYielding(`${AirshipUrl.CDN}/images/${userStatus.game.icon}`);
				if (texture) {
					this.gameImage.texture = texture;
				}
			});
		}
		this.gameText.text = `Playing ${userStatus.game.name}`;
	}

	override OnDestroy(): void {}
}
