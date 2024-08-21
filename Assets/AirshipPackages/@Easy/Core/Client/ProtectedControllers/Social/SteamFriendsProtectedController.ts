import { PublicUser } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipUser";
import { Controller, Dependency, OnStart } from "@Easy/Core/Shared/Flamework";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { ProtectedUserController } from "../Airship/User/UserController";

@Controller({})
export class SteamFriendsProtectedController implements OnStart {
    private steamFriendsWithAirship?: PublicUser[];
    private loadedFriendsWithAirship = new Signal<[PublicUser[]]>();
    /** Map from theoretical airship uid to steam friend info. They might not have an airship account. */
    private steamFriends = new Map<string, AirshipSteamFriendInfo>();

    OnStart(): void {
        if (!SteamLuauAPI.IsSteamInitialized()) return;

        const steamFriends = SteamLuauAPI.GetSteamFriends();
        const steamIds: string[] = [];
        for (let i = 0; i < steamFriends.Length; i++) {
            const friendInfo = steamFriends.GetValue(i);
            const airshipUid = `steam:${friendInfo.steamId}`;
            steamIds.push(airshipUid);
            this.steamFriends.set(airshipUid, friendInfo);
        }
        this.LoadSteamFriendsWithAirship(steamIds);
    }

    private async LoadSteamFriendsWithAirship(steamIds: string[]) {
        const results = await Dependency<ProtectedUserController>().GetUsersById(steamIds, false);
        if (!results.data) {
            this.steamFriendsWithAirship = [];
            this.loadedFriendsWithAirship.Fire(this.steamFriendsWithAirship);
            return;
        }

        this.steamFriendsWithAirship = results.data.array;
        this.loadedFriendsWithAirship.Fire(this.steamFriendsWithAirship);
    }

    /** undefined if not yet loaded (you can use {@link WaitForSteamFriendsWithAirship}) */
    public GetSteamFriendsWithAirship(): Map<string, PublicUser & AirshipSteamFriendInfo> | undefined {
        if (!this.steamFriendsWithAirship) return;

        const result = new Map<string, PublicUser & AirshipSteamFriendInfo>();
        for (const friend of this.steamFriendsWithAirship) {
            const steamFriendInfo = this.steamFriends.get(friend.uid);
            if (!steamFriendInfo) continue;

            result.set(friend.uid, {
                ...friend,
                // Manual decomposition of C# obj
                steamId: steamFriendInfo.steamId,
                steamName: steamFriendInfo.steamName,
                playingAirship: steamFriendInfo.playingAirship,
             });
        }
        return result;
    }

    public WaitForSteamFriendsWithAirship(): PublicUser[] {
        if (this.steamFriendsWithAirship) return this.steamFriendsWithAirship;
        return this.loadedFriendsWithAirship.Wait()[0];
    }
}
