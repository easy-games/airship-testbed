Shader "Airship/WorldShaderPBR"
{
    
    Properties
    {
        [HideInInspector][HDR] _Color("Color", Color) = (1,1,1,1)
        [HDR] _ShadowColor("Shadow Color", Color) = (1,1,1,1)
        [Toggle] USE_SHADOW_COLOR("Use Shadow Color", Float) = 0.0
        
        [Enum(No,2,Yes,0)] DOUBLE_SIDED_NORMALS("Two Sided", Int) = 2

        _Alpha("Alpha", Float) = 1.0
        [HDR] _SpecularColor("Specular Color", Color) = (1,1,1,1)
        [HDR] _OverrideColor("Override Color", Color) = (1,1,1,1)
        _OverrideStrength("Override Strength", Range(0,1)) = 0
               
        [Toggle] EXPLICIT_MAPS("Not using atlas", Float) = 1.0
        [Toggle] USE_COLOR_MASK("Use color mask", Float) = 0.0
        _MainTex("Albedo", 2D) = "white" {}
        _NormalTex("Normal", 2D) = "bump" {}
        _MetalTex("Metal", 2D) = "black" {}
        _RoughTex("Rough", 2D) = "white" {}
        _EmissiveMaskTex("Emissive Mask", 2D) = "white" {}
        _ColorMaskTex("Color Mask", 2D) = "white" {}
        
        [Toggle] _ZWrite("Z-Write", Float) = 1.0
        
        [KeywordEnum(OFF, LOCAL, WORLD)] TRIPLANAR_STYLE("Triplanar", Float) = 0.0
        _TriplanarScale("TriplanarScale", Range(0.0, 16)) = 0.0

        _MRSliderOverrideMix("Metal Rough Slider Strength", Range(0.0, 1)) = 0.0

        _MetalOverride("Metal", Range(0.0, 1)) = 0.0
        _RoughOverride("Rough", range(0.0, 1)) = 1.0

        [Toggle] EMISSIVE("Emissive", Float) = 0.0
        [HDR] _EmissiveColor("Emissive Color", Color) = (1,1,1,1)
        _EmissiveMix("Emissive/Albedo Mix", range(0, 1)) = 1.0

        [Toggle] RIM_LIGHT("Use Rim Light", Float) = 0.0
        [HDR] _RimColor("Rim Color", Color) = (1,1,1,1)
        _RimPower("Rim Power", Range(0.0, 10)) = 2.5
        _RimIntensity("Rim Intensity", Range(0, 5)) = 0.75
        
        [Toggle] INSTANCE_DATA("Has Baked Instance Data", Float) = 0.0

        [Toggle] SHADOWS("Render Shadows", Float) = 1.0
    }

    SubShader
    {
        Pass
        {
            // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
            Name "Forward"
            Tags { "LightMode" = "AirshipForwardPass" "Queue" = "Opaque"}

            //Blend[_SrcBlend][_DstBlend]
            ZWrite[_ZWrite]
            Cull[DOUBLE_SIDED_NORMALS]

            HLSLPROGRAM
            #pragma multi_compile TRIPLANAR_STYLE_OFF TRIPLANAR_STYLE_LOCAL TRIPLANAR_STYLE_WORLD
        
            #pragma multi_compile _ EXPLICIT_MAPS_ON
			#pragma multi_compile _ EMISSIVE_ON
			#pragma multi_compile _ RIM_LIGHT_ON
            #pragma multi_compile _ INSTANCE_DATA_ON
            #pragma multi_compile _ USE_SHADOW_COLOR_ON
			#pragma multi_compile _ SHADOWS_ON
			#pragma multi_compile _ USE_COLOR_MASK_ON
            #pragma multi_compile _ DOUBLE_SIDED_NORMALS
	   
            
            #include "AirshipWorldShaderIncludes.hlsl"
                          
            ENDHLSL
        }
         
        Pass
        {
			Name "ShadowCaster"
            Tags
            {
                "RenderType" = "Opaque"
                "LightMode" = "AirshipShadowPass"
            }
            ZWrite On
            CGPROGRAM
                #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipSimpleShadowPass.hlsl"
            ENDCG
        }
    }
    
}
