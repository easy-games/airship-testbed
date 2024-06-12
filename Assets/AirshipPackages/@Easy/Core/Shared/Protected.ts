import { UserController } from "../Client/ProtectedControllers/User/UserController";

/**
 * It's like the Airship global but for protected stuff only.
 * @internal
 */
export const Protected = {
	user: undefined as unknown as Omit<UserController, "OnStart">,
};
