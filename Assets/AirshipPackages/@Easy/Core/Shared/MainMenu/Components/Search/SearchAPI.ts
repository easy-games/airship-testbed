import { GameDto } from "@Easy/Core/Client/Components/HomePage/API/GamesAPI";
import { UserStatusData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";

export interface SearchResultDto {
	game?: GameDto;
	friend?: UserStatusData;
}
