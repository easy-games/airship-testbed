/// <reference no-default-lib="true"/>
type _DecoratorFilter<TClass, TType> = Omit<ExtractMembers<TClass, TType>, "enabled">;

declare function ShowIf<
	TClass extends AirshipBehaviour | AirshipScriptableObject,
	K extends keyof _DecoratorFilter<TClass, boolean | number | string>,
>(propertyName: K, ...matches: ReadonlyArray<TClass[K]>): AirshipDecorator<(target: TClass, property: string) => void>;

declare function HideIf<
	TClass extends AirshipBehaviour | AirshipScriptableObject,
	K extends keyof _DecoratorFilter<TClass, boolean | number | string>,
>(propertyName: K, ...matches: ReadonlyArray<TClass[K]>): AirshipDecorator<(target: TClass, property: string) => void>;
