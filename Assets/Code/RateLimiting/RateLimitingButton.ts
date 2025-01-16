import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryConfig, HttpRetry } from "@Easy/Core/Shared/Http/HttpRetry";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";

export enum RateLimitingAction {
    CallNonRateLimited = "CallNonRateLimited",
    CallRateLimited5Seconds = "CallRateLimited5Seconds",
    CallRateLimited10Seconds = "CallRateLimited10Seconds",
    CallRateLimited30Seconds = "CallRateLimited30Seconds",
}

const RateLimitConfig: HttpRetryConfig = {
    retryKey: "RateLimitDemo",
}

const NonRateLimited: () => HttpResponse = () => {
    return {
        statusCode: 200,
        data: '',
        success: true,
        error: '',
        headers: undefined as any as CSDictionary<string, string>,

        GetHeader() {
            return '';
        },
    }
};

const RateLimitedXSeconds: (seconds: number) => () => HttpResponse = (seconds) => {
    let switcher = false;
    return () => {
        switcher = !switcher;

        return {
            statusCode: switcher ? 429 : 200,
            data: '',
            success: !switcher,
            error: '',
            headers: undefined as any as CSDictionary<string, string>,

            GetHeader(header: string) {
                switch (header) {
                    case "Retry-After":
                        return switcher ? `${seconds}` : '';
                    default:
                        return '';
                }
            },
        }
    };
};

let syncValue = 0;

export default class RateLimitingButton extends AirshipBehaviour {
    public prompt: ProximityPrompt;
    public action: RateLimitingAction;

    protected override Awake(): void {
        Airship.Input.CreateAction(RateLimitingAction.CallNonRateLimited, Binding.Key(Key.Z));
        Airship.Input.CreateAction(RateLimitingAction.CallRateLimited5Seconds, Binding.Key(Key.X));
        Airship.Input.CreateAction(RateLimitingAction.CallRateLimited10Seconds, Binding.Key(Key.C));
        Airship.Input.CreateAction(RateLimitingAction.CallRateLimited30Seconds, Binding.Key(Key.V));
    }

    protected override Start(): void {
        if (Game.IsClient()) {
            this.prompt.onActivated.Connect(() => {
                print(`[${this.gameObject.name}] Performing action: ${this.action}`);
                this.PerformAction();
            });
        }
    }

    private PerformAction(): void {
        switch (this.action) {
            case RateLimitingAction.CallNonRateLimited:
                this.CallNonRateLimited().expect();
                break;
            case RateLimitingAction.CallRateLimited5Seconds:
                this.CallRateLimited5Seconds().expect();
                break;
            case RateLimitingAction.CallRateLimited10Seconds:
                this.CallRateLimited10Seconds().expect();
                break;
            case RateLimitingAction.CallRateLimited30Seconds:
                this.CallRateLimited30Seconds().expect();
                break;
            default:
                print("Unknown action");
                break;
        }
    }

    private async CallNonRateLimited(): Promise<void> {
        const me = syncValue;
        syncValue++;
        print(`<-> (${me}) Enter "RateLimitingButton#CallNotRateLimited" <->`); 
        await HttpRetry(NonRateLimited, RateLimitConfig);
        print(`=== (${me}) Exit "RateLimitingButton#CallNotRateLimited" ===`); 
    }

    private async CallRateLimited5Seconds(): Promise<void> {
        const me = syncValue;
        syncValue++;
        print(`<-> (${me}) Enter "RateLimitingButton#CallRateLimited5Seconds" <->`); 
        await HttpRetry(RateLimitedXSeconds(5), RateLimitConfig);
        print(`=== (${me}) Exit "RateLimitingButton#CallRateLimited5Seconds" ===`);
    }

    private async CallRateLimited10Seconds(): Promise<void> {
        const me = syncValue;
        syncValue++;
        print(`<-> (${me}) Enter "RateLimitingButton#CallRateLimited10Seconds" <->`); 
        await HttpRetry(RateLimitedXSeconds(10), RateLimitConfig);
        print(`=== (${me}) Exit "RateLimitingButton#CallRateLimited10Seconds" ===`);
    }

    private async CallRateLimited30Seconds(): Promise<void> {
        const me = syncValue;
        syncValue++;
        print(`<-> (${me}) Enter "RateLimitingButton#CallRateLimited30Seconds" <->`); 
        await HttpRetry(RateLimitedXSeconds(30), RateLimitConfig);
        print(`=== (${me}) Exit "RateLimitingButton#CallRateLimited30Seconds" ===`);
    }
}