import { FriendAPI } from "./API/FriendAPI";
import { UserAPI } from "./API/UserAPI";
import { CoreSignals } from "./CoreSignals";
import { encode } from "./json";

print(`Imports/Core/Shared.Main.ts()`);

CoreSignals.CoreInitialized.Connect((signal) => {
	print(`Main.ts CoreSignals.CoreInitialized! signal.idToken: ${signal.idToken}`);
	UserAPI.InitAsync();
});

CoreSignals.UserServiceInitialized.Connect(async () => {
	await FriendAPI.InitAsync();

	const curUser = UserAPI.GetCurrentUser();
	print(
		`Main.ts CoreSignals.UserServiceInitialized! curUser?.discriminatedUsername: ${curUser?.discriminatedUsername}`,
	);

	const friends = await FriendAPI.GetFriendsAsync();
	print(`Main.ts CoreSignals.UserServiceInitialized! friends: ${encode(friends)}`);
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
	//EasyCore.InitAsync();
}
