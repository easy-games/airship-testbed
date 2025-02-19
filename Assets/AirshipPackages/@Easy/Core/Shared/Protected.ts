import { ProtectedUserController } from "../Client/ProtectedControllers/Airship/User/UserController";
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
};
