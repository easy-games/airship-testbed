import { MainMenuPageType } from "@Easy/Core/Client/ProtectedControllers/MainMenuPageName";

export class MainMenuPageChangeSignal {
	constructor(public readonly newPage: MainMenuPageType, public readonly oldPage: MainMenuPageType | undefined) {}
}
