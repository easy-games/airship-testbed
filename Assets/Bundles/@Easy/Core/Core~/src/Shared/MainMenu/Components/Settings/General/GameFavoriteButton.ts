import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";

export default class GameFavoriteButton extends AirshipBehaviour {
	@Header("References")
	public image!: Image;
	public text!: TMP_Text;
	public startPrefab!: GameObject;

	@Header("Variables")
	public particleCount = 4;
	public particleVelBase = new Vector3(0.6, 0.6, 0);
	public particleVelRandomized = new Vector3(0.8, 0.8, 0);
	public particleDrag = 4;

	private bin = new Bin();
	private favorited = false;
	private favoriteCount = 20;
	private rectTransform!: RectTransform;

	public Awake(): void {
		this.rectTransform = this.gameObject.GetComponent<RectTransform>();
	}

	override Start(): void {
		const hoverColor = new Color(1, 1, 1, 0.5);
		const favoritedColor = ColorUtil.HexToColor("FFE15A");
		const regularColor = new Color(1, 1, 1, 0.3);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (this.favorited) return;
				if (hoverState === HoverState.ENTER) {
					this.image.color = hoverColor;
					this.text.color = hoverColor;
				} else {
					this.image.color = regularColor;
					this.image.color = regularColor;
				}
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.gameObject, () => {
				this.favorited = !this.favorited;

				if (this.favorited) {
					this.image.color = favoritedColor;
					this.text.color = favoritedColor;

					this.favoriteCount++;
					this.text.text = this.favoriteCount + "";

					for (let i = 0; i < this.particleCount; i++) {
						this.SpawnParticle();
					}
				} else {
					this.image.color = hoverColor;
					this.text.color = hoverColor;

					this.favoriteCount--;
					this.text.text = this.favoriteCount + "";
				}
			}),
		);
	}

	private SpawnParticle(): void {
		const go = Object.Instantiate(this.startPrefab, this.gameObject.transform.parent!);
		const rect = go.GetComponent<RectTransform>();
		rect.anchoredPosition = this.rectTransform.anchoredPosition;

		let vel = new Vector2(
			(math.random() * 2 - 1) * this.particleVelRandomized.x,
			math.random() * this.particleVelRandomized.y + this.particleVelBase.y,
		);
		if (vel.x < 0) {
			vel = vel.sub(new Vector2(this.particleVelBase.x, 0));
		} else {
			vel = vel.add(new Vector2(this.particleVelBase.x, 0));
		}
		const bin = new Bin();
		task.spawn(() => {
			const updateConn = OnUpdate.Connect((dt) => {
				vel = vel.mul(1 - dt * this.particleDrag);
				rect.anchoredPosition = rect.anchoredPosition.add(vel);

				if (vel.magnitude <= 0.12) {
					bin.Clean();
				}
			});
			bin.Add(() => {
				const img = go.GetComponent<Image>();
				img.TweenGraphicAlpha(0, math.random() * 0.3 + 0.2).SetEase(EaseType.QuadOut);
				task.delay(0.5, () => {
					updateConn();
					Object.Destroy(go);
				});
			});
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
