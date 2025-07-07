import { OnStart, Singleton } from "../../Flamework";
import { Protected } from "../../Protected";
import { Bin } from "../../Util/Bin";
import { Signal } from "../../Util/Signal";

@Singleton()
export class ProtectedCacheSingleton implements OnStart {
	private onTextureDownloaded = new Signal<[url: string, texture: Texture2D]>();
	private urlCache = new Map<string, Texture2D>();
	private inProgressDownloads = new Set<string>();

	constructor() {
		Protected.Cache = this;
	}

	public async DownloadImage(url: string): Promise<Texture2D> {
		if (this.urlCache.has(url)) {
			return this.urlCache.get(url)!;
		}

		if (this.inProgressDownloads.has(url)) {
			return new Promise((res, rej) => {
				const bin = new Bin();
				bin.Add(
					this.onTextureDownloaded.Connect((doneUrl, tex) => {
						if (url === doneUrl) {
							bin.Clean();
							res(tex);
						}
					}),
				);
			});
		}

		this.inProgressDownloads.add(url);
		const tex = Bridge.DownloadTexture2DYielding(url);
		this.inProgressDownloads.delete(url);
		this.urlCache.set(url, tex);
		task.spawn(() => {
			this.onTextureDownloaded.Fire(url, tex);
		});
		return tex;
	}

	OnStart(): void {}
}
