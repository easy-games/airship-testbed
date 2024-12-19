import { ProximityPromptController } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPromptController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { CanvasAPI, PointerDirection } from "../../Util/CanvasAPI";
import { InputUtils } from "../../Util/InputUtils";
import { Signal } from "../../Util/Signal";
import { ActionInputType } from "../InputUtil";

export default class ProximityPrompt extends AirshipBehaviour {
	@Header("Config")
	@SerializeField()
	private objectText = "Key";
	public objectTextWrapper: GameObject;
	@SerializeField() public actionText = "Pick up";
	@Tooltip("The action name should match something created with Airship.input.CreateAction()")
	public actionName = "interact";
	@SerializeField() public maxRange = 5;
	@Tooltip("Makes the prompt clickable with mouse.")
	@SerializeField()
	public mouseRaycastTarget = false;
	@Tooltip("If true the prompt will only ever render where it was spawned (you are unable to move it). This is slightly faster in bulk.")
	public static = false;

	@Header("References")
	public canvas!: Canvas;
	public objectTextLabel!: TMP_Text;
	public actionTextLabel!: TMP_Text;
	public keybindTextLabel!: TMP_Text;
	public backgroundImg!: Image;
	public button!: Button;
	public touchIcon!: Image;

	@NonSerialized()
	public id!: number;

	/**
	 * On activated signal.
	 *
	 * This only works on the Client.
	 **/
	@NonSerialized() public onActivated = new Signal<void>();
	/**
	 * On entered proximity signal.
	 *
	 * This only works on the Client.
	 **/
	@NonSerialized() public onShown = new Signal<void>();

	/**
	 * On exited proximity signal.
	 *
	 * This only works on the Client.
	 **/
	@NonSerialized() public onHidden = new Signal<void>();

	private shownBin = new Bin();
	private bin = new Bin();
	private shown = false;
	/** Position on enable */
	private initialPosition: Vector3;

	override OnEnable(): void {
		this.initialPosition = this.transform.position;

		this.SetObjectText(this.objectText);
		this.SetActionText(this.actionText);
		if (Game.IsClient()) {
			task.unscaledDelay(0, () => {
				Dependency<ProximityPromptController>().RegisterProximityPrompt(this);
			});
		}

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				this.Activate();
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.button.gameObject, (dir, btn) => {
				if (dir === PointerDirection.DOWN) {
					this.KeyDown();
				} else {
					this.KeyUp();
				}
			}),
		);
		this.shown = true;
		this.Hide();
	}

	override OnDisable(): void {
		if (Game.IsClient()) {
			Dependency<ProximityPromptController>().UnregisterProximityPrompt(this);
		}
		this.shownBin.Clean();
		this.bin.Clean();
	}

	private KeyDown(): void {
		NativeTween.LocalScale(this.canvas.transform, Vector3.one.mul(0.008), 0.08).SetEaseQuadOut();
	}

	private KeyUp(): void {
		NativeTween.LocalScale(this.canvas.transform, Vector3.one.mul(0.01), 0.08).SetEaseQuadOut();
	}

	/**
	 * Use an empty string to not display an object text.
	 * @param val
	 * @returns
	 */
	public SetObjectText(val: string): void {
		(this.objectText as string) = val;

		if (val === "" || val === undefined) {
			this.objectTextWrapper.SetActive(false);
			return;
		} else {
			this.objectTextWrapper.SetActive(true);
		}

		this.objectTextLabel.text = val;
	}

	public SetActionText(val: string): void {
		(this.actionText as string) = val;
		this.actionTextLabel.text = val;
	}

	public SetMaxRange(val: number): void {
		(this.maxRange as number) = val;
	}

	/**
	 * Triggers the onActivated event on the prompt.
	 *
	 * Use this to manually trigger prompts using custom mechanics.
	 *
	 **/
	protected Activate(): void {
		this.onActivated.Fire();
	}

	protected Hide(instant?: boolean): void {
		if (!this.shown) return;
		this.shown = false;

		this.shownBin.Clean();
		if (instant) {
			this.canvas.transform.localScale = Vector3.zero;
			this.canvas.enabled = false;
		} else {
			const tween = NativeTween.LocalScale(this.canvas.transform, Vector3.zero, 0.18).SetEaseQuadOut();
			let interupt = false;
			this.shownBin.Add(() => {
				interupt = true;
				if (!tween.IsDestroyed()) {
					tween.Cancel();
				}
			});
			task.delay(0.18, () => {
				if (!interupt) {
					this.canvas.enabled = false;
				}
			});
		}
		this.onHidden.Fire();
	}

	protected Show(): void {
		if (this.shown) return;
		this.shown = true;
		this.shownBin.Clean();

		this.canvas.enabled = true;
		this.canvas.transform.localScale = Vector3.zero;
		NativeTween.LocalScale(this.canvas.transform, Vector3.one.mul(0.01), 0.18).SetEaseQuadOut();

		// for button
		this.backgroundImg.raycastTarget = Game.IsMobile() || this.mouseRaycastTarget;

		this.shownBin.Add(
			Airship.Input.OnUp(this.actionName).Connect((event) => {
				if (event.uiProcessed) return;

				this.KeyUp();
				this.Activate();
			}),
		);
		this.shownBin.Add(
			Airship.Input.OnDown(this.actionName).Connect((event) => {
				this.KeyDown();
			}),
		);
		this.onShown.Fire();

		task.spawn(() => {
			if (Game.IsMobile()) {
				this.keybindTextLabel.gameObject.SetActive(false);
				this.touchIcon.gameObject.SetActive(true);
			} else {
				this.keybindTextLabel.gameObject.SetActive(true);
				this.touchIcon.gameObject.SetActive(false);
				const action = Airship.Input.GetActionByInputType(this.actionName, ActionInputType.Keyboard);
				if (action && action.binding.config.isKeyBinding) {
					this.keybindTextLabel.text = InputUtils.GetStringForKeyCode(action.binding.config.key);
				} else {
					this.keybindTextLabel.text = "";
				}
			}
		});
	}

	public GetPosition() {
		if (this.static) return this.initialPosition;
		return this.transform.position;
	}

	public IsShown(): boolean {
		return this.shown;
	}
}
