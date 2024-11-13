import { Team } from "../Team/Team";

export default class NametagComponent extends AirshipBehaviour {
	@SerializeField() protected teamImage: Image;
	@SerializeField() protected backgroundImage: Image;
	@SerializeField() protected nametagText: TMP_Text;
	@SerializeField() protected canvas: Canvas;
	@SerializeField() protected canvasGroup: CanvasGroup;

	public SetAlpha(alpha: number) {
		NativeTween.CanvasGroupAlpha(this.canvasGroup, alpha, 0.1).SetUseUnscaledTime(true);
	}

	public SetText(text: string) {
		this.nametagText.text = text;
	}

	public SetTextColor(color: Color) {
		this.nametagText.color = color;
	}

	public SetTeam(team: Team | undefined) {
		if (team) {
			this.teamImage.color = team.color;
			this.teamImage.enabled = true;
		} else {
			this.teamImage.enabled = false;
		}
	}
}
