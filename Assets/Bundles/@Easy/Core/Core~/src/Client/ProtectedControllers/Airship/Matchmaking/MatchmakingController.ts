import { Platform } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

@Controller({})
export class MatchmakingController implements OnStart {
	constructor() {
		if (RunUtil.IsClient()) Platform.client.matchmaking = this;
	}

	OnStart(): void {}

	/**
	 * Checks for updates in the users matchmaking status. Your game must be enrolled in matchmaking services
	 * for this function to work.
	 */
	public async GetStatus(): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/matchmaking/queue/status`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get matchmaking status. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}
}
