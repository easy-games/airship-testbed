export interface AirshipGameServer {
	serverId: string;
	ip: string;
	port: number;
}

/**
 * Describes a successful transfer request.
 */
interface TransferSuccessResult {
	/** Indicates if the transfer was requested */
	transfersRequested: true;
	/** Indicates if the transfer is still pending. Pending transfers may take up to a few minutes to occur */
	pendingTransfer: boolean;
	/** The userIds that were transferred */
	userIds: string[];
}

/**
 * Describes a failed transfer request.
 */
interface TransferFailureResult {
	/** Indicates if the transfer was requested */
	transfersRequested: false;
	/** The reason for the failure to request a transfer */
	reason: string;
}

/**
 * Describes the result of a transfer request.
 */
export type TransferResult = TransferSuccessResult | TransferFailureResult;
