import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { SearchResultDto } from "./SearchAPI";

export default class SearchResult extends AirshipBehaviour {
	public submitButton!: GameObject;
	public bgImage!: Image;

	protected bin = new Bin();
	public active = false;

	@NonSerialized()
	public searchResult!: SearchResultDto;

	override Start(): void {
		this.active = false;
	}

	public OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (hoverState === HoverState.ENTER) {
					this.bgImage.color = new Color(1, 1, 1, 0.1);
					this.submitButton.SetActive(true);
				} else {
					if (this.active) return;
					this.bgImage.color = new Color(1, 1, 1, 0);
					this.submitButton.SetActive(false);
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				this.OnSubmit();
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.submitButton, () => {
				this.OnSubmit();
			}),
		);

		this.submitButton.SetActive(false);
	}

	protected MarkAsLoading(): void {
		this.submitButton.transform.GetChild(0).gameObject.SetActive(false);
		this.submitButton.transform.GetChild(1).gameObject.SetActive(false);
		this.submitButton.transform.GetChild(2).gameObject.SetActive(true);
	}

	public OnSubmit(): void {}

	public Init(searchResult: SearchResultDto): void {
		this.searchResult = searchResult;
	}

	public SetActive(active: boolean): void {
		this.active = active;
		if (!Game.IsMobile()) {
			if (active) {
				this.bgImage.color = new Color(1, 1, 1, 0.1);
				this.submitButton.SetActive(true);
			} else {
				this.bgImage.color = new Color(1, 1, 1, 0);
				this.submitButton.SetActive(false);
			}
		}
	}

	public OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
