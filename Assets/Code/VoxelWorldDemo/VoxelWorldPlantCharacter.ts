import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import VoxelWorldPlantManager, { VoxelWorldPlantEvents } from "./VoxelWorldPlantManager";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

export default class VoxelWorldPlantCharacter extends AirshipBehaviour {
	public character: Character;

	private plantManager: VoxelWorldPlantManager;

	override Start(): void {
		this.character.WaitForInit();
		this.plantManager = VoxelWorldPlantManager.Get();
		if (this.character.IsLocalCharacter()) {
			Airship.Input.CreateAction("AddVoxel", Binding.Key(Key.E));
			Airship.Input.CreateAction("RemoveVoxel", Binding.Key(Key.Q));
			Airship.Input.OnDown("AddVoxel").Connect(() => {
				this.PlaceDirt();
			});

			Airship.Input.OnDown("RemoveVoxel").Connect(() => {
				this.RemoveDirt();
			});

			Airship.Input.OnDown(CoreAction.Crouch).Connect(() => {
				this.PlacePlant();
			});

			Airship.Input.OnDown(CoreAction.Interact).Connect(() => {
				this.ResetWorld();
			});
		}
	}

	private PlacePlant() {
		// If on a weed, damage weed
		if (!this.plantManager.TryDamagePlant(this.character.transform.position)) {
			// Otherwise try to place a plant
			this.plantManager.TryPlacePlant(this.character.transform.position);
		}
	}

	private PlaceDirt() {
		print("Wants to place dirt");
		if (this.plantManager.GetPlant(this.character.transform.position) !== undefined) {
			print("Plant is in the way");
			return;
		}

		VoxelWorldPlantEvents.RequestPlaceDirt.client.FireServer();
	}

	private RemoveDirt() {
		print("Wants to remove dirt");
		if (this.plantManager.GetPlant(this.character.transform.position) !== undefined) {
			print("Plant is in the way");
			return;
		}

		VoxelWorldPlantEvents.RequestDestroyDirt.client.FireServer();
	}

	private ResetWorld() {
		print("Client requests to reset world");
		VoxelWorldPlantEvents.ResetWorld.client.FireServer();
	}
}
