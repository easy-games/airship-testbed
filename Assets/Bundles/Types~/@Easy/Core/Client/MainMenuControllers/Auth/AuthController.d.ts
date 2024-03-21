/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { Signal } from "../../../Shared/Util/Signal";
export declare class AuthController implements OnStart {
    private apiKey;
    private appId;
    private idToken;
    private authenticated;
    readonly onAuthenticated: Signal<void>;
    readonly onSignOut: Signal<void>;
    constructor();
    OnStart(): void;
    WaitForAuthed(): Promise<void>;
    TryAutoLogin(): boolean;
    LoginWithRefreshToken(refreshToken: string): boolean;
    SignUpAnon(): boolean;
    GetAuthHeaders(): string;
    IsAuthenticated(): boolean;
}
