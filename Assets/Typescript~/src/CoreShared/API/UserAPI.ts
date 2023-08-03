import { ApiHelper } from "CoreShared/ApiHelper";
import { CoreSignals } from "CoreShared/CoreSignals";
import { EasyCore } from "CoreShared/EasyCore";
import { PublicUser } from "CoreShared/SocketIOMessages/PublicUser";
import { SIOEventNames } from "CoreShared/SocketIOMessages/SOIEventNames";
import { UserStatus } from "CoreShared/SocketIOMessages/Status";
import { UpdateUserDto } from "CoreShared/SocketIOMessages/UpdateUserDto";
import { encode } from "CoreShared/json";

export class UserAPI {
	private static currentUser: PublicUser | undefined;
	private static userStatus: UserStatus = UserStatus.ONLINE;
	private static gameName: string | undefined;

	static async InitAsync() {
		this.currentUser = await EasyCore.GetAsync<PublicUser>(
			`${ApiHelper.USER_SERVICE_URL}/users/self`,
			undefined,
			EasyCore.GetHeadersMap(),
		);

		// When the game coordinator wants a status update,
		// send a signal so the game code can respond.
		// To respond, call UserAPI.UpdateCurrentUserStatus();
		CoreSignals.GameCoordinatorMessage.Connect((signal) => {
			if (signal.messageName === SIOEventNames.statusUpdateRequest) {
				CoreSignals.StatusUpdateRequested.Fire({});

				this.UpdateCurrentUserStatus(this.userStatus, this.gameName ? this.gameName : "");
			}
		});

		CoreSignals.UserServiceInitialized.Fire({});
	}

	static GetCurrentUser(): PublicUser | undefined {
		return this.currentUser;
	}

	static GetUserStatus(): UserStatus | undefined {
		return this.userStatus;
	}

	static GetGameName(): string | undefined {
		return this.gameName;
	}

	static async GetUserAsync(discriminatedUserName: string): Promise<PublicUser | undefined> {
		const params = new Map<string, string>();
		params.set("discriminatedUsername", discriminatedUserName);

		const headers = EasyCore.GetHeadersMap();

		try {
			return EasyCore.GetAsync(`${ApiHelper.USER_SERVICE_URL}/users/user`, params, headers);
		} catch (e) {
			print(`Unable to get PublicUser from discriminatedUsername: ${discriminatedUserName}. error: ${e}`);
			return undefined;
		}
	}

	static async UpdateCurrentUserDataAsync(updateUserDto: UpdateUserDto) {
		const headers = EasyCore.GetHeadersMap();

		try {
			return EasyCore.PatchAsync(
				`${ApiHelper.USER_SERVICE_URL}/users`,
				encode(updateUserDto),
				undefined,
				headers,
			);
		} catch (e) {
			print(`Unable to updateCurrentUserAsync. updateUserDto: ${encode(updateUserDto)}. error: ${e}`);
			return undefined;
		}
	}

	static UpdateCurrentUserStatus(userStatus: UserStatus, gameName: string) {
		EasyCore.EmitAsync(SIOEventNames.updateUserStatus, encode([{ status: userStatus, game: gameName }]));
		this.userStatus = userStatus;
		this.gameName = gameName;

		print(`UpdateCurrentUserStatus() userStatus: ${userStatus}, gameName: ${gameName}`);
	}
}
