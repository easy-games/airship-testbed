import { ProtectedUserController } from "../Client/ProtectedControllers/Airship/User/UserController";
import { ProtectedPlayersSingleton } from "./MainMenu/Singletons/ProtectedPlayersSingleton";
import { ProtectedSettingsSingleton } from "./MainMenu/Singletons/Settings/ProtectedSettingsSingleton";
import { ProtectedAvatarSingleton } from "./Protected/ProtectedAvatarSingleton";

/**
 * It's like the Airship global but for protected stuff only.
 * @internal
 */
export const Protected = {
	user: undefined! as ProtectedUserController,
	protectedPlayers: undefined! as ProtectedPlayersSingleton,
	settings: undefined! as ProtectedSettingsSingleton,
	avatar: undefined! as ProtectedAvatarSingleton,
};
