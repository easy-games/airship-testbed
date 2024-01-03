import { Signal } from "../../Util/Signal";
export declare class PreferredDriver {
    private static inst;
    private scheme;
    readonly schemeChanged: Signal<[scheme: string]>;
    private constructor();
    GetScheme(): string;
    /** **NOTE:** Internal only. Use `Preferred` class instead. */
    static Instance(): PreferredDriver;
}
