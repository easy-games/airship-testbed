import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { FriendStatus } from "@Easy/Core/Client/MainMenuControllers/Social/SocketAPI";

export interface SearchResultDto {
	game?: GameDto;
	friend?: FriendStatus;
}
