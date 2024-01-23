import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";

@Controller()
@Service()
export class TeamManager implements OnStart {
	constructor() {
		Airship.teams = this;
	}

	OnStart(): void {}
}
