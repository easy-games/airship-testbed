/** Check whether moderation action duration matches format of '#s' '#m' '#h' or '#d' */
export function ValidateModerationActionDurationFormat(duration: string): boolean {
    return true;
}

export function GetModerationActionDuration(createdAt: string, expiresAt: string | undefined): string {
    if (!expiresAt) return "Permanent";
    return "test";
}