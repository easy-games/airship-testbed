/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class SortComponent extends AirshipBehaviour {
    titleText: GameObject;
    content: Transform;
    gamePrefab: GameObject;
    Awake(): void;
    Start(): void;
    OnDestroy(): void;
    Init(title: string): void;
    Clear(): void;
    SetGames(games: GameDto[]): void;
    SetTitle(title: string): void;
}
