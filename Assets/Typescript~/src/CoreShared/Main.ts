import { CoreSignals } from "./CoreSignals";
import { EasyCore } from "./EasyCore";
import { UserAPI } from "./API/UserAPI";
import { UpdateUserDto } from "./SocketIOMessages/UpdateUserDto";
import { FriendAPI } from "./API/FriendAPI";
import { encode } from "./json";
import { SetInterval } from "./Util/Timer";

print(`CoreShared.Main.ts()`);

CoreSignals.CoreInitialized.Connect((signal) => {
	print(`Main.ts CoreSignals.CoreInitialized! signal.idToken: ${signal.idToken}`);
	UserAPI.InitAsync();
});

CoreSignals.UserServiceInitialized.Connect(async () => {
	await FriendAPI.InitAsync();

	// const curUser = UserAPI.GetCurrentUser();
	// print(`Main.ts CoreSignals.UserServiceInitialized! curUser?.username: ${curUser?.username}`);
	// if (curUser) {
	// 	const curUser2 = await UserAPI.GetUserAsync(curUser?.discriminatedUsername);
	// 	print(`Main.ts CoreSignals.UserServiceInitialized! curUser2?.username: ${curUser2?.username}`);
	// 	if (curUser2?.username) {
	// 		await UserAPI.UpdateCurrentUserDataAsync(new UpdateUserDto(curUser2?.username.sub(0, -2)));
	// 	}
	// }

	const friends = await FriendAPI.GetFriendsAsync();
	print(`Main.ts CoreSignals.UserServiceInitialized! friends: ${encode(friends)}`);
	// if (curUser?.uid) {
	// 	const friendsOfUser = await FriendAPI.GetStatusWithOtherUserAsync("daqTObdnLVe7TEkkxiKfosDecz12");
	// 	print(`Main.ts CoreSignals.UserServiceInitialized! friendsOfUser: ${encode(friendsOfUser)}`);

	// 	if (!friendsOfUser.isFriends) {
	// 		const requestResult = await FriendAPI.RequestFriendshipAsync("BEDBOUNCER89336#0002");

	// 		print(`Main.ts CoreSignals.UserServiceInitialized! requestResult: ${requestResult}`);
	// 	}
	// }
});

CoreSignals.GameCoordinatorMessage.Connect((signal) => {
	print(`Main.ts CoreSignals.GameCoordinatorMessage! signal: ${encode(signal)}`);
});

CoreSignals.UserServiceInitialized.Connect(() => {
	// SetInterval(
	// 	3,
	// 	async () => {
	// 		print(`SetInterval() friends: ${encode(await FriendAPI.GetFriendsAsync())}`);
	// 		const friendRequests = await FriendAPI.GetFriendRequestsAsync();
	// 		print(`SetInterval() friendRequests: ${encode(friendRequests)}`);
	// 		friendRequests.incomingRequests.forEach(async (otherUser) => {
	// 			print(`SetInterval() friendRequest accepting from: ${otherUser.discriminatedUsername}`);
	// 			const requestResult = await FriendAPI.RequestFriendshipAsync(otherUser.discriminatedUsername);
	// 			print(
	// 				`SetInterval() friendRequest result from: ${otherUser.discriminatedUsername}, result: ${requestResult.result}`,
	// 			);
	// 		});
	// 	},
	// 	true,
	// );
});

CoreSignals.FriendRequested.Connect((signal) => {
	print(`Main.FriendRequested() signal: ${encode(signal)}`);
});

CoreSignals.FriendAccepted.Connect((signal) => {
	print(`Main.FriendAccepted() signal: ${encode(signal)}`);
});

CoreSignals.FriendUserStatusChanged.Connect((signal) => {
	print(`Main.FriendUserStatusChanged() signal: ${encode(signal)}`);
});

CoreSignals.StatusUpdateRequested.Connect((signal) => {
	print(`Main.StatusUpdateRequested() signal: ${encode(signal)}`);
});

CoreSignals.PartyInviteReceived.Connect((signal) => {
	print(`Main.PartyInviteReceived() signal: ${encode(signal)}`);
});

CoreSignals.PartyUpdated.Connect((signal) => {
	print(`Main.PartyUpdated() signal: ${encode(signal)}`);
});

if (RunCore.IsClient()) {
	EasyCore.InitAsync();
}
