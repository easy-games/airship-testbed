import { RecommendedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/RecommendedFriendsController";
import FriendRecommendation from "@Easy/Core/Prefabs/UI/Modals/Components/FriendRecommendation";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import inspect from "@Easy/Core/Shared/Util/Inspect";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import AirshipButton from "../AirshipButton";

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
		const sortedRecommendations = Dependency<RecommendedFriendsController>().GetSortedRecommendations();
		this.recommendationsContent.ClearChildren();

		const hasRecommendations = sortedRecommendations.size() > 0;
		// Set "Recently played with:" and recommendation content visibility
		this.recommendationsContent.SetActive(hasRecommendations);
		this.recentlyPlayedWithText.SetActive(hasRecommendations);

		// Instantiate recommendation cards
		const maxDisplayRecommendations = 6;
		for (let i = 0; i < math.min(maxDisplayRecommendations, sortedRecommendations.size()); i++) {
			const rec = sortedRecommendations[i];
			// Check if card is displayable before parenting
			const cardObj = Object.Instantiate(this.recommendationCardPrefab);
			const card = cardObj.GetAirshipComponent<FriendRecommendation>()!;
			card.Setup(rec.uid, rec.recommendation.context)
				.then((setupSuccess) => {
					if (setupSuccess) {
						cardObj.transform.parent = this.recommendationsContent.transform;
						cardObj.transform.localScale = new Vector3(1, 1, 1); // Why is this necessary? Defaults to 0.5,0.5,0.5
					} else {
						print(
							"Failed to fetch recommended user: uid=" +
								rec.uid +
								" username=" +
								rec.recommendation.username,
						);
						Object.Destroy(cardObj);
					}
				})
				.catch((err) => {
					warn("Failed to setup recommendation card: " + inspect(err));
					Object.Destroy(cardObj);
				});
		}
	}

	public SendFriendRequest(): void {
		this.inputOutlineGO.SetActive(false);
		this.responseText.text = "";

		let username = this.inputField.text;
		if (username === "") return;

		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/friends/requests/self",
			json.encode({
				username,
			}),
		);
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
