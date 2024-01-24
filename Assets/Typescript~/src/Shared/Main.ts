import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

if (RunUtil.IsServer()) {
	require("Server/Resources/TS/MainServer");
}
if (RunUtil.IsClient()) {
	require("Client/Resources/TS/MainClient");
}
