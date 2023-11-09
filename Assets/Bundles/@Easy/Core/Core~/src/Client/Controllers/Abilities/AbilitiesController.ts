import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Keyboard } from "Shared/UserInput";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { AbilityDto } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";
import { Bin } from "Shared/Util/Bin";
import { AbilityBinding, BindingAction, BindingInputState } from "./Class/AbilityBinding";
import inspect from "@easy-games/unity-inspect";

const primaryKeys: ReadonlyArray<KeyCode> = [KeyCode.R, KeyCode.T, KeyCode.Y];
const secondaryKeys: ReadonlyArray<KeyCode> = [KeyCode.G, KeyCode.H, KeyCode.J];
const utilityKeys: ReadonlyArray<KeyCode> = [KeyCode.Z, KeyCode.X, KeyCode.V];

@Controller()
export class AbilitiesController implements OnStart {
	private readonly keyboard = new Keyboard();

	public primaryAbilitySlots = new Array<AbilityBinding>(primaryKeys.size());
	public secondaryAbilitySlots = new Array<AbilityBinding>(secondaryKeys.size());
	public utilityAbiltySlots = new Array<AbilityBinding>(utilityKeys.size());

	public constructor(private readonly abilityRegistry: AbilityRegistry) {
		// Set up binding slots
		for (const keyCode of primaryKeys) {
			this.primaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Primary, false, keyCode));
		}

		for (const keyCode of secondaryKeys) {
			this.secondaryAbilitySlots.push(new AbilityBinding(AbilitySlot.Secondary, false, keyCode));
		}

		for (const keyCode of utilityKeys) {
			this.utilityAbiltySlots.push(new AbilityBinding(AbilitySlot.Utility, false, keyCode));
		}
	}

	private FindNextAvailableSlot(slots: Array<AbilityBinding>) {
		for (const item of slots) {
			if (item.GetBound() === undefined) {
				return item;
			}
		}

		return undefined;
	}

	private RegisterAbility(abilityDto: AbilityDto) {
		let nextSlot: AbilityBinding | undefined;
		if (abilityDto.slot === AbilitySlot.Primary) {
			nextSlot = this.FindNextAvailableSlot([
				...this.primaryAbilitySlots,
				...this.secondaryAbilitySlots,
				...this.utilityAbiltySlots,
			]);
		} else if (abilityDto.slot === AbilitySlot.Secondary) {
			nextSlot = this.FindNextAvailableSlot([
				...this.secondaryAbilitySlots,
				...this.primaryAbilitySlots,
				...this.utilityAbiltySlots,
			]);
		} else if (abilityDto.slot === AbilitySlot.Utility) {
			nextSlot = this.FindNextAvailableSlot(this.utilityAbiltySlots);
		}

		if (!nextSlot) return false;

		nextSlot.BindTo(abilityDto);
		nextSlot.BindToAction(this.keyboard, this.OnKeyboardInputEnded);

		print("registered ability at keycode ", abilityDto.id, nextSlot.GetKey());
	}

	// TODO: in future a much friendlier Input API
	private OnKeyboardInputEnded: BindingAction = (state, binding) => {
		const boundAbilityId = binding.GetBound()?.id;
		if (state === BindingInputState.InputEnded && boundAbilityId) {
			CoreNetwork.ClientToServer.UseAbility.Client.FireServer({
				abilityId: boundAbilityId,
			});
		}
	};

	public ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin) {
		const bin = new Bin();
		bin.Add(callback([...this.primaryAbilitySlots, ...this.secondaryAbilitySlots, ...this.utilityAbiltySlots]));
		return bin;
	}

	public OnStart(): void {
		const abilities = CoreNetwork.ClientToServer.GetAbilities.Client.FireServer();
		print("Fetched abilities", inspect(abilities));
		for (const ability of abilities) {
			this.RegisterAbility(ability);
		}

		CoreNetwork.ServerToClient.AbilityAdded.Client.OnServerEvent((dto) => {
			print("Add ability", inspect(dto));
			this.RegisterAbility(dto);
		});
	}
}
