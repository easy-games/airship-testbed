import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { OnStart, Singleton } from "Shared/Flamework";

interface BlockedGame {
	id: string;
	name: string;
}

interface BlockListFile {
	games: BlockedGame[];
	users: string[];
}

@Singleton({})
export class MainMenuBlockSingleton implements OnStart {
	public blockedGameIds = new Set<string>();
	public blockedGames: BlockedGame[] = [];

	OnStart(): void {
		const blockListContents = DiskManager.ReadFileAsync("BlockList.json");
		if (blockListContents && blockListContents !== "") {
			const data = DecodeJSON<BlockListFile>(blockListContents);
			for (let game of data.games) {
				this.blockedGameIds.add(game.id);
				this.blockedGames.push(game);
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

	private SaveToDisk(): void {
		let data: BlockListFile = {
			games: this.blockedGames,
			users: [],
		};
		DiskManager.WriteFileAsync("BlockList.json", EncodeJSON(data));
	}
}
