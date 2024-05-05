Shader "Airship/Skybox"
{
    Properties{
        _CubemapTex("Cubemap", Cube) = "black" {}
        [HDR] _FogColor("Fog Color", Color) = (1,1,1,1)
        _FogSize("Fog Size", Float) = 3.5
        _FogPower("Fog Pow", Float) = 1
		_Brightness("Brightness", range(0, 5)) = 1
    }

        SubShader{
            Tags { "Queue" = "Background"  "Pipeline" = "Airship"}
            Cull Off ZWrite Off

                Pass {
                    CGPROGRAM
                    #pragma vertex vert
                    #pragma fragment frag
                 
                    #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipShaderIncludes.hlsl"

                    #pragma multi_compile _ FOG_ON

                    float _FogSize;
                    float4 _FogColor;
                    float _FogPower;
                    float _Brightness;

                    struct appdata {
                        float4 vertex : POSITION;
                    };

                    struct v2f {
                        float4 vertex : SV_POSITION;
                        float4 worldDirection : TEXCOORD0;
                        float4 worldPos : TEXCOORD1;
                        float3 viewDirectionNeg : TEXCOORD2;
                    };

                    samplerCUBE _CubemapTex;
                    v2f vert(appdata v)
                    {
                        v2f o;
                        o.vertex = UnityObjectToClipPos(v.vertex);
                        o.worldDirection = float4(normalize(mul(unity_ObjectToWorld, v.vertex).xyz),0);
                        o.worldPos = mul(unity_ObjectToWorld, v.vertex);

                        float3 viewVector = _WorldSpaceCameraPos.xyz - o.worldPos.xyz;
                        float3 viewDirection = normalize(viewVector);
                        o.viewDirectionNeg = -viewVector;

                        return o;
                    }

                    void frag(v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
                    {
                        half3 texSample = texCUBElod(_CubemapTex, half4(i.viewDirectionNeg, 0)).rgb * _Brightness;
#if FOG_ON
                        //if the view vector is basically level with the horizon, blend in fog color
                        float3 viewDirection = normalize(i.viewDirectionNeg);
                        float fogPower = pow(abs(viewDirection.y), _FogPower);
                        float fogBlend = saturate(fogPower * _FogSize);

                        float3 fogColor = lerp(lerp(texSample, _FogColor.rgb, _FogColor.a), texSample, fogBlend );

                        DoFinalColorWrite(float4(fogColor,1), half4(0,0,0,0), MRT0, MRT1);
     
#else
     
                        DoFinalColorWrite(float4(texSample,1), half4(0, 0, 0, 0), MRT0, MRT1);
#endif

                    }
                    ENDCG
                }

        }

}
