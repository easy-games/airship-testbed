Shader "Unlit/AirshipColorMaskShader"
{
    Properties
    {
        _ColorR ("Red Channel", Color) = (1,0,0,1)
        _ColorG ("Green Channel", Color) = (0,1,0,1)
        _ColorB ("Blue Channel", Color) = (0,0,1,1)
        _MainTex ("Difuse", 2D) = "white" {}
        _MaskTex ("Color Mask", 2D) = "black" {}
        _Alpha ("Alpha Value", float) = 1
        _AlphaCutoff("Alpha Clip", float) = 0

    }
    SubShader
    {
        Name "Forward"
        Tags { "LightMode" = "AirshipForwardPass" }

		Cull Off
        Lighting Off
        ZWrite Off
        Blend SrcAlpha OneMinusSrcAlpha

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
		 
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

            float4 _ColorR;
            float4 _ColorG;
            float4 _ColorB;

            float _Alpha;
            float _AlphaCutoff;

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

                half4 multipliedColor = (mask.r * _ColorR) + (mask.g * _ColorG) + (mask.b * _ColorB);
                half4 finalColor = lerp(diffuse, diffuse * multipliedColor, colorStrength);
                finalColor.a *= _Alpha;

                clip(finalColor.a - _AlphaCutoff);
                MRT0 = finalColor;
                MRT1 = half4(0,0,0,_Alpha);
            }
            ENDCG
        }
    }
}
