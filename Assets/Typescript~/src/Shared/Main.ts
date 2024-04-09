import { Game } from "@Easy/Core/Shared/Game";

if (Game.IsServer()) {
	require("Server/Resources/TS/MainServer");
}
if (Game.IsClient()) {
	require("Client/Resources/TS/MainClient");
}
