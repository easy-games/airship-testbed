import { UserController } from "../Client/ProtectedControllers/User/UserController";
import { ProtectedPlayersSingleton } from "./MainMenu/Singletons/ProtectedPlayersSingleton";

/**
 * It's like the Airship global but for protected stuff only.
 * @internal
 */
export const Protected = {
	user: undefined! as UserController,
	protectedPlayers: undefined! as ProtectedPlayersSingleton,
};
