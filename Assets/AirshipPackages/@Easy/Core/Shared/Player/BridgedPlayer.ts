/**
 * A player dto that is passed across the contextbridge.
 * @protected
 */
export interface BridgedPlayer {
	username: string;
	userId: string;
	profileImageId: string;
	clientId: number;
}
