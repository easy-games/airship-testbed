export class InputActionEvent {
	constructor(
		public readonly bindingName: string,
		public readonly uiProcessed: boolean,
	) {}
}
