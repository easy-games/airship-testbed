import { ChangeUsernameController } from "@Easy/Core/Client/ProtectedControllers/Social/ChangeUsernameController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class SettingsProfilePage extends AirshipBehaviour {
	@Header("References")
	public editUsernameBtn!: Button;
	public usernameLabel!: TMP_Text;
	public uploadProfileImageBtn!: Button;
	public removeProfileImageBtn!: Button;

	@Header("ProfilePicturePreviews")
	public profileImagePreview1!: RawImage;
	public profileImagePreview2!: RawImage;
	public profileImagePreview3!: RawImage;

	private bin = new Bin();

	override Start(): void {
		task.spawn(async () => {
			await this.UpdateProfilePicturePreviews();
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.editUsernameBtn.gameObject, () => {
				Dependency<ChangeUsernameController>().Open();
			}),
		);
	}

	public async UpdateProfilePicturePreviews(): Promise<void> {
		const texture = await Airship.players.GetProfilePictureTextureAsync(Game.localPlayer.userId);
		if (texture) {
			this.profileImagePreview1.texture = texture;
			this.profileImagePreview2.texture = texture;
			this.profileImagePreview3.texture = texture;
		} else {
			const defaultTexture = AssetCache.LoadAsset<Texture2D>(
				"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/DefaultProfilePicture.png",
			);
			this.profileImagePreview1.texture = defaultTexture;
			this.profileImagePreview2.texture = defaultTexture;
			this.profileImagePreview3.texture = defaultTexture;
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
