import { Dependency } from "@easy-games/flamework-core";
import { CollectionManagerService } from "./CollectionManagerService";

/** Utility for fetching `CollectionManagerService` in a shared context. */
export function FetchDependency(): CollectionManagerService {
	return Dependency<CollectionManagerService>();
}
