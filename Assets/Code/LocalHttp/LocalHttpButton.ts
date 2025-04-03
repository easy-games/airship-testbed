import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";

const LOCAL_URL = "http://localhost:3000";

export enum LocalHttpAction {
    Get = "Get",
    Post = "Post",
    Patch = "Patch",
    Put = "Put",
    Delete = "Delete",
}

export default class LocalHttpButton extends AirshipBehaviour {
    public prompt: ProximityPrompt;
    public action: LocalHttpAction;

    protected override Awake(): void {
        Airship.Input.CreateAction(LocalHttpAction.Get, Binding.Key(Key.Z));
        Airship.Input.CreateAction(LocalHttpAction.Post, Binding.Key(Key.X));
        Airship.Input.CreateAction(LocalHttpAction.Patch, Binding.Key(Key.C));
        Airship.Input.CreateAction(LocalHttpAction.Put, Binding.Key(Key.V));
        Airship.Input.CreateAction(LocalHttpAction.Delete, Binding.Key(Key.B));
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
            case LocalHttpAction.Get:
                this.GetLocalHttp().expect();
                break;
            case LocalHttpAction.Post:
                this.PostLocalHttp().expect();
                break;
            case LocalHttpAction.Patch:
                this.PatchLocalHttp().expect();
                break;
            case LocalHttpAction.Put:
                this.PutLocalHttp().expect();
                break;
            case LocalHttpAction.Delete:
                this.DeleteLocalHttp().expect();
                break;
            default:
                print("Unknown action");
                break;
        }
    }

    private async GetLocalHttp(): Promise<void> {
        const resp = HttpManager.GetAsync(LOCAL_URL);
        print("Get called...", resp.statusCode, resp.success, resp.data, resp.error);
    }

    private async PostLocalHttp(): Promise<void> {
        const resp = HttpManager.PostAsync(LOCAL_URL, "{}");
        print("Post called...", resp.statusCode, resp.success, resp.data, resp.error);
    }

    private async PatchLocalHttp(): Promise<void> {
        const resp = HttpManager.PatchAsync(LOCAL_URL, "{}");
        print("Patch called...", resp.statusCode, resp.success, resp.data, resp.error);
    }

    private async PutLocalHttp(): Promise<void> {
        const resp = HttpManager.PutAsync(LOCAL_URL, "{}");
        print("Put called...", resp.statusCode, resp.success, resp.data, resp.error);
    }

    private async DeleteLocalHttp(): Promise<void> {
        const resp = HttpManager.DeleteAsync(LOCAL_URL);
        print("Delete called...", resp.statusCode, resp.success, resp.data, resp.error);
    }
}