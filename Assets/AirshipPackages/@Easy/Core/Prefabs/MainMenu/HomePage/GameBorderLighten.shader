Shader "Unlit/GameBorder"
{
    Properties
    {
        _BorderColor ("Border Color", Color) = (1,1,1,1) 
        _Intensity ("Lightening Intensity", Range(0, 10)) = 0.5
    }
    SubShader
    {
        Tags {"Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline" = "UniversalPipeline" "PreviewType" = "Plane"}
        LOD 100

        Pass
        {
            Blend DstColor One
            Cull Off
            ZWrite Off
            ZTest LEqual

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };

            half4 _BorderColor;
            half _Intensity;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = TransformObjectToHClip(v.vertex);
                o.uv = v.uv;
                return o;
            }

            half4 frag (v2f i) : SV_Target
            {
                // uv.x is how far around the outline we are. It starts in the bottom left
                // Don't ask where 1.7 comes from. It looks nice though (controls angle of "light")
                _Intensity *= i.uv.y * max(sin(i.uv.x * 3.14 * 2 - 0.4), 0.1);
                half4 borderColor = 1 - _BorderColor * (1 - _Intensity);
                return borderColor * i.uv.y;
            }
            ENDHLSL
        }
    }
}