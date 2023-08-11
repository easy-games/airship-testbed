export declare class PartyAPI {
    private static partyData;
    private static partyInvites;
    static InitAsync(): Promise<void>;
    static InviteToParty(userId: string): void;
    static JoinParty(partyId: string): void;
    static RemoveFromParty(userId: string): void;
    static JoinQueue(queueId: string, regions: string[]): void;
    static LeaveQueue(): void;
}
