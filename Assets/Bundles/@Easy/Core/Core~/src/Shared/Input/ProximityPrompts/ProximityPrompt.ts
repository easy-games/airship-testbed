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

	@Header("References")
	public canvas!: Canvas;
	public primaryTextLabel!: TMP_Text;
	public secondaryTextLabel!: TMP_Text;
	public keybindTextLabel!: TMP_Text;
	public backgroundImg!: Image;
	public button!: Button;

	@NonSerialized()
	public id!: number;

	/** On activated signal. */
	@NonSerialized() public onActivated = new Signal<void>();
	/** On entered proximity signal. */
	@NonSerialized() public onProximityEnter = new Signal<void>();
	/** On exited proximity signal. */
	@NonSerialized() public onProximityExit = new Signal<void>();

	private canActivate = false;
	private activatedBin = new Bin();
	private bin = new Bin();
	private stateChangeBin = new Bin();

	override OnEnable(): void {
		this.SetPrimaryText(this.primaryText);
		this.SetSecondaryText(this.secondaryText);
		if (Game.IsClient()) {
			Dependency<ProximityPromptController>().RegisterProximityPrompt(this);
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
	}

	override OnDisable(): void {
		if (Game.IsClient()) {
			Dependency<ProximityPromptController>().UnregisterProximityPrompt(this);
		}
		this.activatedBin.Clean();
		this.bin.Clean();
	}

	public KeyDown(): void {
		this.canvas.transform.TweenLocalScale(Vector3.one.mul(0.76), 0.08);
	}

	public KeyUp(): void {
		this.canvas.transform.TweenLocalScale(new Vector3(1, 1, 1), 0.08);
	}

	public SetCanActivate(canActivate: boolean) {
		if (this.canActivate === canActivate) return;
		this.canActivate = canActivate;
		if (canActivate) {
			this.activatedBin.Add(
				Airship.input.OnUp(this.actionName).Connect((event) => {
					if (event.uiProcessed) return;

					this.KeyUp();
					this.Activate();
				}),
			);
			this.activatedBin.Add(
				Airship.input.OnDown(this.actionName).Connect((event) => {
					this.KeyDown();
				}),
			);
			this.onProximityEnter.Fire();
		} else {
			this.onProximityExit.Fire();
			this.activatedBin.Clean();
		}
	}

	public IsHighestPriorityPrompt(): boolean {
		if (!Game.IsClient()) return false;

		let activatablePrompts = Dependency<ProximityPromptController>().activatableProximityPrompts;
		activatablePrompts = activatablePrompts.filter((p) => p.actionName === this.actionName);
		if (activatablePrompts.size() > 0 && activatablePrompts[0] === this) {
			return true;
		}
		return false;
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

	public Hide(): void {
		this.stateChangeBin.Clean();
		this.canvas.transform.TweenLocalScale(Vector3.zero, 0.18);
		let interupt = false;
		this.stateChangeBin.Add(() => {
			interupt = true;
		});
		task.delay(0.18, () => {
			if (!interupt) {
				this.canvas.enabled = false;
			}
		});
	}

	public Show(): void {
		this.stateChangeBin.Clean();
		this.canvas.enabled = true;
		this.canvas.transform.localScale = Vector3.zero;
		this.canvas.transform.TweenLocalScale(Vector3.one, 0.18);

		// for button
		this.backgroundImg.raycastTarget = Game.IsMobile();

		task.spawn(() => {
			if (Game.IsMobile()) {
				this.keybindTextLabel.text = "-";
			} else {
				const action = Airship.input.GetActionByInputType(this.actionName, ActionInputType.Keyboard);
				if (action && action.binding.config.isKeyBinding) {
					this.keybindTextLabel.text = InputUtils.GetStringForKeyCode(action.binding.config.key);
				} else {
					this.keybindTextLabel.text = "";
				}
			}
		});
	}
}
