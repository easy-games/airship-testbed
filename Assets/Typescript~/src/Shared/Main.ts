import { RunUtil } from "Imports/Core/Shared/Util/RunUtil";

print("Game main");

if (RunUtil.IsServer()) {
	const server = require("Server/Resources/TS/MainServer") as {
		SetupServer: () => void;
	};
	server.SetupServer();
} else {
	const client = require("Client/Resources/TS/MainClient") as {
		SetupClient: () => void;
	};
	client.SetupClient();
}
