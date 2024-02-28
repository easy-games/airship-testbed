import { Flamework } from "Shared/Flamework";
import { CoreRefs } from "./CoreRefs";

CoreRefs.Init();

require("@Easy/Core/Shared/Resources/TS/CoreBootstrap");

Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
Flamework.Ignite();
