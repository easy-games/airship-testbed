import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework/flamework";
import ObjectUtils from "@easy-games/unity-object-utils";

@Service({})
@Controller({})
// @Singleton()
export default class SearchSingleton implements OnStart {
	public games: GameDto[] = [];

	OnStart(): void {}

	public AddGames(dtos: GameDto[]): void {
		for (let dto of dtos) {
			// update existing
			let existing = this.games.find((g) => g.id === dto.id);
			if (existing) {
				ObjectUtils.assign(existing, dto);
				continue;
			}

			// add new
			this.games.push(dto);
		}
	}
}
