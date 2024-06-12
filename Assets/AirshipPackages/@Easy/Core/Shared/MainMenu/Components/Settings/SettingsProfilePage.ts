import { ChangeUsernameController } from "@Easy/Core/Client/ProtectedControllers/Social/ChangeUsernameController";
import { UserController } from "@Easy/Core/Client/ProtectedControllers/User/UserController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

interface ProfileManager {
	UploadProfilePictureYielding(previewImage: RawImage | undefined, ownerId: string): boolean;
}
declare const ProfileManager: ProfileManager;

export default class SettingsProfilePage extends AirshipBehaviour {
	@Header("References")
	public editUsernameBtn!: Button;
	public usernameLabel!: TMP_Text;
	public uploadProfileImageBtn!: Button;
	public removeProfileImageBtn!: Button;
	public previewWrapper!: RectTransform;
	public profilePictureSpinnerWrapper!: RectTransform;

	@Header("ProfilePicturePreviews")
	public profileImagePreview1!: RawImage;
	public profileImagePreview2!: RawImage;
	public profileImagePreview3!: RawImage;

	private bin = new Bin();

	override Start(): void {
		this.SetProfilePictureLoading(false);
		task.spawn(async () => {
			await this.UpdateProfilePicturePreviews();
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.editUsernameBtn.gameObject, () => {
				Dependency<ChangeUsernameController>().Open();
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.uploadProfileImageBtn.gameObject, () => {
				task.spawn(async () => {
					this.SetProfilePictureLoading(true);
					const result = ProfileManager.UploadProfilePictureYielding(
						this.profileImagePreview1,
						Game.localPlayer.userId,
					);
					if (result) {
						Airship.players.ClearProfilePictureCache(Game.localPlayer.userId);
						Protected.user.FetchLocalUser();
						await this.UpdateProfilePicturePreviews();
					}
					this.SetProfilePictureLoading(false);
				});
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.removeProfileImageBtn.gameObject, () => {
				task.spawn(() => {
					const res = InternalHttpManager.PatchAsync(
						AirshipUrl.GameCoordinator + "/users",
						json.encode({
							profileImageId: "",
						}),
					);
					if (res.success) {
						Airship.players.ClearProfilePictureCache(Game.localPlayer.userId);
						Dependency<UserController>().localUser!.profileImageId = undefined;
						this.UpdateProfilePicturePreviews();
					} else {
						Debug.LogError(res.error);
					}
				});
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

	public SetProfilePictureLoading(val: boolean) {
		this.previewWrapper.gameObject.SetActive(!val);
		this.profilePictureSpinnerWrapper.gameObject.SetActive(val);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
