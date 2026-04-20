/** Check whether moderation action duration matches format of '#s' '#m' '#h' or '#d' */
export function ValidateModerationActionDurationFormat(duration: string): boolean {
    return string.match(duration, "^%d+[smhd]$")[0] !== undefined;
}

export function GetModerationActionDuration(createdAt: string, expiresAt: string | undefined): string {
    if (!expiresAt) return "Permanent";

    const totalSeconds = DateTime.fromISO(expiresAt).TimestampSeconds - DateTime.fromISO(createdAt).TimestampSeconds;

    const days = math.floor(totalSeconds / 86400);
    const hours = math.floor((totalSeconds % 86400) / 3600);
    const minutes = math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.size() === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
}

export enum GameModerationCommand {
    KICK = "modkick",
    TEMPBAN = "tempban",
    BAN = "ban",
    TEMPMUTE = "tempmute",
    MUTE = "mute",
    NOTE = "note",
    UNBAN = "unban",
    UNMUTE = "unmute",
    LOOKUP = "modlookup"
}