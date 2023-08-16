import { HeldItem } from "../HeldItem";
export declare class ProjectileLauncherHeldItem extends HeldItem {
    private chargeBin;
    private currentlyCharging;
    private startHoldTimeSec;
    private chargeAudioSource;
    private projectileTrajectoryRenderer;
    protected OnChargeStart(): void;
    private HasRequiredAmmo;
    protected TryChargeUse(): boolean;
    private CancelChargeSound;
    protected OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    OnUnEquip(): void;
    private GetLaunchData;
    private GetAimVector;
}
