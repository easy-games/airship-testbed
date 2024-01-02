/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class SortComponent extends AirshipBehaviour {
    TitleText: GameObject;
    Content: Transform;
    GamePrefab: GameObject;
    BackendName: string;
    OnAwake(): void;
    OnStart(): void;
    OnDestroy(): void;
    Setup(title: string, backendName: string): void;
    SetGames(games: GameDto[]): void;
    SetTitle(title: string): void;
}
