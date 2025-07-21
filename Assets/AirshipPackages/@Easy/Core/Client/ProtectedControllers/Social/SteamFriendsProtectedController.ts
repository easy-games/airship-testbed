import { AirshipUser } from "@Easy/Core/Shared/Airship/Types/AirshipUser";
import { Controller, Dependency, OnStart } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { ProtectedUserController } from "../Airship/User/UserController";

@Controller({})
export class SteamFriendsProtectedController implements OnStart {
	private steamFriendsWithAirshipAccount?: AirshipUser[];
	private loadedFriendsWithAirship = new Signal<[AirshipUser[]]>();
	/** Map from theoretical airship uid to steam friend info. They might not have an airship account. */
	public steamFriends = new Map<string, AirshipSteamFriendInfo>();
	public onSteamFriendsChanged = new Signal();

	OnStart(): void {
		if (!SteamLuauAPI.IsSteamInitialized()) return;

		SetInterval(
			10,
			() => {
				this.PullSteamFriends();
			},
			true,
		);
	}

	private PullSteamFriends(): void {
		const steamFriends = SteamLuauAPI.GetSteamFriends();
		const steamIds: string[] = [];
		for (const friendInfo of steamFriends) {
			const airshipUid = `${friendInfo.steamId}:steam`;
			steamIds.push(airshipUid);
			this.steamFriends.set(airshipUid, friendInfo);
		}
		this.onSteamFriendsChanged.Fire();
		this.LoadSteamFriendsWithAirship(steamIds);
	}

	private async LoadSteamFriendsWithAirship(steamIds: string[]) {
		const results = await Dependency<ProtectedUserController>().GetUsersById(steamIds, false);
		if (!results) {
			this.steamFriendsWithAirshipAccount = [];
			this.loadedFriendsWithAirship.Fire(this.steamFriendsWithAirshipAccount);
			return;
		}

		this.steamFriendsWithAirshipAccount = results.array;
		this.loadedFriendsWithAirship.Fire(this.steamFriendsWithAirshipAccount);
	}

	/** undefined if not yet loaded (you can use {@link WaitForSteamFriendsWithAirship}) */
	public GetSteamFriendsWithAirship(): Map<string, AirshipUser & AirshipSteamFriendInfo> | undefined {
		if (!this.steamFriendsWithAirshipAccount) return;

		const result = new Map<string, AirshipUser & AirshipSteamFriendInfo>();
		for (const friend of this.steamFriendsWithAirshipAccount) {
			const steamFriendInfo = this.steamFriends.get(friend.uid);
			if (!steamFriendInfo) continue;

			result.set(friend.uid, {
				...friend,
				// Manual decomposition of C# obj
				steamId: steamFriendInfo.steamId,
				steamName: steamFriendInfo.steamName,
				playingAirship: steamFriendInfo.playingAirship,
				playingOtherGame: steamFriendInfo.playingOtherGame,
				online: steamFriendInfo.online,
			});
		}
		return result;
	}

	public WaitForSteamFriendsWithAirship(): AirshipUser[] {
		if (this.steamFriendsWithAirshipAccount) return this.steamFriendsWithAirshipAccount;
		return this.loadedFriendsWithAirship.Wait()[0];
	}
}
