const DefaultCameraMask = LayerMask.InvertMask(
	LayerMask.GetMask(
		"TransparentFX",
		"Ignore Raycast",
		"Character",
		"BridgeAssist",
		"GroundItem",
		"ProjectileReceiver",
	),
);

export default DefaultCameraMask;
