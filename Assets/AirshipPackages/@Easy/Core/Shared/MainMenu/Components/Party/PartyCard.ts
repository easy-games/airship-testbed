import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { MainMenuPartyController } from "@Easy/Core/Client/ProtectedControllers/Social/MainMenuPartyController";
import { TransferController } from "@Easy/Core/Client/ProtectedControllers/Transfer/TransferController";
import { UserStatus, UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import FriendCard from "../Friends/FriendCard";

export default class PartyCard extends AirshipBehaviour {
	public layoutElement!: LayoutElement;
	public gameImage!: RawImage;
	public gameText!: TMP_Text;
	public gameArrow!: Image;
	public gameButton!: Button;
	public dropFriendHover!: GameObject;
	public warpButton!: Button;

	private loadedGameImageId: string | undefined;
	private bin = new Bin();

	override Start(): void {
		this.layoutElement.preferredHeight = 84;

		if (!Game.IsMobile()) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnHoverEvent(this.gameButton.gameObject, (hov) => {
					NativeTween.AnchoredPositionX(
						this.gameArrow.transform,
						hov === HoverState.ENTER ? -10 : -20,
						0.5,
					).SetEaseBounceOut();
					this.gameArrow.color = hov === HoverState.ENTER ? Theme.primary : Theme.white;
					this.gameText.color = hov === HoverState.ENTER ? Theme.primary : Theme.white;
					this.gameButton.GetComponent<Image>()!.color =
						hov === HoverState.ENTER ? Theme.white : ColorUtil.HexToColor("24242E");
				}),
			);
		}
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameButton.gameObject, () => {
				Dependency<TransferController>().TransferToPartyLeader();
			}),
		);
		this.bin.Add(
			this.gameButton.onClick.Connect((event) => {
				task.spawn(async () => {
					await Dependency<TransferController>().TransferPartyMembersToLeader();
				});
			}),
		);

		if (!Game.IsMobile()) {
			this.SetupDragFriendHooks();
		}
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
			const friendId = draggedObject.GetAirshipComponent<FriendCard>()?.friendId;
			if (friendId) {
				Dependency<ProtectedPartyController>().InviteToParty(friendId);
			}
		});
	}

	private SetFriendHoverState(hovering: boolean) {
		this.dropFriendHover.SetActive(hovering === true);
		// this.defaultContents.SetActive(hovering === false);
	}

	public UpdateInfo(userStatus: UserStatusData | undefined) {
		const party = Dependency<MainMenuPartyController>().party;
		const isLeader = party?.leader === Protected.user.localUser?.uid;

		this.warpButton.gameObject.SetActive(isLeader);

		if (userStatus === undefined) {
			this.layoutElement.preferredHeight = 84;
			this.layoutElement.gameObject.GetComponent<ImageWithRoundedCorners>()?.Refresh();
			return;
		}

		if (userStatus.status !== UserStatus.IN_GAME || !party || party.members.size() <= 1) {
			this.layoutElement.preferredHeight = 84;
			this.layoutElement.gameObject.GetComponent<ImageWithRoundedCorners>()?.Refresh();
			return;
		}

		this.layoutElement.preferredHeight = 124;
		this.layoutElement.gameObject.GetComponent<ImageWithRoundedCorners>()?.Refresh();

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
