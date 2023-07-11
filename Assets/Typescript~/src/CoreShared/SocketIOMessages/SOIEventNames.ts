export enum SIOEventNames {
	connect = "connect",
	connect_error = "connect_error",
	exception = "exception",
	partyUpdate = "game-coordinator/party-update",
	partyInvite = "game-coordinator/party-invite",
	friendStatusUpdateMulti = "game-coordinator/friend-status-update-multi",
	statusUpdateRequest = "game-coordinator/status-update-request",
	friendRequest = "user-service/friend-requested",
	friendAccepted = "user-service/friend-accepted",
}
