import { MainMenuPageType } from "@Easy/Core/Client/ProtectedControllers/MainMenuPageName";
import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";

export class MainMenuBeforePageChangeSignal extends Cancellable {
	constructor(public readonly newPage: MainMenuPageType, public readonly oldPage: MainMenuPageType | undefined) {
		super();
	}
}
