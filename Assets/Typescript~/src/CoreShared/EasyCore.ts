import Object from "@easy-games/unity-object-utils";
import { ApiHelper } from "./ApiHelper";
import { decode, encode } from "./Lib/json";
import { SIOEventNames } from "./SocketIOMessages/SOIEventNames";
import { Party } from "./SocketIOMessages/Party";

export class EasyCore {
	private isInitialized: boolean;

	constructor() {
		this.isInitialized = false;

		const coreApi = CoreApi.Instance;
		const userData = coreApi.GetCoreUserData();

		const onComplete_GetUserToken = coreApi.GetUserTokenAsync(true);

		const getUserProfile = (encodedHeaders: string) => {
			const onComplete = coreApi.SendAsync(
				`${ApiHelper.USER_SERVICE_URL}/users/self`,
				"get",
				"",
				"",
				encodedHeaders,
			);

			onComplete.OnCompleteEvent((operationResult) => {
				// print(
				// 	`getUserProfile.OnCompleteEvent() operationResult.IsSuccess: ${operationResult.IsSuccess}, operationResult.ReturnString: ${operationResult.ReturnString}`,
				// );
			});
		};

		onComplete_GetUserToken.OnCompleteEvent((operationResult) => {
			// print(
			// 	`onComplete_GetUserToken.OnCompleteEvent() operationResult.IsSuccess: ${operationResult.IsSuccess}, operationResult.ReturnString: ${operationResult.ReturnString}`,
			// );

			if (operationResult.IsSuccess) {
				if (coreApi.IsInitialized) {
					if (!this.isInitialized) {
						//print(`postInit coreApi.IsInitialized`);
						this.postInit();
					}
				} else {
					coreApi.OnInitializedEvent(() => {
						if (!this.isInitialized) {
							//print(`postInit coreApi.OnInitializedEvent()`);
							this.postInit();
						}
					});
				}
			} else {
				Debug.LogError(`Unable to get user auth token.`);
			}
		});
	}

	async getEncodedHeadersAsync(): Promise<string> {
		const promise = new Promise<string>((resolve, reject) => {
			const onComplete_GetUserToken = CoreApi.Instance.GetUserTokenAsync(true);
			onComplete_GetUserToken.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve(operationResult.ReturnString);
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});

		return promise;
	}

	async getHeadersMapAsync(): Promise<Map<string, string>> {
		const promise = new Promise<Map<string, string>>((resolve, reject) => {
			const onComplete_GetUserToken = CoreApi.Instance.GetUserTokenAsync(true);
			onComplete_GetUserToken.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					const map = new Map<string, string>();
					map.set(
						ApiHelper.AUTH_HEADER_NAME,
						`${ApiHelper.AUTH_HEADER_VALUE_PREFIX}${operationResult.ReturnString}`,
					);
					resolve(map);
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});

		return promise;
	}

	async getAsync<T>(
		url: string,
		params: Map<string, string> | undefined = undefined,
		headers: Map<string, string> | undefined = undefined,
	): Promise<T> {
		const encodedParams = this.getEncodedMap(params);
		const encodedHeaders = this.getEncodedMap(headers);

		const result = new Promise<T>((resolve, reject) => {
			const onCompleteHook = CoreApi.Instance.SendAsync(url, "get", "", encodedParams, encodedHeaders);
			onCompleteHook.OnCompleteEvent((operationResult) => {
				if (operationResult.IsSuccess) {
					resolve(decode<T>(operationResult.ReturnString));
				} else {
					reject(operationResult.ReturnString);
				}
			});
		});

		return (await result) as T;
	}

	getEncodedMap(map: Map<string, string> | undefined): string {
		const result = map ? encode(map) : "";

		//print(`getEncodedMap() result: ${result}`);

		return result;
	}

	postInit() {
		if (!this.isInitialized) {
			// print(
			// 	`postInit() this.isInitialized: ${this.isInitialized}, isClient: ${RunCore.IsClient()}, ${Time.time}}`,
			// );

			this.isInitialized = true;

			const coreApi = CoreApi.Instance;
			const eventNameObj = encode(Object.values(SIOEventNames));
			const onMessageHook = coreApi.SubscribeToEvents(eventNameObj);
			onMessageHook.OnEventReceived((messageName, message) => {
				//print(`postInit.eventReceived() messageName: ${messageName}, message: ${message}`);
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

			const initGCHook = coreApi.InitializeGameCoordinatorAsync();
			initGCHook.OnCompleteEvent((operationResult) => {
				// print(
				// 	`postInit.initGCHook.OnCompleteEvent() operationResult.IsSuccess: ${operationResult.IsSuccess}, operationResult.ReturnString: ${operationResult.ReturnString}`,
				// );
			});
		}
	}
}
