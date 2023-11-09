import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { InputUtils } from "Shared/Util/InputUtils";
import { AbilitiesController } from "./AbilitiesController";
import { Bin } from "Shared/Util/Bin";
import inspect from "@easy-games/unity-inspect";
import { Healthbar } from "Shared/UI/Healthbar";
import { CoreNetwork } from "Shared/CoreNetwork";
import { ChargingAbilityEndedState } from "Shared/Abilities/Ability";
import { OnUpdate, SetTimeout } from "Shared/Util/Timer";
import { TimeUtil } from "Shared/Util/TimeUtil";

export interface ClientAbilityState {
	name: string;
	icon: string | undefined;
	charges: number | undefined;
	keybinding: KeyCode | undefined;
}

@Controller()
export class AbilitiesUIController implements OnStart {
	private abilitySlots = 9;

	private canvas: Canvas;
	private abilitiesRefs: GameObjectReferences;
	private abilitybarContent: Transform;
	private castbar: Healthbar;

	public constructor(
		public readonly coreUIController: CoreUIController,
		public readonly abilitiesController: AbilitiesController,
	) {
		const go = this.coreUIController.refs.GetValue("Apps", "Abilities");
		this.canvas = go.GetComponent<Canvas>();
		this.canvas.enabled = true; // Enable if using abilities

		this.abilitiesRefs = go.GetComponent<GameObjectReferences>();
		this.abilitybarContent = this.abilitiesRefs.GetValue("UI", "AbilityBarContentGO").transform;
		this.castbar = new Healthbar(this.abilitiesRefs.GetValue("UI", "CastBarTransform"), {
			fillColor: new Color(255, 100, 0),
			deathOnZero: false,
		});

		this.castbar.SetActive(false);
	}

	private UpdateAbilityBarSlot(slotIdx: number, ability: ClientAbilityState | undefined) {
		if (slotIdx >= this.abilitySlots) {
			warn("Attempting to set slot", slotIdx, "with", inspect(ability));
			return;
		}

		const child = this.abilitybarContent.GetChild(slotIdx);
		if (!child) {
			warn("Could not update ability bar at slot index ", slotIdx);
			return;
		}

		print("fetch bar slot", slotIdx);
		const go = child.gameObject;
		const contentGO = go.transform.GetChild(0)?.gameObject;
		if (!contentGO) {
			warn("Could not update child of slot index", slotIdx);
			return;
		}

		contentGO.gameObject.SetActive(ability !== undefined);
		if (ability !== undefined) {
			// Update slot metadata
			const refs = go.GetComponent<GameObjectReferences>();
			const image = refs.GetValue<Image>("UI", "Image");
			const amount = refs.GetValue<TMP_Text>("UI", "Charges");
			const name = refs.GetValue<TMP_Text>("UI", "Name");
			const keybinding = refs.GetValue<TMP_Text>("UI", "Keybinding");

			if (ability.keybinding !== undefined) {
				keybinding.enabled = true;
				keybinding.text = InputUtils.GetStringForKeyCode(ability.keybinding) ?? "??";
			} else {
				keybinding.enabled = false;
			}

			if (ability.charges !== undefined && ability.charges > 0) {
				amount.enabled = true;
				amount.text = tostring(ability.charges);
			} else {
				amount.enabled = false;
			}

			const texture2d = ability.icon
				? AssetBridge.Instance.LoadAssetIfExists<Texture2D>(ability.icon)
				: undefined;
			if (texture2d) {
				image.sprite = Bridge.MakeSprite(texture2d);
				image.enabled = true;
				name.enabled = false;
			} else {
				name.text = ability.name;
				image.enabled = false;
				name.enabled = true;
			}
		}
	}

	private SetupAbilityBar() {
		for (let i = 0; i < this.abilitySlots; i++) {
			this.UpdateAbilityBarSlot(i, undefined); // set undefined for now, TODO: Retrieve from AbilitiesController ?
		}
	}

	public OnStart(): void {
		this.SetupAbilityBar();

		let disconnectTimer: (() => void) | undefined;
		CoreNetwork.ServerToClient.AbilityChargeBegan.Client.OnServerEvent((event) => {
			const startTime = event.timeStart;
			const endTime = event.timeEnd;
			const length = event.length;

			disconnectTimer = OnUpdate.Connect((dt) => {
				const secondsRemaining = endTime - TimeUtil.GetServerTime();
				const value = math.min(1, (length - secondsRemaining) / length);
				this.castbar.SetValue(value);
			});

			this.castbar.InstantlySetValue(0);
			this.castbar.SetActive(true);
		});

		CoreNetwork.ServerToClient.AbilityChargeEnded.Client.OnServerEvent((event) => {
			if (event.endState === ChargingAbilityEndedState.Cancelled) {
				this.castbar.SetValue(0);
			}

			disconnectTimer?.();
			SetTimeout(0.5, () => this.castbar.SetActive(false));
		});

		// Update local abilities
		this.abilitiesController.ObserveAbilityBindings((abilities) => {
			const bin = new Bin();
			let idx = 0;
			for (const ability of abilities) {
				let currIdx = idx;
				this.UpdateAbilityBarSlot(currIdx, ability.ToAbilityState());
				bin.Add(
					ability.BindingStateChanged.Connect((event) => {
						print("update binding state", inspect(event.newState));
						this.UpdateAbilityBarSlot(currIdx, event.newState);
					}),
				);
				print("bind", ability.GetKey(), "to", idx);
				idx++;
			}
			return bin;
		});
	}
}
