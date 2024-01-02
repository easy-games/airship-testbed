import { LoadedMap } from "Server/Services/Match/Map/LoadedMap";

export class MapLoadEvent {
	constructor(public readonly loadedMap: LoadedMap) {}
}
