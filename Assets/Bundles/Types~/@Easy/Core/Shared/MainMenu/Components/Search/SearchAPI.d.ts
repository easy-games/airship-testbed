import { GameDto } from "../../../../Client/Components/HomePage/API/GamesAPI";
import { FriendStatus } from "../../../../Client/ProtectedControllers/Social/SocketAPI";
export interface SearchResultDto {
    game?: GameDto;
    friend?: FriendStatus;
}
