﻿import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { Task } from "../Util/Task";

export interface ProgressBarOptions {
	initialPercentDelta?: number;
	fillColor?: Color;
	deathOnZero?: boolean;
}

export class Healthbar {
	private readonly transformKey = "Transforms";
	private readonly graphicsKey = "Graphics";
	private readonly animKey = "Animations";
	public transform: RectTransform;
	private refs: GameObjectReferences;
	private fillImage: Image;
	private fillTransform: RectTransform;
	private changeFillTransform: RectTransform;
	private growthFillTransform: RectTransform;
	private graphicsHolder: RectTransform;
	private brokenGraphicsHolder: RectTransform;
	private deathAnim: Animation;

	public fillDurationInSeconds = 0.08;
	public changeDelayInSeconds = 0.25;
	public changeDurationInSeconds = 0.09;
	private enabled = true;
	public deathOnZero = true;
	private currentDelta = -999;

	constructor(transform: Transform, options?: ProgressBarOptions) {
		this.transform = transform.gameObject.GetComponent<RectTransform>()!;
		this.refs = transform.GetComponent<GameObjectReferences>()!;
		this.fillImage = this.refs.GetValue<Image>(this.graphicsKey, "Fill");
		this.fillTransform = this.refs.GetValue<RectTransform>(this.transformKey, "Fill");
		this.changeFillTransform = this.refs.GetValue<RectTransform>(this.transformKey, "ChangeFill");
		this.growthFillTransform = this.refs.GetValue<RectTransform>(this.transformKey, "GrowthFill");
		this.graphicsHolder = this.refs.GetValue<RectTransform>(this.transformKey, "GraphicsHolder");
		this.brokenGraphicsHolder = this.refs.GetValue<RectTransform>(this.transformKey, "BrokenGraphicsHolder");
		this.deathAnim = this.refs.GetValue<Animation>(this.animKey, "Finished");

		this.graphicsHolder.gameObject.SetActive(true);
		this.brokenGraphicsHolder.gameObject.SetActive(false);
		this.growthFillTransform.gameObject.SetActive(false);

		this.deathOnZero = options?.deathOnZero ?? true;

		if (options?.fillColor) {
			this.SetColor(options.fillColor);
		}
		this.InstantlySetValue(options?.initialPercentDelta ?? 1);
		this.enabled = true;
	}

	public SetActive(visible: boolean) {
		this.transform.gameObject.active = visible;
	}

	public SetColor(newColor: Color) {
		this.fillImage.color = newColor;
	}

	public InstantlySetValue(percentDelta: number) {
		this.currentDelta = percentDelta;
		let fillScale = new Vector3(percentDelta, this.fillTransform.localScale.y, this.fillTransform.localScale.z);
		this.fillTransform.localScale = fillScale;
		this.changeFillTransform.localScale = fillScale;
	}

	public SetValue(percentDelta: number) {
		if (this.currentDelta === percentDelta) {
			return;
		}

		if (this.deathOnZero && percentDelta <= 0) {
			//Wait for the change animation
			Task.Delay(this.fillDurationInSeconds, () => {
				if (this.transform) {
					//Play the death animation
					this.deathAnim.Play();
					this.graphicsHolder.gameObject.SetActive(false);
					this.brokenGraphicsHolder.gameObject.SetActive(true);
					Task.Delay(1.1, () => {
						if (this.transform && this.currentDelta > 0) {
							//Reset if the progress has filled back up (Respawn)
							this.SetValue(this.currentDelta);
						}
					});
				}
			});
		} else {
			this.deathAnim.Stop();
			this.graphicsHolder.gameObject.SetActive(true);
			this.brokenGraphicsHolder.gameObject.SetActive(false);
		}

		//Animate fill down
		this.fillTransform.TweenLocalScaleX(percentDelta, this.fillDurationInSeconds);

		if (percentDelta > this.currentDelta) {
			//Growth
			this.changeFillTransform.gameObject.SetActive(false);
			this.growthFillTransform.gameObject.SetActive(true);
			this.growthFillTransform.localScale = new Vector3(
				percentDelta - this.currentDelta,
				this.growthFillTransform.localScale.y,
				this.growthFillTransform.localScale.z,
			);
			this.growthFillTransform.anchoredPosition = new Vector2(
				this.transform.rect.width * this.currentDelta,
				this.growthFillTransform.anchoredPosition.y,
			);

			this.growthFillTransform.TweenLocalScaleX(0, this.fillDurationInSeconds);
			this.growthFillTransform.TweenAnchoredPositionX(
				this.transform.rect.width * percentDelta,
				this.changeDurationInSeconds,
			);
		} else {
			//Decay
			this.growthFillTransform.gameObject.SetActive(false);
			this.changeFillTransform.gameObject.SetActive(true);

			//Hold then animate change indicator
			Task.Delay(this.changeDelayInSeconds, () => {
				if (!this.enabled) return;
				this.changeFillTransform.TweenLocalScaleX(percentDelta, this.changeDurationInSeconds);
			});
		}

		this.currentDelta = percentDelta;
	}

	public Destroy(): void {
		this.fillTransform.TweenCancelAll(false, true);
		this.changeFillTransform.TweenCancelAll(false, true);
		this.enabled = false;
		GameObjectUtil.Destroy(this.refs.gameObject);
	}
}
