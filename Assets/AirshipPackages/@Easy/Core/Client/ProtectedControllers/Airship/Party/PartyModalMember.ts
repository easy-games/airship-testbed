import { Airship } from "@Easy/Core/Shared/Airship";
import { AirshipUser } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ProtectedUtil } from "@Easy/Core/Shared/Util/ProtectedUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

const onSelectedMemberChanged = new Signal();

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class PartyModalMember extends AirshipBehaviour {
	public avatarImage: RawImage;
	public kickBtn: Button;
	public kickBtnWrapper: GameObject;
	public usernameText: TMP_Text;
	public usernameWrapper: GameObject;
	public crown: GameObject;

	@NonSerialized() private user: AirshipUser;

	private bin = new Bin();
	private leaderBin = new Bin();

	public Init(user: AirshipUser): void {
		this.bin.Clean();

		this.transform.localScale = Vector3.one.mul(1.2);
		NativeTween.LocalScale(this.transform, Vector3.one, 0.18).SetEaseQuadOut();

		this.user = user;
		this.usernameText.text = user.username;
		task.spawn(async () => {
			const tex = await Airship.Players.GetProfilePictureAsync(user.uid, true, user.profileImageId);
			if (this.avatarImage) {
				this.avatarImage.texture = tex;
			}
		});

		this.kickBtn.gameObject.SetActive(false);
		this.usernameWrapper.SetActive(false);

		if (Game.IsMobile()) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(this.avatarImage.gameObject, () => {
					ProtectedUtil.PlayClickSound();
					onSelectedMemberChanged.Fire();
					this.kickBtn.gameObject.SetActive(true);
					this.usernameWrapper.SetActive(true);
				}),
			);

			this.bin.Add(
				onSelectedMemberChanged.Connect(() => {
					this.kickBtn.gameObject.SetActive(false);
					this.usernameWrapper.SetActive(false);
				}),
			);
		} else {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnHoverEvent(this.avatarImage.gameObject, (hov) => {
					this.kickBtn.gameObject.SetActive(hov === HoverState.ENTER);
					this.usernameWrapper.SetActive(hov === HoverState.ENTER);
				}),
			);
		}
	}

	public SetLeader(leader: boolean): void {
		this.leaderBin.Clean();

		if (leader) {
			this.kickBtnWrapper.SetActive(false);
			this.crown.SetActive(true);
			return;
		}
		this.kickBtnWrapper.SetActive(true);
		this.crown.SetActive(false);

		this.leaderBin.Add(
			this.kickBtn.onClick.Connect(async () => {
				await client.party.removeFromParty({ userToRemove: this.user.uid });
			}),
		);
	}

	public SetPartyLeader(leader: boolean): void {
		this.kickBtn.gameObject.SetActive(leader);
	}

	override Start(): void {}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
