import { ProximityPromptController } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPromptController";
import { Airship } from "../../Airship";
import { Dependency } from "../../Flamework";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
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

	override OnEnable(): void {
		this.SetPrimaryText(this.primaryText);
		this.SetSecondaryText(this.secondaryText);
		Dependency<ProximityPromptController>().RegisterProximityPrompt(this);

		Airship.input.CreateProximityPrompt("interact", this.transform, {
			primaryText: "Apple",
			secondaryText: "Pickup",
		});
	}

	override OnDisable(): void {
		Dependency<ProximityPromptController>().UnregisterProximityPrompt(this);
	}

	public SetCanActivate(canActivate: boolean) {
		if (this.canActivate === canActivate) return;
		this.canActivate = canActivate;
		if (canActivate) {
			this.activatedBin.Add(
				Airship.input.OnUp(this.actionName).Connect((event) => {
					if (event.uiProcessed) return;

					this.Activate();
				}),
			);
			this.onProximityEnter.Fire();
		} else {
			this.onProximityExit.Fire();
			this.activatedBin.Clean();
		}
	}

	public IsHighestPriorityPrompt(): boolean {
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
		this.canvas.enabled = false;
	}

	public Show(): void {
		this.canvas.enabled = true;

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
