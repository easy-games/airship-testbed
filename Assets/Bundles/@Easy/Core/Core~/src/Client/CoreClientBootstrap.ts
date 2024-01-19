import { Flamework } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";

function LoadFlamework(context: CoreContext) {
	if (context === CoreContext.GAME) {
		Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/airship", "^.*controller.lua$");
		Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/controllers", "^.*controller.lua$");
		Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/strollers", "^.*.lua$");
	}
	Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
	Flamework.Ignite();
}

export function SetupClient(context: CoreContext) {
	LoadFlamework(context);
}
