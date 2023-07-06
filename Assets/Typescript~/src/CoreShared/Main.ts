print(`CoreShared.Main.ts()`);

if (RunCore.IsClient()) {
	import("CoreClient/Main");
}
