import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class RobbieTestAbility extends AbilityLogic {
	private serverDisabledBin = new Bin();

	public override OnEnabled(): void {
		if (RunCore.IsServer()) {
			this.ServerOnEnabled();
		} else {
			this.ClientOnEnabled();
		}
	}

	public override OnDisabled(): void {
		if (RunCore.IsServer()) {
			this.ServerOnDisabled();
		} else {
			this.ClientOnDisabled();
		}
	}

	private ServerOnEnabled(): void {
		print("[ServerOnEnabled] ROBBIE ABILITY");
		this.serverDisabledBin.Add(
			CoreServerSignals.EntityDamage.Connect((event) => {
				print("ONCE PER HIT");
				if (event.fromEntity instanceof CharacterEntity && event.fromEntity === this.entity) {
					event.amount = 100;
				}
			}),
		);
	}

	private ServerOnDisabled(): void {
		print("[ServerOnDisabled] ROBBIE ABILITY");
		this.serverDisabledBin.Clean();
	}

	private ClientOnEnabled(): void {
		print("[ClientOnEnabled] ROBBIE ABILITY");
	}

	private ClientOnDisabled(): void {
		print("[ClientOnDisabled] ROBBIE ABILITY");
	}
}
