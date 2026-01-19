import { Asset } from "@Easy/Core/Shared/Asset";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";

export default class TabListEntry extends AirshipBehaviour {
	public profileImg: RawImage;
	public username: TMP_Text;
	public platformImg: Image;
	private renderedUserId: string | undefined;

	public UpdateEntry(player: Player): void {
		let username = player.username;
		if (player === Game.localPlayer) {
			username = "<b>" + username + "</b>";
		}

		const team = player.team;
		if (team) {
			const hex = ColorUtil.ColorToHex(team.color);
			username = `<color=${hex}>${username}</color>`;
		}

		this.username.text = username;

		// Prevent spamming texture reloads
		if (this.renderedUserId !== player.userId) {
			this.renderedUserId = player.userId;
			task.spawn(async () => {
				const texture = await player.GetProfileImageTextureAsync();
				if (texture) {
					this.profileImg.texture = texture;
				}
			});
		}

		if (
			TabListEntry.GetDeviceTypeGroup(player.deviceType) !==
			TabListEntry.GetDeviceTypeGroup(Game.localPlayer.deviceType)
		) {
			this.platformImg.enabled = true;
			this.platformImg.sprite = TabListEntry.GetDeviceTypeSprite(player.deviceType);
		} else {
			this.platformImg.enabled = false;
		}
	}

	public static GetDeviceTypeSprite(deviceType: AirshipDeviceType): Sprite {
		let path = "Assets/AirshipPackages/@Easy/Core/Prefabs/Images/CoreIcons/";
		if (deviceType === AirshipDeviceType.Phone) {
			path += "phone.png";
		} else if (deviceType === AirshipDeviceType.Tablet) {
			path += "tablet.png";
		} else {
			path += "desktop.png";
		}
		path += ".sprite";
		return Asset.LoadAsset(path) as Sprite;
	}

	public static GetDeviceTypeGroup(deviceType: AirshipDeviceType): number {
		if (deviceType === AirshipDeviceType.Desktop) {
			return 1;
		}
		return 2;
	}
}
