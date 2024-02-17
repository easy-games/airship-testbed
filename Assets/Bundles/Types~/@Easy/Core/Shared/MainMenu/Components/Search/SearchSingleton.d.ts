import { GameDto } from "../../../../Client/Components/HomePage/API/GamesAPI";
import { OnStart } from "../../../Flamework/flamework";
export default class SearchSingleton implements OnStart {
    games: GameDto[];
    OnStart(): void;
    AddGames(dtos: GameDto[]): void;
}
