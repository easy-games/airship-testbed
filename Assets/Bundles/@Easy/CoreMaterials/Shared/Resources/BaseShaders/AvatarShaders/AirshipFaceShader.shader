Shader "Unlit/AirshipFaceShader"
{
    Properties
    {
        _SkinColor ("Skin Color", Color) = (1,1,1,1)
        _EyeColor ("Eye Color", Color) = (1,1,1,1)
        _HairColor ("Hair Color", Color) = (1,1,1,1)
        _MainTex ("Texture", 2D) = "white" {}
        _MaskTex ("Face Mask", 2D) = "black" {}
    }
    SubShader
    {
        Name "Forward"
        Tags { "LightMode" = "AirshipForwardPass" }

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

			#include "UnityCG.cginc"
            #include "../AirshipShaderIncludes.hlsl"

            struct VertData
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct VertToFrag
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;

            sampler2D _MaskTex;
            float4 _MaskTex_ST;

            float4 _SkinColor;
            float4 _EyeColor;
            float4 _HairColor;

            VertToFrag vert (VertData v)
            {
                VertToFrag o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                return o;
            }

            void frag (VertToFrag i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
            {
                // sample the texture
                fixed4 diffuse = tex2D(_MainTex, i.uv);
                fixed4 mask = tex2D(_MaskTex, i.uv);

                float colorStrength = mask.r+mask.g+mask.b;

                half4 multipliedColor = (mask.r * _SkinColor) + (mask.g * _EyeColor) + (mask.b * _HairColor);
                multipliedColor = SRGBtoLinear(SRGBtoLinear(multipliedColor));
                half4 finalColor = lerp(diffuse, diffuse * multipliedColor, colorStrength);

                MRT0 = finalColor;
                MRT1 = half4(0,0,0,1);
            }
            ENDCG
        }
    }
}
