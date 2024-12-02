import { Singleton } from "@Easy/Core/Shared/Flamework";

interface BlockedGame {
	id: string;
	name: string;
}

interface BlockedUser {
	uid: string;
	username: string;
}

interface BlockListFile {
	games: BlockedGame[];
	users: BlockedUser[];
}

@Singleton({})
export class MainMenuBlockSingleton {
	public blockedGameIds = new Set<string>();
	public blockedGames: BlockedGame[] = [];

	public blockedUserIds = new Set<string>();
	public blockedUsers: BlockedUser[] = [];

	protected OnStart(): void {
		const blockListContents = DiskManager.ReadFileAsync("BlockList.json");
		if (blockListContents && blockListContents !== "") {
			const data = json.decode<BlockListFile>(blockListContents);
			for (let game of data.games) {
				this.blockedGameIds.add(game.id);
				this.blockedGames.push(game);
			}
			for (let user of data.users) {
				this.blockedUserIds.add(user.uid);
				this.blockedUsers.push(user);
			}
		}
	}

	public BlockGameAsync(gameId: string, gameName: string): void {
		if (!this.blockedGameIds.has(gameId)) {
			this.blockedGameIds.add(gameId);
			this.blockedGames.push({
				id: gameId,
				name: gameName,
			});
			this.SaveToDisk();
		}
	}

	public UnblockGameAsync(gameId: string): void {
		if (this.blockedGameIds.delete(gameId)) {
			this.blockedGames = this.blockedGames.filter((g) => g.id !== gameId);
			this.SaveToDisk();
		}
	}

	public IsGameIdBlocked(gameId: string): boolean {
		return this.blockedGameIds.has(gameId);
	}

	public BlockUserAsync(uid: string, username: string): void {
		if (!this.blockedUserIds.has(uid)) {
			this.blockedUserIds.add(uid);
			this.blockedUsers.push({
				uid,
				username,
			});
			this.SaveToDisk();
		}
	}

	public UnblockUserAsync(uid: string): void {
		if (this.blockedUserIds.delete(uid)) {
			this.blockedUsers = this.blockedUsers.filter((g) => g.uid !== uid);
			this.SaveToDisk();
		}
	}

	public IsUserIdBlocked(uid: string): boolean {
		return this.blockedUserIds.has(uid);
	}

	private SaveToDisk(): void {
		let data: BlockListFile = {
			games: this.blockedGames,
			users: this.blockedUsers,
		};
		DiskManager.WriteFileAsync("BlockList.json", json.encode(data));
	}
}
