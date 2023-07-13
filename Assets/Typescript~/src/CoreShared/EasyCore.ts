import Object from "@easy-games/unity-object-utils";
import { ApiHelper } from "./ApiHelper";
import { decode, encode } from "./Lib/json";
import { SIOEventNames } from "./SocketIOMessages/SOIEventNames";
import { Party } from "./SocketIOMessages/Party";
import { CoreSignals } from "./CoreSignals";

export class EasyCore {
	public static CoreApi: CoreApi;
	private static isInitialized: boolean;
	private static idToken: string | undefined;
	private static headersMap: Map<string, string>;
	private static coreUserData: CoreUserData | undefined;

	static async initAsync() {
		this.CoreApi = CoreApi.Instance;
		EasyCore.isInitialized = false;
		EasyCore.idToken = undefined;
		EasyCore.headersMap = new Map<string, string>();

		this.coreUserData = this.CoreApi.GetCoreUserData();

		if (this.CoreApi.IsInitialized) {
			if (!EasyCore.isInitialized) {
				//print(`postInit coreApi.IsInitialized`);
				EasyCore.postInit();
			}
		} else {
			await new Promise((resolve, reject) => {
				this.CoreApi.OnInitializedEvent(() => {
					//print(`EasyCore.OnInitializedEvent`);
					if (!EasyCore.isInitialized) {
						//print(`postInit coreApi.OnInitializedEvent()`);
						EasyCore.postInit();
					}

					resolve("");
				});
			});
		}
	}

	// async getEncodedHeadersAsync(): Promise<string> {
	// 	const promise = new Promise<string>((resolve, reject) => {
	// 		const onComplete_GetUserToken = CoreApi.Instance.IdToken;
	// 		onComplete_GetUserToken.OnCompleteEvent((operationResult) => {
	// 			if (operationResult.IsSuccess) {
	// 				resolve(operationResult.ReturnString);
	// 			} else {
	// 				reject(operationResult.ReturnString);
	// 			}
	// 		});
	// 	});

	// 	return promise;
	// }

	// async getHeadersMapAsync(): Promise<Map<string, string>> {
	// 	const promise = new Promise<Map<string, string>>((resolve, reject) => {
	// 		const onComplete_GetUserToken = CoreApi.Instance.GetUserTokenAsync(true);
	// 		onComplete_GetUserToken.OnCompleteEvent((operationResult) => {
	// 			if (operationResult.IsSuccess) {
	// 				const map = new Map<string, string>();
	// 				map.set(
	// 					ApiHelper.AUTH_HEADER_NAME,
	// 					`${ApiHelper.AUTH_HEADER_VALUE_PREFIX}${operationResult.ReturnString}`,
	// 				);
	// 				resolve(map);
	// 			} else {
	// 				reject(operationResult.ReturnString);
	// 			}
	// 		});
	// 	});

	// 	return promise;
	// }

	static getHeadersMap(): Map<string, string> {
		return this.headersMap;
	}

	static getCoreUserData(): CoreUserData | undefined {
		return this.coreUserData;
	}

	static async getAsync<T>(
		url: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<T> {
		const encodedParams = this.getEncodedMap(params);
		const encodedHeaders = this.getEncodedMap(headers);

		print(`getAsync() url: ${url}, encodedParams: ${encodedParams}, encodedHeaders: ${encodedHeaders}`);

		const result = new Promise<T>((resolve, reject) => {
			const onCompleteHook = this.CoreApi.SendAsync(url, "get", "", encodedParams, encodedHeaders);
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

	static getEncodedMap(map: Map<string, string> | undefined): string {
		const result = map ? encode(map) : "";

		//print(`getEncodedMap() result: ${result}`);

		return result;
	}

	static postInit() {
		if (!this.isInitialized) {
			// print(
			// 	`postInit() this.isInitialized: ${this.isInitialized}, isClient: ${RunCore.IsClient()}, ${Time.time}}`,
			// );

			this.isInitialized = true;

			this.CoreApi.OnIdTokenChangedEvent((idToken) => {
				this.idToken = idToken;
			});

			this.setIdToken(this.CoreApi.IdToken);

			if (RunCore.IsClient()) {
				this.CoreApi.OnGameCoordinatorEvent((messageName, message) => {
					//print(`postInit.OnGameCoordinatorMessage() messageName: ${messageName}, message: ${message}`);

					const deserialized = decode(message);

					switch (messageName) {
						case SIOEventNames.connect:
							break;
						case SIOEventNames.connect_error:
							break;
						case SIOEventNames.exception:
							break;
						case SIOEventNames.statusUpdateRequest:
							break;
						case SIOEventNames.friendRequest:
							break;
						case SIOEventNames.friendAccepted:
							break;
						case SIOEventNames.friendStatusUpdateMulti:
							break;
						case SIOEventNames.partyInvite:
							break;
						case SIOEventNames.partyUpdate:
							//print(`partyUpdate - eventReceived. data: ${encode((deserialized as object[])[0] as Party)}`);
							break;
						default:
							print(`Unsupported messageName encountered: ${messageName}`);
							break;
					}
				});

				const onCompleteHook = this.CoreApi.InitializeGameCoordinatorAsync();

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

	private static setIdToken(newIdToken: string) {
		this.idToken = newIdToken;
		this.headersMap.set(ApiHelper.AUTH_HEADER_NAME, `${ApiHelper.AUTH_HEADER_VALUE_PREFIX}${this.idToken}`);
	}
}
