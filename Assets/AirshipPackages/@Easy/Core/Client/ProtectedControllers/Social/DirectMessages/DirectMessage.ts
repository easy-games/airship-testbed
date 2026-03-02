export interface DirectMessage {
	text: string;
	sender: string;
	sentAt: number;
}

export interface DirectMessageWithFilterResult extends DirectMessage {
	filterResult: {
		messageBlocked: boolean;
		transformedMessage: string | undefined;
	};
}
