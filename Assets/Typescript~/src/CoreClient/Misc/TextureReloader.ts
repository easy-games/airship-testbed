import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";

const keyboard = new Keyboard();
keyboard.KeyDown.Connect((event) => {
	if (event.Key === Key.F9) {
		const voxelWorld = GameObject.Find("VoxelWorld")?.GetComponent<VoxelWorld>();
		if (!voxelWorld) {
			Game.LocalPlayer.SendMessage("VoxelWorld not found.");
			return;
		}
		voxelWorld.ReloadTextureAtlas();
		Game.LocalPlayer.SendMessage("Reloaded textures!");
	}
});
