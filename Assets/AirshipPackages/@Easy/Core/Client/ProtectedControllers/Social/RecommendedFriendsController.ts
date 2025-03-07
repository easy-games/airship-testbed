import { Controller, Dependency, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { ProtectedUserController } from "../Airship/User/UserController";
import { ProtectedFriendsController } from "./FriendsController";
import { MainMenuPartyController } from "./MainMenuPartyController";
import { SteamFriendsProtectedController } from "./SteamFriendsProtectedController";

interface RecommendedFriendsFile {
	recommendations: Map<string, RecommendedFriend>;
}

interface GameInfo {
	cachedName: string;
	id: string;
}

/** @internal */
export interface RecommendationContext {
	/** How many times you've seen this player */
	totalRecentEncounters: number;
	/** Exists if this is a steam friend (with their steam name) */
	steamFriend?: string;
	/** True if players have been in a party together */
	partyEncounter: boolean;
	/** List of games you've seen eachother in */
	gameEncounters: GameInfo[];
}

interface RecommendedFriend {
	username: string;
	// icon: string; // Cache this?
	// uid: string;

	lastSeen: number;

	context: RecommendationContext;
}

const MAX_RECOMMENDED_FRIENDS = 16;

@Controller({})
export class RecommendedFriendsController implements OnStart {
	private fileRequiresSave = false;
	private recommendedFriends: RecommendedFriendsFile = { recommendations: new Map() };

	private sortOutdated = true;
	private sortedRecommendations: { recommendation: RecommendedFriend; uid: string }[] = [];

	OnStart(): void {
		const fileText = DiskManager.ReadFileAsync("RecommendedFriends.json");
		if (fileText && fileText !== "") {
			this.recommendedFriends = json.decode<RecommendedFriendsFile>(fileText);
		}
		this.StartSavingLoop();

		let seenThisSession = new Set<string>();

		// Monitor players in game
		if (Game.IsInGame()) {
			Protected.ProtectedPlayers.ObservePlayers((p) => {
				const gameData = Game.WaitForGameData();

				if (Protected.User.localUser?.uid === p.userId) return;
				if (seenThisSession.has(p.userId)) return;
				// If we're way over max recommendations stop adding new users. Otherwise we'll purge when saving.
				if (this.recommendedFriends.recommendations.size() > MAX_RECOMMENDED_FRIENDS * 2) return;

				// Skip if already friends
				const friendsController = Dependency<ProtectedFriendsController>();
				if (friendsController.IsFriendsWith(p.userId)) return;
				if (friendsController.HasOutgoingFriendRequest(p.userId)) return;

				const rf = MapUtil.GetOrCreate(
					this.recommendedFriends.recommendations,
					p.userId,
					this.GetDefaultRecommendedFriend(p.username),
				);
				rf.lastSeen = os.time();

				if (!rf.context.gameEncounters.some((g) => g.id === gameData.id)) {
					rf.context.gameEncounters.push({
						cachedName: gameData.name,
						id: gameData.id,
					});
				}
				rf.context.totalRecentEncounters++;

				this.sortOutdated = true;
				this.fileRequiresSave = true;
			});
		}

		// Monitor party
		Dependency<MainMenuPartyController>().onPartyUpdated.Connect((newParty) => {
			const localUid = Protected.User.WaitForLocalUser().uid;
			const friendsController = Dependency<ProtectedFriendsController>();
			for (const member of newParty?.members ?? []) {
				if (member.uid === localUid) continue;
				if (seenThisSession.has(member.uid)) continue;

				// Skip if already friends
				if (friendsController.IsFriendsWith(member.uid)) continue;
				if (friendsController.HasOutgoingFriendRequest(member.uid)) continue;

				seenThisSession.add(member.uid);

				const rf = MapUtil.GetOrCreate(
					this.recommendedFriends.recommendations,
					member.uid,
					this.GetDefaultRecommendedFriend(member.username),
				);
				rf.lastSeen = os.time();
				rf.context.partyEncounter = true;
				rf.context.totalRecentEncounters++;

				this.sortOutdated = true;
				this.fileRequiresSave = true;
			}
		});
	}

	/** Will write recommended friends to file every 30s (if changed) */
	private StartSavingLoop() {
		task.spawn(() => {
			while (task.wait(30)) {
				if (!this.fileRequiresSave) continue;

				this.SaveFile();
			}
		});
	}

	public DeleteRecommendation(userId: string) {
		this.recommendedFriends.recommendations.delete(userId);
		this.sortOutdated = true;
		this.fileRequiresSave = true;
	}

	private TrimRecommendedFriends() {
		if (this.recommendedFriends.recommendations.size() < MAX_RECOMMENDED_FRIENDS) return;

		const sortedRecs = this.GetSortedRecommendations();
		for (let i = MAX_RECOMMENDED_FRIENDS; i < sortedRecs.size(); i++) {
			const toRemove = sortedRecs[i];
			this.recommendedFriends.recommendations.delete(toRemove.uid);
		}
		// Quick fix of sorted recs
		this.sortedRecommendations = this.sortedRecommendations.filter((v, i) => i < 30);
	}

	private SaveFile() {
		Profiler.BeginSample("Airship Write Recommended Friends");
		this.TrimRecommendedFriends();
		this.fileRequiresSave = false;
		DiskManager.WriteFileAsync("RecommendedFriends.json", json.encode(this.recommendedFriends));
		Profiler.EndSample();
	}

	private GetDefaultRecommendedFriend(username: string): RecommendedFriend {
		return {
			username,
			lastSeen: os.time(),
			context: {
				totalRecentEncounters: 0,
				partyEncounter: false,
				gameEncounters: [],
			},
		};
	}

	public GetSortedRecommendations() {
		if (this.sortOutdated) {
			this.sortedRecommendations = MapUtil.Entries(this.recommendedFriends.recommendations).mapFiltered(
				([uid, recommendation]) => {
					const friendsController = Dependency<ProtectedFriendsController>();
					if (friendsController.IsFriendsWith(uid)) return undefined;
					if (friendsController.HasOutgoingFriendRequest(uid)) return undefined;

					return {
						uid,
						recommendation,
					};
				},
			);

			const steamFriendsWithAirship = Dependency<SteamFriendsProtectedController>().GetSteamFriendsWithAirship();
			if (steamFriendsWithAirship) {
				for (const [uid, data] of steamFriendsWithAirship) {
					const friendsController = Dependency<ProtectedFriendsController>();
					if (friendsController.IsFriendsWith(uid)) continue; // Already friends
					if (friendsController.HasOutgoingFriendRequest(uid)) continue;

					const rec = this.GetDefaultRecommendedFriend(data.username);
					rec.context.steamFriend = data.steamName;

					this.sortedRecommendations.push({
						recommendation: rec,
						uid: uid,
					});
				}
			}

			const localUserId = Dependency<ProtectedUserController>().localUser?.uid;
			if (localUserId !== undefined) {
				this.sortedRecommendations = this.sortedRecommendations.filter((r) => {
					return r.uid !== localUserId;
				});
			}
			this.sortedRecommendations.sort((a, b) => {
				const aScore = this.GetRecommendationScore(a.recommendation);
				const bScore = this.GetRecommendationScore(b.recommendation);
				if (aScore === bScore) {
					// Go to alphabetical if scores are the same
					return a.recommendation.username < b.recommendation.username;
				}
				return aScore > bScore;
			});
			this.sortOutdated = false;
		}
		return this.sortedRecommendations;
	}

	private GetRecommendationScore(r: RecommendedFriend): number {
		if (r.context.steamFriend) {
			return math.huge;
		}

		// 300,000 means a party encounter will be stronger than a game encounter for a few days (because score is based on lastSeen in seconds)
		let score = r.context.partyEncounter ? 300_000 : 10_000;
		score *= r.context.totalRecentEncounters;
		score += r.lastSeen;
		return score;
	}
}
