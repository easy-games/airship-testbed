import { Game } from "@Easy/Core/Shared/Game";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

const keyboard = new Keyboard();
keyboard.OnKeyDown(Key.F9, (event) => {
	const voxelWorld = GameObject.Find("VoxelWorld")?.GetComponent<VoxelWorld>()!;
	if (!voxelWorld) {
		Game.localPlayer.SendMessage("VoxelWorld not found.");
		return;
	}
	voxelWorld.ReloadTextureAtlas();
	Game.localPlayer.SendMessage("Reloaded textures!");
});
