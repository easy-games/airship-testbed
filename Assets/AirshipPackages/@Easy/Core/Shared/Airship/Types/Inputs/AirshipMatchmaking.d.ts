export interface JoinQueueDto {
    /** The id of the group that is joining the queue */
    groupId: string;
    /** The id of the queue that the group is joining */
    queueId: string;
    /** The userIds of the players that are joining the queue (this should match the userIds of the group) */
    members?: TicketMemberDTO[];
    /** Attributes for the group that are used by the rules configured for the queue. */
    attributes?: Record<string, unknown>;
}

export interface TicketMemberDTO {
    /** The userId of the player */
    uid: string;
    /** Attributes for the player that are used by the rules configured for the queue. */
    attributes: Record<string, unknown>;
}
