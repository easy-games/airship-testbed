Shader "Airship/AirshipRampLighting"
{
	Properties
	{
		_Color("Color", Color) = (1,1,1,1)
		_MainTex("Albedo", 2D) = "white" {}
		_NormalTex("Normal", 2D) = "bump" {}
		_RampTex("Ramp", 2D) = "white" {}

		
        [KeywordEnum(LIGHTS0, LIGHTS1, LIGHTS2)] NUM_LIGHTS("NumLights", Float) = 0.0

	}
	SubShader
	{
		Pass
		{
			Tags
			{
				"LightMode" = "AirshipForwardPass"
				"Queue" = "Opaque"
			}

			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma multi_compile NUM_LIGHTS_LIGHTS0 NUM_LIGHTS_LIGHTS1 NUM_LIGHTS_LIGHTS2
			
			#include "UnityCG.cginc"
            #include "Packages/gg.easy.airship/Runtime/Code/Airship/Resources/BaseShaders/AirshipShaderIncludes.cginc"

			struct appdata
			{
				float4 vertex : POSITION;				
				float4 uv : TEXCOORD0;
				float4 vertColor: COLOR;
				float3 normal : NORMAL;
				float4 tangent : TANGENT;
			};

			struct Interp
			{
				float4 pos : SV_POSITION;
				float4 vertColor: COLOR;
				float3 worldNormal : NORMAL;
				float2 uv : TEXCOORD0;
				float3 viewDir : TEXCOORD1;	
				float3 worldTangent : TEXCOORD2;	
				float3 worldBiTangent : TEXCOORD3;	
				float3 worldPos: TEXCOORD4;
				float4 shadowCasterPos0 :TEXCOORD5;
				float4 shadowCasterPos1 :TEXCOORD6;
				
			};
			
			Texture2D _MainTex;
			float4 _MainTex_TexelSize;
			Texture2D _NormalTex;
			Texture2D _RampTex;
			SamplerState my_sampler_trilinear_repeat;
			SamplerState my_sampler_bilinear_clamp;
			
			float4 _Color;
	 
			
			Interp vert (appdata v)
			{
				Interp o;
				o.pos = UnityObjectToClipPos(v.vertex);
				
				float4 worldPos = mul(unity_ObjectToWorld, v.vertex);
				o.worldPos = worldPos;
				o.worldNormal = UnityObjectToWorldNormal(v.normal);
				o.worldTangent	= UnityObjectToWorldDir(v.tangent);
				o.worldBiTangent = cross(o.worldNormal, o.worldTangent) * (v.tangent.w * unity_WorldTransformParams.w);
				o.viewDir = WorldSpaceViewDir(v.vertex);
				
				//shadows
				o.shadowCasterPos0 = mul(_ShadowmapMatrix0, worldPos);
				o.shadowCasterPos1 = mul(_ShadowmapMatrix1, worldPos);
				
				o.vertColor = v.vertColor;
				return o;
			}
			
			float4 frag(Interp i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
			{
				//return i.vertColor;
				const half4 color = SRGBtoLinear(_Color);
								
				//Normal Mapping
				half4 normalSample = _NormalTex.Sample(my_sampler_trilinear_repeat, i.uv);
                half3 textureNormal = UnpackNormal(normalSample);
				
				float3x3 mTangToWorld = {
					i.worldTangent.x,i.worldBiTangent.x,i.worldNormal.x,
					i.worldTangent.y,i.worldBiTangent.y,i.worldNormal.y,
					i.worldTangent.z,i.worldBiTangent.z,i.worldNormal.z,
				};
                half3 worldNormal = mul(mTangToWorld, textureNormal);

				//Ambient
				//half3 ambientColor = SampleAmbientSphericalHarmonics(worldNormal) * globalAmbientTint;

				//View Dir
				float3 viewDir = normalize(i.viewDir);

				// Calculate illumination from directional light.
				float NdotL = dot(-globalSunDirection, worldNormal);
				float brightness = clamp(NdotL,0,1);// min(_SunScale, i.ambientColor.g) * NdotL;
				
				//Shadows
				half sunShadowMask = GetShadow(i.shadowCasterPos0, i.shadowCasterPos1, worldNormal, globalSunDirection);
				brightness *= sunShadowMask;
				
				//for the fog
				half3 viewVector = _WorldSpaceCameraPos.xyz - i.worldPos;
				float viewDistance = length(viewVector);
				
				//Point lights
#ifdef NUM_LIGHTS_LIGHTS1
			    
			    brightness += CalculatePointLight(i.worldPos, worldNormal, globalDynamicLightPos[0], globalDynamicLightColor[0], globalDynamicLightRadius[0]);
#endif			    
#ifdef NUM_LIGHTS_LIGHTS2
			    brightness += CalculatePointLight(i.worldPos, worldNormal, globalDynamicLightPos[0], globalDynamicLightColor[0], globalDynamicLightRadius[0]);
			    brightness += CalculatePointLight(i.worldPos, worldNormal, globalDynamicLightPos[1], globalDynamicLightColor[1], globalDynamicLightRadius[1]);
#endif
				
				//brightness += ambientColor.r;
				brightness = clamp(brightness, 0, 1);
				half4 rampSample = _RampTex.Sample(my_sampler_bilinear_clamp, float2(1.0-brightness, 0));
				
				half4 finalColor = rampSample * color;
				//fog
				finalColor.xyz = CalculateAtmosphericFog(finalColor.xyz, viewDistance);

				//regular code
				MRT0 = float4(finalColor.xyz,1);
				MRT1 = float4(0,0,0,0);
				return MRT0;
			}
			ENDCG
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
				#include "Packages/gg.easy.airship/Runtime/Code/Airship/Resources/BaseShaders/AirshipSimpleShadowPass.hlsl"
			ENDCG
		}
	}

	
}