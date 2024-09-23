import { ProtectedUserController } from "@Easy/Core/Client/ProtectedControllers/Airship/User/UserController";
import { ProtectedFriendsController } from "@Easy/Core/Client/ProtectedControllers/Social/FriendsController";
import { RecommendationContext } from "@Easy/Core/Client/ProtectedControllers/Social/RecommendedFriendsController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";

enum RecommendationState {
	/** Default -- has not interacted with recommendation */
	NONE,
	/** Accepted friend request (card will outline in green) */
	ACCEPTED,
}

export default class FriendRecommendation extends AirshipBehaviour {
	@Header("Config")
	@Tooltip("Color applied when hovering card")
	public outlineHoverColor!: Color;
	@Tooltip("This applies to outline and friend added button")
	public acceptedColor!: Color;

	@Header("Refs")
	public name!: TextMeshProUGUI;
	public context!: TextMeshProUGUI;
	public icon!: RawImage;
	public buttons!: GameObject;
	public addButton!: GameObject;
	public sentIcon!: GameObject;
	public outline!: UIOutline;

	private user?: PublicUser;
	private recommendationContext?: RecommendationContext;

	private state = RecommendationState.NONE;
	private bin = new Bin();

	public OnEnable(): void {}

	public OnDisable(): void {
		this.bin.Clean();
	}

	/**
	 * Sets up recommendation card.
	 *
	 * @param userId User to recommend.
	 * @returns True if card was setup successfully.
	 *
	 * @internal
	 */
	public async Setup(userId: string, context: RecommendationContext): Promise<boolean> {
		this.recommendationContext = context;
		this.context.text = this.GetRecommendationString(context);

		this.user = await Dependency<ProtectedUserController>().GetUserById(userId);
		if (!this.user) return false;

		Airship.Players.GetProfilePictureAsync(userId).then((tex) => {
			this.icon.texture = tex;
		});
		this.name.text = this.user.username;
		this.StartEventListeners();
		return true;
	}

	private GetRecommendationString(recommendationContext: RecommendationContext): string {
		if (recommendationContext.steamFriend) return "Steam friend (" + recommendationContext.steamFriend + ")";
		if (recommendationContext.partyEncounter) return "Partied together";
		if (recommendationContext.gameEncounters.size() > 0)
			return `From ${RandomUtil.FromArray(recommendationContext.gameEncounters).cachedName}`;
		return "";
	}

	private StartEventListeners() {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (this.state === RecommendationState.NONE) {
					// Enable/disable add button
					this.buttons.SetActive(hoverState === HoverState.ENTER);

					// Outline hover effect
					if (hoverState === HoverState.ENTER) {
						this.outline.color = this.outlineHoverColor;
						this.outline.gameObject.SetActive(true);
					} else {
						this.outline.gameObject.SetActive(false);
					}
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				this.AcceptRequest();
			}),
		);
	}

	private AcceptRequest() {
		if (!this.user) return;

		this.state = RecommendationState.ACCEPTED;

		this.outline.gameObject.SetActive(true);
		this.outline.color = this.acceptedColor;
		this.sentIcon.SetActive(true);
		this.addButton.SetActive(false);
		this.buttons.SetActive(true);

		Dependency<ProtectedUserController>()
			.GetUserById(this.user.uid)
			.andThen((res) => {
				if (!res) return;
				Dependency<ProtectedFriendsController>().SendFriendRequest(res.username);
			});
	}
}
