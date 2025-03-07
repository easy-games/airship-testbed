import { ChangeUsernameController } from "@Easy/Core/Client/ProtectedControllers/Social/ChangeUsernameController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

interface ProfileManager {
	UploadProfilePictureYielding(previewImage: RawImage | undefined, ownerId: string): boolean;
	UploadProfilePictureMobileYielding(previewImage: RawImage | undefined, ownerId: string): boolean;
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
		if (Protected.User.localUser) {
			this.usernameLabel.text = Protected.User.localUser.username;
		}
		this.bin.Add(
			Protected.User.onLocalUserUpdated.Connect((user) => {
				this.usernameLabel.text = user.username;
			}),
		);

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
					let result: boolean;
					if (Game.IsMobile()) {
						result = ProfileManager.UploadProfilePictureMobileYielding(
							this.profileImagePreview1,
							Game.localPlayer.userId,
						);
					} else {
						result = ProfileManager.UploadProfilePictureYielding(
							this.profileImagePreview1,
							Game.localPlayer.userId,
						);
					}
					if (result) {
						Airship.Players.ClearProfilePictureCache(Game.localPlayer.userId);
						Protected.User.FetchLocalUser();
						await this.UpdateProfilePicturePreviews(false);
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
						Airship.Players.ClearProfilePictureCache(Game.localPlayer.userId);
						Protected.User.localUser!.profileImageId = undefined;
						this.UpdateProfilePicturePreviews(false);
					} else {
						Debug.LogError(res.error);
					}
				});
			}),
		);
	}

	/** Shouldn't use local cache if updating after a change */
	public async UpdateProfilePicturePreviews(useLocalCache = true): Promise<void> {
		const texture = await Airship.Players.GetProfilePictureAsync(Game.localPlayer.userId, useLocalCache);
		if (texture) {
			this.profileImagePreview1.texture = texture;
			this.profileImagePreview2.texture = texture;
			this.profileImagePreview3.texture = texture;
		} else {
			const defaultTexture = Airship.Players.GetDefaultProfilePictureFromUserId("");
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
