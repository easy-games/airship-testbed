import { ProtectedUserController } from "../Client/ProtectedControllers/Airship/User/UserController";
import { Dependency } from "./Flamework";
import { Game } from "./Game";
import { MainMenuSingleton } from "./MainMenu/Singletons/MainMenuSingleton";
import { ProtectedPlayersSingleton } from "./MainMenu/Singletons/ProtectedPlayersSingleton";
import { ProtectedSettingsSingleton } from "./MainMenu/Singletons/Settings/ProtectedSettingsSingleton";
import { ProtectedAvatarSingleton } from "./Protected/Avatar/ProtectedAvatarSingleton";

/**
 * It's like the Airship global but for protected stuff only.
 * @internal
 */
export const Protected = {
	User: undefined! as ProtectedUserController,
	ProtectedPlayers: undefined! as ProtectedPlayersSingleton,
	Settings: undefined! as ProtectedSettingsSingleton,
	Avatar: undefined! as ProtectedAvatarSingleton,
	Util: {
		IsPhoneMode(): boolean {
			return Game.IsMobile() && Dependency<MainMenuSingleton>().sizeType === "sm";
		},
	},
};
