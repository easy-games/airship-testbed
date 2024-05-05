Shader "Airship/WorldShaderPBR"
{
    
    Properties
    {
         [HDR] _Color("Color", Color) = (1,1,1,1)
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

        //lightmapping
        [HideInInspector][NoScaleOffset]unity_Lightmaps("unity_Lightmaps", 2DArray) = "" {}
        [HideInInspector][NoScaleOffset]unity_LightmapsInd("unity_LightmapsInd", 2DArray) = "" {}
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
            #pragma target 3.5
            #pragma multi_compile TRIPLANAR_STYLE_OFF TRIPLANAR_STYLE_LOCAL TRIPLANAR_STYLE_WORLD
        
            #pragma multi_compile _ _ADDITIONAL_LIGHTS
            #pragma multi_compile _ EXPLICIT_MAPS_ON
			#pragma multi_compile _ EMISSIVE_ON
			#pragma multi_compile _ RIM_LIGHT_ON
            #pragma multi_compile _ INSTANCE_DATA_ON
            #pragma multi_compile _ USE_SHADOW_COLOR_ON
			#pragma multi_compile _ SHADOWS_ON
			#pragma multi_compile _ USE_COLOR_MASK_ON
            #pragma multi_compile _ DOUBLE_SIDED_NORMALS
	   
            //Lightmapping
            #pragma multi_compile _ DIRLIGHTMAP_COMBINED
            #pragma multi_compile _ LIGHTMAP_ON
            
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
            HLSLPROGRAM
                #pragma target 3.5
                #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipSimpleShadowPass.hlsl"
            ENDHLSL
        }

        Pass
        {
            Name "META"
            Tags {"LightMode" = "Meta"}
            Cull Off
            HLSLPROGRAM

            #include"UnityStandardMeta.cginc"
            #pragma target 3.5
        
            float INSTANCE_DATA;//Instance of baked mesh
            float4 _ColorInstanceData[16];//Instance data (for this material)
            
            //sampler2D _GIAlbedoTex;
            //fixed4 _GIAlbedoColor;

            struct VertexInputAirshipMeta
            {
                float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
				float2 uv1 : TEXCOORD1;
                float2 uv2 : TEXCOORD2;
                float2 instanceIndexInput : TEXCOORD7;
            };

            struct v2f_metaAirship
            {
                float4 pos      : SV_POSITION;
                float4 uv       : TEXCOORD0;
#ifdef EDITOR_VISUALIZATION
                float2 vizUV        : TEXCOORD1;
                float4 lightCoord   : TEXCOORD2;
#endif
                float2 instanceIndex : TEXCOORD3;
            }; 
            
            v2f_metaAirship vert_meta(VertexInputAirshipMeta v)
            {
                v2f_metaAirship o;
                o.pos = UnityMetaVertexPosition(v.vertex, v.uv1.xy, v.uv2.xy, unity_LightmapST, unity_DynamicLightmapST);
                o.uv = float4(v.uv,0,0);// TexCoords(v);
#ifdef EDITOR_VISUALIZATION
                o.vizUV = 0;
                o.lightCoord = 0;
                if (unity_VisualizationMode == EDITORVIZ_TEXTURE)
                    o.vizUV = UnityMetaVizUV(unity_EditorViz_UVIndex, v.uv0.xy, v.uv1.xy, v.uv2.xy, unity_EditorViz_Texture_ST);
                else if (unity_VisualizationMode == EDITORVIZ_SHOWLIGHTMASK)
                {
                    o.vizUV = v.uv1.xy * unity_LightmapST.xy + unity_LightmapST.zw;
                    o.lightCoord = mul(unity_EditorViz_WorldToLight, mul(unity_ObjectToWorld, float4(v.vertex.xyz, 1)));
                }
#endif
#if INSTANCE_DATA_ON 
				o.instanceIndex = v.instanceIndexInput;
#else
                o.instanceIndex = 0;
#endif                
                return o;
            }

            float4 frag_meta2(v2f_metaAirship i) : SV_Target
            {
                // We're interested in diffuse & specular colors
                // and surface roughness to produce final albedo.

                
                UnityMetaInput o;
                UNITY_INITIALIZE_OUTPUT(UnityMetaInput, o);
                
                //fixed4 c = tex2D(_GIAlbedoTex, i.uv);
                
                fixed3 baseColor = _Color.rgb;
              
                #ifdef INSTANCE_DATA_ON
                    half4 instanceColor = _ColorInstanceData[i.instanceIndex.x];
                    baseColor = instanceColor.rgb;
					
                #endif
                
                o.Albedo = baseColor;
                o.Emission = fixed3(0, 0, 0);// Emission(i.uv.xy);
                
                return UnityMetaFragment(o);
            }

            #pragma vertex vert_meta
            #pragma fragment frag_meta2
            #pragma shader_feature _EMISSION
            #pragma shader_feature _METALLICGLOSSMAP
            #pragma shader_feature ___ _DETAIL_MULX2
            ENDHLSL
        }
    }
    
}
