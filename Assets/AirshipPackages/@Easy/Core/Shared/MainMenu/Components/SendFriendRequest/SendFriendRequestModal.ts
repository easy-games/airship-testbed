import { ProtectedUserController } from "@Easy/Core/Client/ProtectedControllers/Airship/User/UserController";
import { RecommendedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/RecommendedFriendsController";
import FriendRecommendation from "@Easy/Core/Prefabs/UI/Modals/Components/FriendRecommendation";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import AirshipButton from "../AirshipButton";
import { HttpRetry } from "@Easy/Core/Shared/Http/HttpRetry";

export default class SendFriendRequestModal extends AirshipBehaviour {
	public inputField!: TMP_InputField;
	public sendButton!: Button;
	public responseText!: TMP_Text;
	public inputOutlineGO!: GameObject;
	public recentlyPlayedWithText!: GameObject;
	public recommendationsContent!: GameObject;
	public recommendationCardPrefab!: GameObject;

	private bin = new Bin();

	override Start(): void {
		this.responseText.text = "";

		const sendButtonComp = this.sendButton.gameObject.GetAirshipComponent<AirshipButton>()!;
		Keyboard.OnKeyDown(Key.Enter, (event) => {
			sendButtonComp.PlayMouseDownEffect();
			if (EventSystem.current.currentSelectedGameObject === this.inputField.gameObject) {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}
		});
		Keyboard.OnKeyUp(Key.Enter, (event) => {
			sendButtonComp.PlayMouseUpEffect();
		});

		task.unscaledDelay(0, () => {
			this.inputField.Select();
		});

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.sendButton.gameObject, () => {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnSubmitEvent(this.inputField.gameObject, () => {
				task.spawn(() => {
					this.SendFriendRequest();
				});
			}),
		);
		this.LoadRecommendations();
	}

	private async LoadRecommendations() {
		this.recommendationsContent.ClearChildren();
		const sortedRecommendations = Dependency<RecommendedFriendsController>().GetSortedRecommendations();

		const hasRecommendations = sortedRecommendations.size() > 0;
		// Set "Recently played with:" and recommendation content visibility
		this.recommendationsContent.SetActive(false);
		this.recentlyPlayedWithText.SetActive(false);

		// Instantiate recommendation cards
		let remainingRecommendations = 8;
		let successfulRecommendations = 0;
		for (let i = 0; i < sortedRecommendations.size() && remainingRecommendations > 0; i++) {
			successfulRecommendations++;
			const rec = sortedRecommendations[i];

			Dependency<ProtectedUserController>().GetUserById(rec.uid).then((user) => {
				if (!user) {
					Dependency<RecommendedFriendsController>().DeleteRecommendation(rec.uid);
					return;
				}

				if (!this.recentlyPlayedWithText.activeInHierarchy) {
					this.recentlyPlayedWithText.SetActive(true);
					this.recommendationsContent.SetActive(true);
					NativeTween.GraphicAlpha(this.recentlyPlayedWithText, 1, 0.06).SetUseUnscaledTime(true);
				}

				const cardObj = Object.Instantiate(this.recommendationCardPrefab, this.recommendationsContent.transform);
				const card = cardObj.GetAirshipComponent<FriendRecommendation>()!;
				card.Setup(user, rec.recommendation.context);
				
				cardObj.transform.parent = this.recommendationsContent.transform;
				cardObj.transform.localScale = new Vector3(1, 1, 1); // Why is this necessary? Defaults to 0.5,0.5,0.5
				cardObj.transform.localScale = Vector3.zero;
				cardObj.GetComponent<CanvasGroup>()!.alpha = 0;
				NativeTween.CanvasGroupAlpha(cardObj, 1, 0.06).SetUseUnscaledTime(true);
				NativeTween.LocalScale(cardObj, Vector3.one, 0.06).SetUseUnscaledTime(true);
			});
			remainingRecommendations--;
		}
	}

	public SendFriendRequest(): void {
		this.inputOutlineGO.SetActive(false);
		this.responseText.text = "";

		let username = this.inputField.text;
		if (username === "") return;

		const res = HttpRetry(
			() => InternalHttpManager.PostAsync(
				AirshipUrl.GameCoordinator + "/friends/requests/self",
				json.encode({
					username,
				}),
			),
			"post/game-coordinator/friends/requests/self",
		).expect();
		if (!res.success) {
			if (res.statusCode === 422) {
				this.responseText.text = `Player "${username}\" does not exist.`;
			} else {
				this.responseText.text = "Failed to send friend requst. Please try again later.";
			}
			this.responseText.color = Theme.red;
			task.unscaledDelay(0, () => {
				this.inputField.Select();
			});
			return;
		}

		this.responseText.text = `Done! You sent a friend request to <b>${username}</b>`;
		this.responseText.color = ColorUtil.HexToColor("#3BE267");
		this.inputOutlineGO.SetActive(true);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
