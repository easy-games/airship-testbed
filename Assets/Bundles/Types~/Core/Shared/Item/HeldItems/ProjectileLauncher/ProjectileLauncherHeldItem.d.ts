import { HeldItem } from "../HeldItem";
export declare class ProjectileLauncherHeldItem extends HeldItem {
    private chargeBin;
    private startHoldTimeSec;
    private chargeAudioSource;
    private projectileTrajectoryRenderer;
    protected OnChargeStart(): void;
    private HasRequiredAmmo;
    protected OnChargeEnd(): void;
    private CancelChargeSound;
    protected OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    private GetLaunchData;
    private GetAimVector;
}
