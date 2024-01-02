import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { ChargingAbilityEndedState } from "Shared/Abilities/Ability";
import { Game } from "Shared/Game";
import { Healthbar } from "Shared/UI/Healthbar";
import { Bin } from "Shared/Util/Bin";
import { InputUtils } from "Shared/Util/InputUtils";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { OnUpdate } from "Shared/Util/Timer";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilityBindingController } from "./AbilityBindingController";

export interface ClientAbilityCooldownState {
	startTime: number;
	length: number;
	endTime: number;
}

export interface ClientAbilityState {
	name: string;
	icon: string | undefined;
	charges: number | undefined;
	keybinding: KeyCode | undefined;
	cooldown?: ClientAbilityCooldownState;
	active: boolean;
	charging?: boolean;
}

const ACTIVE_TWEEN_TIME = 0.1;

@Controller()
export class AbilityUIController implements OnStart {
	private abilitySlots = 9;

	private canvas: Canvas;
	private abilitiesRefs: GameObjectReferences;
	private abilitybarContent: Transform;
	private castbar: Healthbar;
	private castbarText: TMP_Text;

	public constructor(
		public readonly coreUIController: CoreUIController,
		public readonly abilityBindingController: AbilityBindingController,
	) {
		const go = this.coreUIController.Refs.GetValue("Apps", "Abilities");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true; // Enable if using abilities

		this.abilitiesRefs = go.GetComponent<GameObjectReferences>();
		this.abilitybarContent = this.abilitiesRefs.GetValue("UI", "AbilityBarContentGO").transform;
		this.castbar = new Healthbar(this.abilitiesRefs.GetValue("UI", "CastBarTransform"), {
			fillColor: new Color(0 / 255, 150 / 255, 255 / 255),
			deathOnZero: false,
		});
		this.castbarText = this.abilitiesRefs.GetValue("UI", "CastBarText");

		this.castbar.SetActive(false);
	}

	private slotCooldowns = new Map<number, () => void>();

	private UpdateAbilityBarSlot(
		slotIdx: number,
		nextState: ClientAbilityState | undefined,
		prevState: ClientAbilityState | undefined,
	) {
		if (slotIdx >= this.abilitySlots) {
			warn("Attempting to set slot", slotIdx, "with", inspect(nextState));
			return;
		}

		const child = this.abilitybarContent.GetChild(slotIdx);
		if (!child) {
			warn("Could not update ability bar at slot index ", slotIdx);
			return;
		}

		const go = child.gameObject;
		const contentGO = go.transform.GetChild(0)?.gameObject;
		if (!contentGO) {
			warn("Could not update child of slot index", slotIdx);
			return;
		}

		contentGO.gameObject.SetActive(nextState !== undefined);
		if (nextState !== undefined) {
			// Update slot metadata
			const refs = go.GetComponent<GameObjectReferences>();
			const contentRect = refs.GetValue<RectTransform>("UI", "ContentRect");
			const image = refs.GetValue<Image>("UI", "Image");
			const amount = refs.GetValue<TMP_Text>("UI", "Charges");
			const name = refs.GetValue<TMP_Text>("UI", "Name");
			const keybinding = refs.GetValue<TMP_Text>("UI", "Keybinding");

			const cooldown = refs.GetValue<GameObject>("UI", "Cooldown");
			const cooldownText = refs.GetValue<TMP_Text>("UI", "CooldownText");
			const cooldownTickImage = refs.GetValue<Image>("UI", "CooldownTickImage");

			if (!prevState?.active && nextState.active) {
				contentRect.TweenLocalScale(new Vector3(0.9, 0.9, 0.9), ACTIVE_TWEEN_TIME);
				contentRect.TweenGraphicAlpha(0.8, ACTIVE_TWEEN_TIME);
			} else if (prevState?.active && !nextState.active) {
				contentRect.TweenLocalScale(new Vector3(1, 1, 1), ACTIVE_TWEEN_TIME);
				contentRect.TweenGraphicAlpha(1, ACTIVE_TWEEN_TIME);
			}

			const clearSlotCooldown = this.slotCooldowns.get(slotIdx);
			if (clearSlotCooldown) {
				clearSlotCooldown();
			}

			if (nextState.cooldown) {
				cooldown.active = true;

				const length = nextState.cooldown.length;

				const disconnect = OnUpdate.Connect(() => {
					const secondsRemaining = nextState.cooldown!.endTime - TimeUtil.GetServerTime();
					const value = math.min(1, (length - secondsRemaining) / length);

					cooldownTickImage.fillAmount = 1 - value;
					cooldownText.text = string.format("%d", secondsRemaining);

					if (value >= 1) {
						disconnect();
						cooldown.active = false;
					}
				});

				this.slotCooldowns.set(slotIdx, disconnect);
			} else {
				cooldown.active = false;
			}

			if (nextState.keybinding !== undefined) {
				keybinding.enabled = true;
				keybinding.text = InputUtils.GetStringForKeyCode(nextState.keybinding) ?? "??";
			} else {
				keybinding.enabled = false;
			}

			if (nextState.charges !== undefined && nextState.charges > 0) {
				amount.enabled = true;
				amount.text = tostring(nextState.charges);
			} else {
				amount.enabled = false;
			}

			const texture2d = nextState.icon
				? AssetBridge.Instance.LoadAssetIfExists<Texture2D>(nextState.icon)
				: undefined;
			if (texture2d) {
				image.sprite = Bridge.MakeSprite(texture2d);
				image.enabled = true;
				name.enabled = false;
			} else {
				name.text = nextState.name;
				image.enabled = false;
				name.enabled = true;
			}
		}
	}

	private SetupAbilityBar() {
		for (let i = 0; i < this.abilitySlots; i++) {
			this.UpdateAbilityBarSlot(i, undefined, undefined); // set undefined for now, TODO: Retrieve from AbilitiesController ?
		}
	}

	public OnStart(): void {
		this.SetupAbilityBar();

		let disconnectTimer: (() => void) | undefined;

		CoreClientSignals.AbilityChargeStarted.Connect((event) => {
			if (event.clientId === Game.LocalPlayer.clientId) {
				const chargingEvent = event.chargingAbilityDto;

				const startTime = chargingEvent.timeStart;
				const endTime = chargingEvent.timeEnd;
				const length = chargingEvent.length;

				disconnectTimer = OnUpdate.Connect((dt) => {
					const secondsRemaining = endTime - TimeUtil.GetServerTime();
					const value = math.min(1, (length - secondsRemaining) / length);
					this.castbar.SetValue(value);
				});

				this.castbar.InstantlySetValue(0);
				this.castbar.SetActive(true);
				this.castbarText.text = event.chargingAbilityDto.displayText;
			}
		});

		CoreClientSignals.AbilityChargeEnded.Connect((event) => {
			if (event.clientId === Game.LocalPlayer.clientId) {
				if (event.chargingAbilityDto.endState === ChargingAbilityEndedState.Cancelled) {
					this.castbar.SetValue(0);
				}

				disconnectTimer?.();
				this.castbar.SetActive(false);
			}
		});

		// Update local abilities
		this.abilityBindingController.ObserveAbilityBindings((abilities) => {
			const bin = new Bin();
			let idx = 0;
			for (const ability of abilities) {
				let currIdx = idx;
				this.UpdateAbilityBarSlot(currIdx, ability.ToAbilityState(), undefined);
				bin.Add(
					ability.BindingStateChanged.Connect((event) => {
						this.UpdateAbilityBarSlot(currIdx, event.newState, event.oldState);
					}),
				);
				idx++;
			}
			return bin;
		});
	}
}
