import { CoreClientContext } from "./CoreClientContext";

const client = require("Client/Resources/TS/MainClient") as {
	SetupClient: (context: CoreClientContext) => void;
};
client.SetupClient(CoreClientContext.MAIN_MENU);
