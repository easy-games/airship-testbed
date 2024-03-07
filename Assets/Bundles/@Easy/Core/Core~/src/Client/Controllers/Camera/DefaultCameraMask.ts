const DefaultCameraMask = LayerMask.InvertMask(
	LayerMask.GetMask(
		"TransparentFX",
		"Ignore Raycast",
		"Character",
		"Water",
		"UI",
		"ViewModel",
		"VisuallyHidden",
		"IgnoreCollision",
		"AvatarEditor",
	),
);

export default DefaultCameraMask;
