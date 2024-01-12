import { Controller, OnStart } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";

/** Provides access to matchmaking status. */
@Controller({})
export class MatchmakingController implements OnStart {
	OnStart(): void {}

	/**
	 * Checks for updates in the users matchmaking status. Your game must be enrolled in matchmaking services
	 * for this function to work.
	 */
	public async GetStatus(): Promise<Result<undefined, undefined>> {
		const res = await MatchmakingControllerBackend.GetStatus();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get matchmaking status. Status Code:  ${res.statusCode}.\n${res.data}`);
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
