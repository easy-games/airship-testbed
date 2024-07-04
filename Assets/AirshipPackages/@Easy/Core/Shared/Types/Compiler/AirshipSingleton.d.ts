interface AirshipSingleton {}
declare abstract class AirshipSingleton extends AirshipBehaviour {
	public static Get<TThis>(this: TThis): TThis["prototype"];
}
