import { ProximityPromptController } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPromptController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { CanvasAPI, HoverState, PointerDirection } from "../../Util/CanvasAPI";
import { InputUtils } from "../../Util/InputUtils";
import { Signal } from "../../Util/Signal";
import { ActionInputType } from "../InputUtil";
import MobileCameraMovement from "../../MainMenu/Components/Overlay/MobileCameraMovement";

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
	@Tooltip(
		"If true the prompt will only ever render where it was spawned (you are unable to move it). This is slightly faster in bulk.",
	)
	public static = false;
	@Tooltip(
		"If true this prompt can be activated at any time by having the activation key in the down state. This has no effect on mobile.",
	)
	public activateWhenDown = false;
	@Tooltip("If true the prompt will be hidden when a player is dead")
	public hideWhenDead = false;

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
	/**
	 * Used to manage Proximity Prompt culling. If a distance condition is provided
	 * its max range will be kept to the Proximity Prompt's max range + 10.
	 */
	@SerializeField()
	private canvasDistanceCondition?: CanvasDistanceCondition;

	private shownBin = new Bin();
	private bin = new Bin();
	private shown = false;
	/** Position on enable */
	private initialPosition: Vector3;
	private btnFocused = false;
	private btnDown = false;
	private mobileCamera: MobileCameraMovement | undefined;

	protected Awake(): void {
		if (this.canvasDistanceCondition) this.canvasDistanceCondition.maxDistance = this.maxRange + 10;
		// `activateWhenDown` is for quickly activating prompts while a key is down, and is not applicable
		// to mobile.
		if (Game.IsMobile()) {
			this.activateWhenDown = false;
			this.mobileCamera = Airship.Input.GetMobileCameraMovement();
		}
	}

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
			CanvasAPI.OnPointerEvent(this.button.gameObject, (dir, btn) => {
				if (dir === PointerDirection.DOWN) {
					this.KeyDown();
				} else {
					this.KeyUp();
				}
			}),
		);
		this.shown = true;
		this.Hide(true);
	}

	override OnDisable(): void {
		if (Game.IsClient()) {
			Dependency<ProximityPromptController>().UnregisterProximityPrompt(this);
		}
		this.shownBin.Clean();
		this.bin.Clean();
	}

	private KeyDown(): void {
		this.btnDown = true;
		NativeTween.LocalScale(this.transform, Vector3.one.mul(0.8), 0.08).SetEaseQuadOut();
	}

	private KeyUp(): void {
		this.btnDown = false;
		NativeTween.LocalScale(this.transform, Vector3.one, 0.08).SetEaseQuadOut();
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

	public GetObjectText() {
		return this.objectText;
	}

	public SetActionText(val: string): void {
		(this.actionText as string) = val;
		this.actionTextLabel.text = val;
	}

	public SetMaxRange(val: number): void {
		(this.maxRange as number) = val;
		if (this.canvasDistanceCondition) this.canvasDistanceCondition.maxDistance = val + 10;
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
		if (this.gameObject.IsDestroyed()) return;
		if (!this.shown && !instant) return;

		this.shown = false;

		if (Game.IsMobile()) {
			//Don't actually hide until we aren't interacting with the prompt anymore
			let infStart = Time.time;
			while (this.btnDown && Time.time - infStart < 5) {
				task.wait();
			}

			//If it was shown again since starting the wait we shouldn't animate out.
			if (this.shown) {
				return;
			}
		}

		this.shownBin.Clean();
		if (instant) {
			this.transform.localScale = Vector3.zero;
			this.canvas.enabled = false;
		} else {
			const tween = NativeTween.LocalScale(this.transform, Vector3.zero, 0.18).SetEaseQuadOut();
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
		this.transform.localScale = Vector3.zero;
		NativeTween.LocalScale(this.transform, Vector3.one, 0.18).SetEaseQuadOut();

		// for button
		this.backgroundImg.raycastTarget = Game.IsMobile() || this.mouseRaycastTarget;

		if (Game.IsMobile()) {
			this.backgroundImg.transform.localScale = new Vector3(2, 2, 2);
			this.canvas.worldCamera = Camera.main;
		}

		this.shownBin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.backgroundImg.gameObject, (pointerDirection, button) => {
				if (pointerDirection === PointerDirection.DOWN) {
					if (this.activateWhenDown && this.btnFocused) {
						this.Activate();
					}
					this.KeyDown();
				} else {
					if (!this.activateWhenDown && this.btnFocused) {
						this.Activate();
					}
					this.KeyUp();
				}
			}),
		);

		this.shownBin.AddEngineEventConnection(
			CanvasAPI.OnDragEvent(this.backgroundImg.gameObject, (data) => {
				if (this.mobileCamera && this.btnDown && !this.btnFocused) {
					//Drag camera instead of interact with prompt
					this.mobileCamera.DragEvent(data);
				}
			}),
		);

		this.shownBin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.backgroundImg.gameObject, (hoverState, data) => {
				this.btnFocused = hoverState === HoverState.ENTER;

				//If we originally clicked on the prompt
				if (this.mobileCamera && this.btnDown) {
					if (this.btnFocused) {
						//Stop dragging camera
						this.mobileCamera.EndDragEvent(data.pointerId);
					} else {
						//Drag camera
						this.mobileCamera.BeginDragEvent(data);
					}
				}
			}),
		);

		this.shownBin.Add(
			Airship.Input.OnUp(this.actionName).Connect((event) => {
				if (event.uiProcessed) return;

				this.KeyUp();
				if (!this.activateWhenDown) {
					this.Activate();
				}
			}),
		);
		this.shownBin.Add(
			Airship.Input.OnDown(this.actionName).Connect((event) => {
				this.KeyDown();
				if (this.activateWhenDown) {
					this.Activate();
				}
			}),
		);

		this.onShown.Fire();

		//Is the key already pressed down when the character walks in range
		if (this.activateWhenDown && Airship.Input.IsDown(this.actionName)) {
			this.Activate();
		}

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
