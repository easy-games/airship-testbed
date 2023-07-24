import { ApiHelper } from "./ApiHelper";
import { decode, encode } from "./Lib/json";
import { CoreSignals } from "./CoreSignals";

export class EasyCore {
	public static EasyCoreAPI: EasyCoreAPI;
	private static isInitialized: boolean;
	private static idToken: string | undefined;
	private static headersMap: Map<string, string>;
	private static coreUserData: CoreUserData | undefined;

	static async InitAsync() {
		this.EasyCoreAPI = EasyCoreAPI.Instance;
		EasyCore.isInitialized = false;
		EasyCore.idToken = undefined;
		EasyCore.headersMap = new Map<string, string>();

		this.coreUserData = this.EasyCoreAPI.GetCoreUserData();

		if (this.EasyCoreAPI.IsInitialized) {
			if (!EasyCore.isInitialized) {
				//print(`postInit coreApi.IsInitialized`);
				EasyCore.PostInit();
			}
		} else {
			await new Promise((resolve, reject) => {
				this.EasyCoreAPI.OnInitializedEvent(() => {
					//print(`EasyCore.OnInitializedEvent`);
					if (!EasyCore.isInitialized) {
						//print(`postInit coreApi.OnInitializedEvent()`);
						EasyCore.PostInit();
					}

					resolve("");
				});
			});
		}
	}

	static GetHeadersMap(): Map<string, string> {
		return this.headersMap;
	}

	static GetCoreUserData(): CoreUserData | undefined {
		return this.coreUserData;
	}

	static async GetAsync<T>(
		url: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<T> {
		const encodedParams = this.GetEncodedMap(params);
		const encodedHeaders = this.GetEncodedMap(headers);

		print(`GetAsync() url: ${url}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`);

		const result = new Promise<T>((resolve, reject) => {
			const onCompleteHook = this.EasyCoreAPI.SendAsync(url, "get", "", encodedParams, encodedHeaders);
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve(decode<T>(operationResult.ReturnString));
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});

		return result;
	}

	static Post(
		url: string,
		body: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	) {
		const encodedParams = this.GetEncodedMap(params);
		const encodedHeaders = this.GetEncodedMap(headers);

		print(`Post() url: ${url}, body: ${body}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`);

		this.EasyCoreAPI.SendAsync(url, "post", body, encodedParams, encodedHeaders);
	}

	static async PostAsync<T>(
		url: string,
		body: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<T> {
		const encodedParams = this.GetEncodedMap(params);
		const encodedHeaders = this.GetEncodedMap(headers);

		print(
			`PostAsync() url: ${url}, body: ${body}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`,
		);

		return new Promise<T>((resolve, reject) => {
			const onCompleteHook = this.EasyCoreAPI.SendAsync(url, "post", body, encodedParams, encodedHeaders);
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve(decode<T>(operationResult.ReturnString));
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});
	}

	static async PatchAsync(
		url: string,
		body: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<void> {
		const encodedParams = this.GetEncodedMap(params);
		const encodedHeaders = this.GetEncodedMap(headers);

		print(
			`PatchAsync() url: ${url}, body: ${body}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`,
		);

		return new Promise<void>((resolve, reject) => {
			const onCompleteHook = this.EasyCoreAPI.SendAsync(url, "patch", body, encodedParams, encodedHeaders);
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve();
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});
	}

	static async DeleteAsync<T>(
		url: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<void> {
		const encodedParams = this.GetEncodedMap(params);
		const encodedHeaders = this.GetEncodedMap(headers);

		print(`DeleteAsync() url: ${url}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`);

		return new Promise<void>((resolve, reject) => {
			const onCompleteHook = this.EasyCoreAPI.SendAsync(url, "delete", "", encodedParams, encodedHeaders);
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve();
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});
	}

	static async EmitAsync(eventName: string, jsonEvent: string | undefined = undefined) {
		print(`EmitAsync() eventName: ${eventName}, jsonEvent: ${jsonEvent}`);

		return new Promise<void>((resolve, reject) => {
			const onCompleteHook = this.EasyCoreAPI.EmitAsync(eventName, jsonEvent ?? "");
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve();
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});
	}

	private static GetEncodedMap(map: Map<string, string> | undefined): string {
		const result = map && !map.isEmpty() ? encode(map) : "";

		//print(`GetEncodedMap() result: ${result}`);

		return result;
	}

	private static PostInit() {
		if (!this.isInitialized) {
			// print(
			// 	`PostInit() this.isInitialized: ${this.isInitialized}, isClient: ${RunCore.IsClient()}, ${Time.time}}`,
			// );

			this.isInitialized = true;

			this.EasyCoreAPI.OnIdTokenChangedEvent((idToken) => {
				this.idToken = idToken;
			});

			this.SetIdToken(this.EasyCoreAPI.IdToken);

			if (RunCore.IsClient()) {
				this.EasyCoreAPI.OnGameCoordinatorEvent((messageName, jsonMessage) => {
					// print(
					// 	`postInit.OnGameCoordinatorMessage() messageName: ${messageName}, jsonMessage: ${jsonMessage}`,
					// );

					CoreSignals.GameCoordinatorMessage.Fire({ messageName: messageName, jsonMessage: jsonMessage });
				});

				const onCompleteHook = this.EasyCoreAPI.InitializeGameCoordinatorAsync();

				onCompleteHook.OnCompleteEvent((operationResult) => {
					if (operationResult.IsSuccess) {
						CoreSignals.CoreInitialized.Fire({ idToken: this.idToken! });
					} else {
						print(`Unable to initialize Game Coordinator! error: ${operationResult.ReturnString}`);
					}
				});
			} else {
				CoreSignals.CoreInitialized.Fire({ idToken: this.idToken! });
			}
		}
	}

	private static SetIdToken(newIdToken: string) {
		this.idToken = newIdToken;
		this.headersMap.set(ApiHelper.AUTH_HEADER_NAME, `${ApiHelper.AUTH_HEADER_VALUE_PREFIX}${this.idToken}`);
	}
}
