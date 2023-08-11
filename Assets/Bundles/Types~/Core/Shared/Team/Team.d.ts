import { Player } from "Shared/Player/Player";
export interface TeamDto {
    name: string;
    id: string;
    userIds: string[];
    color: [r: number, g: number, b: number, a: number];
}
export declare class Team {
    readonly name: string;
    readonly id: string;
    readonly color: Color;
    private players;
    readonly onPlayerAdded: any;
    readonly onPlayerRemoved: any;
    constructor(name: string, id: string, color: Color);
    GetPlayers(): Set<Player>;
    AddPlayer(player: Player): void;
    RemovePlayer(player: Player): void;
    Encode(): TeamDto;
    HasLocalPlayer(): boolean;
}
