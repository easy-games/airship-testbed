import { Dependency } from "@easy-games/flamework-core";
import { CollectionManagerController } from "./CollectionManagerController";

/** Utility for fetching `CollectionManagerController` in a shared context. */
export function FetchDependency(): CollectionManagerController {
	return Dependency<CollectionManagerController>();
}
