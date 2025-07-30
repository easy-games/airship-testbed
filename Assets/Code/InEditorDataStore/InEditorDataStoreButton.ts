import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";

export enum InEditorDataStoreAction {
	TestCache = "TestCache",
	TestDataStore = "TestDataStore",
	TestLeaderboards = "TestLeaderboards",
}

const CACHE_SAMPLE_DEFAULT_TTL = 120;
const SAMPLE_TEST_DATA_KEY = "example";
const SAMPLE_TEST_DATA = { test: "data", testNumb: 2, testBool: true };
const SAMPLE_PRIMITIVE_TEST_DATA_KEY = "example:primitive";
const SAMPlE_PRIMITIVE_TEST_DATA = "test";

export default class InEditorDataStoreButton extends AirshipBehaviour {
	public prompt: ProximityPrompt;
	public action: InEditorDataStoreAction;

	protected override Awake(): void {
		Airship.Input.CreateAction(InEditorDataStoreAction.TestCache, Binding.Key(Key.Z));
		Airship.Input.CreateAction(InEditorDataStoreAction.TestDataStore, Binding.Key(Key.X));
		Airship.Input.CreateAction(InEditorDataStoreAction.TestLeaderboards, Binding.Key(Key.C));
	}

	protected override Start(): void {
		if (Game.IsClient()) {
			this.prompt.onActivated.Connect(() => {
				print(`[${this.gameObject.name}] Performing action: ${this.action}`);
				this.PerformAction();
			});
		}
	}

	private PerformAction(): void {
		switch (this.action) {
			case InEditorDataStoreAction.TestCache:
				this.TestCache().expect();
				break;
			case InEditorDataStoreAction.TestDataStore:
				this.TestDataStore().expect();
				break;
			case InEditorDataStoreAction.TestLeaderboards:
				this.TestLeaderboards().expect();
				break;
			default:
				print("Unknown action");
				break;
		}
	}

	private async TestCache(): Promise<void> {
		print("~~~ Testing cache store! ~~~");
		await Platform.Server.CacheStore.SetKey(
			SAMPLE_PRIMITIVE_TEST_DATA_KEY,
			SAMPlE_PRIMITIVE_TEST_DATA,
			CACHE_SAMPLE_DEFAULT_TTL,
		);
		const retrievedPrimitive = await Platform.Server.CacheStore.GetKey(SAMPLE_PRIMITIVE_TEST_DATA_KEY);
		print("Retrieved primitive from cache: " + retrievedPrimitive);

		await Platform.Server.CacheStore.DeleteKey(SAMPLE_PRIMITIVE_TEST_DATA_KEY);
		const retrievedPrimitivePostDelete = await Platform.Server.CacheStore.GetKey(SAMPLE_PRIMITIVE_TEST_DATA_KEY);
		print("Retrieved primitive post delete: " + retrievedPrimitivePostDelete);

		await Platform.Server.CacheStore.SetKey(SAMPLE_TEST_DATA_KEY, SAMPLE_TEST_DATA, CACHE_SAMPLE_DEFAULT_TTL);
		const retrieved = await Platform.Server.CacheStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Retrieved from cache: " + json.encode(retrieved));

		await Platform.Server.CacheStore.SetKeyTTL(SAMPLE_TEST_DATA_KEY, 1);
		print("Scheduling ttl test.");
		task.delayDetached(2, async () => {
			print(
				"Should be undefined due to ttl: " +
					tostring(await Platform.Server.CacheStore.GetKey(SAMPLE_TEST_DATA_KEY)),
			);
		});
	}

	private async TestDataStore(): Promise<void> {
		print("+++ Testing Data Store! +++");
		await Platform.Server.DataStore.SetKey(SAMPLE_TEST_DATA_KEY, SAMPLE_TEST_DATA);
		const retrieved = await Platform.Server.DataStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Retrieved basic: " + json.encode(retrieved));

		const retrievedGetAndSet = await Platform.Server.DataStore.GetAndSetKey<typeof SAMPLE_TEST_DATA>(
			SAMPLE_TEST_DATA_KEY,
			(data) => {
				if (!data) {
					print("Failed to get key after set.");
					return undefined;
				}
				data["testNumb"] = data["testNumb"] + 2;
				return data;
			},
		);
		print("Retrieved on function: " + json.encode(retrievedGetAndSet));

		await Platform.Server.DataStore.DeleteKey(SAMPLE_TEST_DATA_KEY);
		const retrievedDeleted = await Platform.Server.DataStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Retrieved post delete: " + retrievedDeleted);

		await Platform.Server.DataStore.SetKey(SAMPLE_TEST_DATA_KEY, SAMPLE_TEST_DATA);
		const retrievedPreDelete = await Platform.Server.DataStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Pre get and delete test: " + json.encode(retrievedPreDelete));
		await Platform.Server.DataStore.GetAndDeleteKey(SAMPLE_TEST_DATA_KEY, () => false);
		const retrievedPreDelete2 = await Platform.Server.DataStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Delete shouldn't happen: " + json.encode(retrievedPreDelete2));
		await Platform.Server.DataStore.GetAndDeleteKey(SAMPLE_TEST_DATA_KEY, () => true);
		const retrievedDeleted2 = await Platform.Server.DataStore.GetKey(SAMPLE_TEST_DATA_KEY);
		print("Delete should happen: " + retrievedDeleted2);
	}

	private async TestLeaderboards(): Promise<void> {
		print("### Testing Leaderboards ###");
		Platform.Server.Leaderboard.InEditorCreateLeaderboard({
			id: "example",
			operator: "USE_LATEST",
			sortOrder: "DESC",
		});
		await Platform.Server.Leaderboard.Update("example", {
			user1: 10,
			user2: 20,
			user3: 30,
			user4: 40,
			user5: 50,
		});
		const rankingsUseLatest1 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Use Latest Rankings: " + json.encode(rankingsUseLatest1));
		await Platform.Server.Leaderboard.Update("example", {
			user1: 50,
			user2: 40,
			user3: 30,
			user4: 20,
			user5: 10,
		});
		const rankingsUseLatest2 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Updated Use Latest Rankings: " + json.encode(rankingsUseLatest2));

		await Platform.Server.Leaderboard.DeleteEntry("example", "user5");
		const rankingsPostEntryDelete = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Rankings After user5 Delete: " + json.encode(rankingsPostEntryDelete));

		await Platform.Server.Leaderboard.DeleteEntries("example", ["user4", "user3"]);
		const rankingsPostEntriesDelete = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Rankings After user4, user3 Delete: " + json.encode(rankingsPostEntriesDelete));

		Platform.Server.Leaderboard.InEditorCreateLeaderboard({
			id: "example",
			operator: "ADD",
			sortOrder: "DESC",
		});
		print("Set leaderboard to ADD");

		await Platform.Server.Leaderboard.Update("example", {
			user1: 5,
			user2: 10,
			user3: 15,
		});
		const rankingsAdd1 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Add Rankings: " + json.encode(rankingsAdd1));

		await Platform.Server.Leaderboard.Update("example", {
			user1: 5,
			user2: -5,
			user3: -5,
		});
		const rankingsAdd2 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Updated Add Rankings: " + json.encode(rankingsAdd2));

		Platform.Server.Leaderboard.InEditorCreateLeaderboard({
			id: "example",
			operator: "SUB",
			sortOrder: "DESC",
		});
		print("Set leaderboard to SUB");

		await Platform.Server.Leaderboard.Update("example", {
			user1: 5,
			user2: 5,
			user3: 5,
			user4: 15,
		});
		const rankingsSub1 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Sub Rankings: " + json.encode(rankingsSub1));

		await Platform.Server.Leaderboard.Update("example", {
			user1: -5,
			user2: -5,
			user3: -5,
			user4: 5,
		});
		const rankingsSub2 = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Updated Sub Rankings: " + json.encode(rankingsSub2));

		Platform.Server.Leaderboard.InEditorCreateLeaderboard({
			id: "example",
			operator: "SET",
			sortOrder: "DESC",
		});
		print("Set leaderboard to SET");

		await Platform.Server.Leaderboard.Update("example", {
			user1: 40,
			user2: 35,
			user3: 20,
			user4: 15,
		});
		const rankingsSet = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Set Rankings: " + json.encode(rankingsSet));

		Platform.Server.Leaderboard.InEditorCreateLeaderboard({
			id: "example",
			operator: "SET",
			sortOrder: "ASC",
		});
		print("Flipping leaderboard sort order");

		const rankingsFlipped = await Platform.Server.Leaderboard.GetRankRange("example");
		print("Flipped Rankings: " + json.encode(rankingsFlipped));
	}
}
