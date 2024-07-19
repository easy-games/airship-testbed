const DefaultCameraMask = LayerMask.InvertMask(
	LayerMask.GetMask(
		"TransparentFX",
		"Ignore Raycast",
		"Character",
		"Water",
		"UI",
		"WorldUI",
		"Viewmodel",
		"VisuallyHidden",
		"IgnoreCollision",
		"AvatarEditor",
	),
);

export default DefaultCameraMask;
