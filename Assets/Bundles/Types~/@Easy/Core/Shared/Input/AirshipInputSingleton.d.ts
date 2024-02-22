import { OnStart } from "../Flamework";
export declare class AirshipInputSingleton implements OnStart {
    OnStart(): void;
    CreateButtonInput(name: string, defaultKey: KeyCode): void;
}
