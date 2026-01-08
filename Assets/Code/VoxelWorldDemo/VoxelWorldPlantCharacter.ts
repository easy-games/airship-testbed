import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import VoxelWorldPlantManager, { VoxelWorldPlantEvents } from "./VoxelWorldPlantManager";
import { Game } from "@Easy/Core/Shared/Game";

export default class VoxelWorldPlantCharacter extends AirshipBehaviour {
    public character: Character;

    private plantManager: VoxelWorldPlantManager;

	override Start(): void {
        this.character.WaitForInit();
        this.plantManager = VoxelWorldPlantManager.Get();
        if(this.character.IsLocalCharacter()) { 
            Airship.Input.OnDown(CoreAction.Interact).Connect(() => {
                this.PlaceDirt();
            })

            Airship.Input.OnDown(CoreAction.Crouch).Connect(() => {
                this.PlacePlant();
            });
        }
	}

    private PlacePlant() { 
        // If on a weed, damage weed
        if(!this.plantManager.TryDamagePlant(this.character.transform.position)) {
            // Otherwise try to place a plant
            this.plantManager.TryPlacePlant(this.character.transform.position);
        }
    }

    private PlaceDirt() {
        print("Wants to place dir")
        if(this.plantManager.GetPlant(this.character.transform.position) !== undefined) { 
            print("Plant is in the way")
            return;
        }

        VoxelWorldPlantEvents.RequestPlaceDirt.client.FireServer();
    }
}
