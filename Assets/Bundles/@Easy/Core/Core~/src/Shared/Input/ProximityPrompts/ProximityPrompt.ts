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
	private primaryText = "Apple";
	@SerializeField() public secondaryText = "Pickup";
	@Tooltip("The action name should match something created with Airship.input.CreateAction()")
	public actionName = "interact";
	@SerializeField() public maxRange = 5;
	@Tooltip("Makes the prompt clickable with mouse.")
	@SerializeField()
	public mouseRaycastTarget = false;

	@Header("References")
	public canvas!: Canvas;
	public primaryTextLabel!: TMP_Text;
	public secondaryTextLabel!: TMP_Text;
	public keybindTextLabel!: TMP_Text;
	public backgroundImg!: Image;
	public button!: Button;
	public touchIcon!: Image;

	@NonSerialized()
	public id!: number;

	/** On activated signal. */
	@NonSerialized() public onActivated = new Signal<void>();
	/** On entered proximity signal. */
	@NonSerialized() public onShown = new Signal<void>();
	/** On exited proximity signal. */
	@NonSerialized() public onHidden = new Signal<void>();

	private shownBin = new Bin();
	private bin = new Bin();
	private shown = false;

	override OnEnable(): void {
		this.SetPrimaryText(this.primaryText);
		this.SetSecondaryText(this.secondaryText);
		if (Game.IsClient()) {
			task.delay(0, () => {
				Dependency<ProximityPromptController>().RegisterProximityPrompt(this);
			});
		}

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.button.gameObject, () => {
				print("clicked!");
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

	public KeyDown(): void {
		this.canvas.transform.TweenLocalScale(Vector3.one.mul(0.8), 0.08).SetEaseQuadOut();
	}

	public KeyUp(): void {
		this.canvas.transform.TweenLocalScale(new Vector3(1, 1, 1), 0.08).SetEaseQuadOut();
	}

	public SetPrimaryText(val: string): void {
		(this.primaryText as string) = val;
		this.primaryTextLabel.text = val;
	}

	public SetSecondaryText(val: string): void {
		val = val.upper();
		(this.secondaryText as string) = val;
		this.secondaryTextLabel.text = val;
	}

	public SetMaxRange(val: number): void {
		(this.maxRange as number) = val;
	}

	/** Called when prompt activates. */
	public Activate(): void {
		this.onActivated.Fire();
	}

	public Hide(instant?: boolean): void {
		if (!this.shown) return;
		this.shown = false;

		this.shownBin.Clean();
		if (instant) {
			this.canvas.transform.localScale = Vector3.zero;
			this.canvas.enabled = false;
		} else {
			this.canvas.transform.TweenLocalScale(Vector3.zero, 0.18).SetEaseQuadOut();
			let interupt = false;
			this.shownBin.Add(() => {
				interupt = true;
			});
			task.delay(0.18, () => {
				if (!interupt) {
					this.canvas.enabled = false;
				}
			});
		}
		this.onHidden.Fire();
	}

	public Show(): void {
		if (this.shown) return;
		this.shown = true;

		this.canvas.enabled = true;
		this.canvas.transform.localScale = Vector3.zero;
		this.canvas.transform.TweenLocalScale(Vector3.one, 0.18).SetEaseQuadOut();

		// for button
		this.backgroundImg.raycastTarget = Game.IsMobile() || this.mouseRaycastTarget;

		this.shownBin.Add(
			Airship.input.OnUp(this.actionName).Connect((event) => {
				if (event.uiProcessed) return;

				this.KeyUp();
				this.Activate();
			}),
		);
		this.shownBin.Add(
			Airship.input.OnDown(this.actionName).Connect((event) => {
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
				const action = Airship.input.GetActionByInputType(this.actionName, ActionInputType.Keyboard);
				if (action && action.binding.config.isKeyBinding) {
					this.keybindTextLabel.text = InputUtils.GetStringForKeyCode(action.binding.config.key);
				} else {
					this.keybindTextLabel.text = "";
				}
			}
		});
	}

	public IsShown(): boolean {
		return this.shown;
	}
}
