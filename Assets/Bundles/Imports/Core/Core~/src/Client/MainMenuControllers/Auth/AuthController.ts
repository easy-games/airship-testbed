import { Controller, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { decode, encode } from "Shared/json";
import { FirebaseSignUpResponse, FirebaseTokenResponse } from "./API/FirebaseAPI";

@Controller({ loadOrder: -1 })
export class AuthController implements OnStart {
	private apiKey = "AIzaSyB04k_2lvM2VxcJqLKD6bfwdqelh6Juj2o";
	private appId = "1:987279961241:web:944327bc9353f4f1f15c08";

	OnStart(): void {
		this.TryAutoLogin();
	}

	public TryAutoLogin(): boolean {
		const existingRefreshToken = StateManager.GetString("firebase_refreshToken");
		if (existingRefreshToken) {
			print("Found refresh token in state. Attempting login...");
			return this.LoginWithRefreshToken(existingRefreshToken);
		}

		const savedAuthAccount = AuthManager.GetSavedAccount();
		if (savedAuthAccount) {
			print("Found saved auth account on disk. Attempting login...");
			return this.LoginWithRefreshToken(savedAuthAccount.refreshToken);
		}

		return this.SignUpAnon();
	}

	public LoginWithRefreshToken(refreshToken: string): boolean {
		// Exchange a refresh token for an ID token
		// https://firebase.google.com/docs/reference/rest/auth#section-refresh-token
		const res = HttpManager.PostAsync(
			`https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
			encode({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
			}),
		);
		const data = decode(res.data) as FirebaseTokenResponse;
		StateManager.SetString("firebase_idToken", data.id_token);
		StateManager.SetString("firebase_refreshToken", data.refresh_token);
		StateManager.SetString("firebase_localId", data.user_id);
		print("response: " + inspect(data));
		return true;
	}

	public SignUpAnon(): boolean {
		print("signing up...");
		const res = HttpManager.PostAsync(
			`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
			encode({
				returnSecureToken: true,
			}),
		);
		const data = decode(res.data) as FirebaseSignUpResponse;
		print("response: " + inspect(data));

		StateManager.SetString("firebase_idToken", data.idToken);
		StateManager.SetString("firebase_refreshToken", data.refreshToken);
		StateManager.SetString("firebase_localId", data.localId);

		AuthManager.SaveAuthAccount(data.refreshToken);

		return true;
	}
}
