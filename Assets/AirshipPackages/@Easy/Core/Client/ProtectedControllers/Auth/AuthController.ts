import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { FirebaseSignUpResponse, FirebaseTokenResponse } from "./API/FirebaseAPI";

declare const AirshipPlatformUrl: {
	firebaseApiKey: string;
};

@Controller({ loadOrder: -1 })
export class AuthController {
	private apiKey = AirshipPlatformUrl.firebaseApiKey;
	private idToken = "";
	private authenticated = false;
	public readonly onAuthenticated = new Signal<void>();
	public readonly onSignOut = new Signal<void>();

	constructor() {
		contextbridge.callback("AuthController:IsAuthenticated", () => {
			return this.IsAuthenticated();
		});
	}

	protected OnStart(): void {
		const loginResult = this.TryAutoLogin();
		if (!loginResult) {
			let ignore = false;
			if (Game.coreContext === CoreContext.GAME && RunUtil.IsEditor()) {
				ignore = true;
			}
			if (!ignore) {
				Bridge.LoadScene("Login", true, LoadSceneMode.Single);
			}
		}

		// auto login every 30 mins
		task.spawn(() => {
			while (true) {
				task.wait(30 * 60);
				const refreshToken = StateManager.GetString("firebase_refreshToken");
				if (refreshToken) {
					task.spawn(() => {
						const res = this.LoginWithRefreshToken(refreshToken);
					});
				}
			}
		});
	}

	public async WaitForAuthed(): Promise<void> {
		if (this.authenticated) {
			return;
		}
		return new Promise<void>((resolve) => {
			this.onAuthenticated.Wait();
			resolve();
		});
	}

	public TryAutoLogin(): boolean {
		if (Game.IsClone()) {
			return this.SignUpAnon();
		}

		const existingRefreshToken = StateManager.GetString("firebase_refreshToken");
		if (existingRefreshToken) {
			return this.LoginWithRefreshToken(existingRefreshToken);
		}

		const savedAuthAccount = AuthManager.GetSavedAccount();
		if (savedAuthAccount) {
			return this.LoginWithRefreshToken(savedAuthAccount.refreshToken);
		}

		return false;
		// return this.SignUpAnon();
	}

	public LoginWithRefreshToken(refreshToken: string): boolean {
		// Exchange a refresh token for an ID token
		// https://firebase.google.com/docs/reference/rest/auth#section-refresh-token
		const res = HttpManager.PostAsync(
			`https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
			EncodeJSON({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
			}),
		);
		if (res.success) {
			const data = DecodeJSON(res.data) as FirebaseTokenResponse;
			this.idToken = data.id_token;
			InternalHttpManager.SetAuthToken(data.id_token);
			StateManager.SetString("firebase_idToken", data.id_token);
			StateManager.SetString("firebase_refreshToken", data.refresh_token);
			StateManager.SetString("firebase_localId", data.user_id);
			this.authenticated = true;
			this.onAuthenticated.Fire();
			contextbridge.broadcast("AuthController:OnAuthenticated");
			return true;
		}
		print("failed login with refresh token: " + res.error + " statusCode=" + res.statusCode);
		return false;
	}

	public SignUpAnon(): boolean {
		print("signing up...");
		const res = HttpManager.PostAsync(
			`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
			EncodeJSON({
				returnSecureToken: true,
			}),
		);
		if (res.success) {
			const data = DecodeJSON(res.data) as FirebaseSignUpResponse;

			this.idToken = data.idToken;
			InternalHttpManager.SetAuthToken(data.idToken);
			StateManager.SetString("firebase_idToken", data.idToken);
			StateManager.SetString("firebase_refreshToken", data.refreshToken);
			StateManager.SetString("firebase_localId", data.localId);
			this.authenticated = true;
			this.onAuthenticated.Fire();
			contextbridge.broadcast("AuthController:OnAuthenticated");

			if (!RunUtil.IsClone()) {
				AuthManager.SaveAuthAccount(data.refreshToken);
			}
			return true;
		}
		print("failed signup up anon: " + res.error);
		return false;
	}

	public GetAuthHeaders(): string {
		return "Authorization=Bearer " + this.idToken;
	}

	public IsAuthenticated(): boolean {
		return this.authenticated;
	}
}
