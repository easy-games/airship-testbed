const DefaultCameraMask = LayerMask.InvertMask(
	LayerMask.GetMask(
		"TransparentFX",
		"Ignore Raycast",
		"Character",
		"Water",
		"UI",
		"WorldUI",
		"ViewModel",
		"VisuallyHidden",
		"IgnoreCollision",
		"AvatarEditor",
	),
);

export default DefaultCameraMask;
