/// <reference types="compiler-types" />
import { GameDto } from "../../../../Client/Components/HomePage/API/GamesAPI";
import { OnStart } from "../../../Flamework/flamework";
export default class SearchSingleton implements OnStart {
    games: GameDto[];
    myGames: GameDto[];
    myGamesIds: Set<string>;
    OnStart(): void;
    AddGames(dtos: GameDto[]): void;
    FetchMyGames(): void;
    FetchPopularGames(): void;
}
