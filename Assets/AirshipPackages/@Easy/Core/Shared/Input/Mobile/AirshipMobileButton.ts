import AirshipButton from "../../MainMenu/Components/AirshipButton";
import { Signal, SignalPriority } from "../../Util/Signal";

export default class AirshipMobileButton extends AirshipButton {
	/** The icon of this mobile button */
	@Header("Mobile Button")
	public iconImage: Image;
	private startingImageAlpha: number;
	private startingIconAlpha: number;

	@Header("Cooldown")
	public hasCooldown = false;
	public cooldownTime: number; // maximum/default cooldown time in seconds
	public progressFill: Image;
	public onCooldownEnded = new Signal<void>();
	private isOnCooldown = false;
	private lastUsedTime: number;

	private fadeIn = false;

	override Start(): void {
		super.Start();
		this.startingImageAlpha = this.image?.color.a ?? 1;
		this.startingIconAlpha = this.iconImage.color.a;

		this.bin.Add(
			this.button.onClick.ConnectWithPriority(SignalPriority.HIGHEST, () => {
				if (this.hasCooldown) {
					this.SetOnCooldown();
				}
			}),
		);
	}

	protected OnEnable(): void {
		if (this.fadeIn && this.image) {
			NativeTween.GraphicAlpha(this.iconImage, 1, 0.5).SetUseUnscaledTime(true);
		}
	}

	protected Update(dt: number): void {
		if (!this.hasCooldown) return;

		this.UpdateCooldownState();
	}

	public SetIconFromSprite(sprite: Sprite) {
		this.iconImage.sprite = sprite;
	}

	public SetIconFromTexture(texture: Texture2D) {
		this.iconImage.sprite = Bridge.MakeDefaultSprite(texture);
	}

	public FadeOut(duration: number = 0.5): void {
		this.fadeIn = false;
		if (this.image && this.iconImage) {
			NativeTween.GraphicAlpha(this.image, 0, duration).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.iconImage, 0, duration).SetUseUnscaledTime(true);
		}
	}

	public FadeIn(duration: number = 0.5): void {
		this.fadeIn = true;
		if (this.image && this.iconImage && this.startingImageAlpha && this.startingIconAlpha) {
			NativeTween.GraphicAlpha(this.image, this.startingImageAlpha, duration).SetUseUnscaledTime(true);
			NativeTween.GraphicAlpha(this.iconImage, this.startingIconAlpha, duration).SetUseUnscaledTime(true);
		}
	}

	private UpdateCooldownState() {
		if (!this.hasCooldown) return;
		if (!this.lastUsedTime) return;

		const isOnCooldown = this.lastUsedTime + this.cooldownTime >= Time.time;
		const hasStateChanged = isOnCooldown !== this.isOnCooldown;

		this.isOnCooldown = isOnCooldown;

		/** Set button off cooldown */
		if (!isOnCooldown) {
			this.button.enabled = true;
			this.progressFill.fillAmount = 0;

			if (hasStateChanged) {
				this.onCooldownEnded.Fire();
			}
		} else {
			/** Handle on cooldown */
			const remainingCooldownTime = math.clamp(Time.time - this.lastUsedTime, 0, this.cooldownTime);
			const cooldownPercent = 1 - remainingCooldownTime / this.cooldownTime;
			this.progressFill.fillAmount = cooldownPercent;

			this.button.enabled = false;
		}
	}

	/**
	 * Puts this button on cooldown.
	 * @param cooldownTime Amount of time before the button can be used again. Only use this for cases
	 * such as refunding partial cooldowns; This function defaults to setting the button on the cooldown
	 * time defined by this.cooldownTime
	 */
	public SetOnCooldown(cooldownTime?: number) {
		if (!this.hasCooldown) {
			warn("Attempt to set cooldown time on a button that does not have cooldowns enabled.");
			return;
		}
		if (cooldownTime && cooldownTime > this.cooldownTime) {
			warn("Attempt to set cooldown time higher than the maximum this.cooldownTime.");
			return;
		}
		if (cooldownTime && cooldownTime <= 0) {
			warn("Cooldown time must be a positive number.");
			return;
		}

		this.lastUsedTime = cooldownTime ? Time.time - (this.cooldownTime - cooldownTime) : Time.time;
	}

	/**
	 * Puts this button off cooldown
	 */
	public SetOffCooldown() {
		if (!this.hasCooldown) {
			warn("Attempt to set cooldown time on a button that does not have cooldowns enabled.");
			return;
		}

		this.lastUsedTime = Time.time - this.cooldownTime;
	}

	/**
	 * Sets the default/maximum cooldown for this button in seconds and enables/disables cooldowns as needed.
	 * If the in progress cooldown time is greater than cooldownTime, the cooldown will reset to 100% and
	 * tick down from the new cooldown time provided.
	 * @param cooldownTime New default/maximum cooldown for this button in seconds. Passing in a cooldownTime
	 * of 0 disables cooldowns, while any positive value enables cooldowns.
	 * */
	public SetCooldownTime(cooldownTime: number) {
		if (cooldownTime < 0) {
			warn("Cooldown time must be a positive number.");
			return;
		}

		if (cooldownTime === 0) {
			this.SetOffCooldown();
			this.hasCooldown = false;
			return;
		}

		this.hasCooldown = true;

		// Handle case where we set this.cooldownTime lower than the current in progress cooldown
		// e.g. Leveled up -> lower cooldowns, gained a CDR buff, etc.
		// We never want to have a 110%, 120% etc. cooldown, so we should clamp to 100% CD
		if (this.lastUsedTime && this.cooldownTime && cooldownTime < this.cooldownTime) {
			this.lastUsedTime = Time.time;
		}
		this.cooldownTime = cooldownTime;
	}

	/**
	 * Sets the lastUsedTime for this button, which is used to determine cooldowns. Only use this function
	 * if you have a distinct need to go forwards or backwards in time, e.g. in a predicted command
	 * system. Otherwise call SetOnCooldown at the moment of button use.
	 * @param lastUsedTime
	 */
	public SetLastUsedTime(lastUsedTime: number) {
		this.lastUsedTime = lastUsedTime;
	}

	OnDestroy(): void {
		this.bin.Clean();
	}
}
