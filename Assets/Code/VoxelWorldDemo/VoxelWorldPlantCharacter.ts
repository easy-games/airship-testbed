import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import VoxelWorldPlantManager from "./VoxelWorldPlantManager";

export default class VoxelWorldPlantCharacter extends AirshipBehaviour {
    public character: Character;

    private plantManager: VoxelWorldPlantManager;

	override Start(): void {
        this.character.WaitForInit();
        this.plantManager = VoxelWorldPlantManager.Get();
        if(this.character.IsLocalCharacter()) { 
            Airship.Input.OnDown(CoreAction.Interact).Connect(() => {
                this.Interact();
            })
        }
	}

    private Interact() { 
        // If on a weed, damage weed
        if(!this.plantManager.TryDamagePlant(this.character.transform.position)) {
            // Otherwise try to place a plant
            this.plantManager.TryPlacePlant(this.character.transform.position);
        }
    }
}
