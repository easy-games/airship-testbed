Shader "Airship/AirshipSinWave"
{
    Properties
    {
        _Color("Color A", Color) = (1,1,1,1)
        _ColorB("Color B", Color) = (1,1,1,1)
        _BGColor("Background Color", Color) = (1,1,1,0)
        _EmissiveColor("Emissive Color", Color) = (1,1,1,0)
        _EmissiveMix("Emissive Mix", Range(0,1)) = .5
        _MainTex ("Texture", 2D) = "white" {}
        _FadeA("Wave Fade A", Range(0,1)) = 1
        _FadeB("Wave Fade B", Range(0,1)) = 0
        _WaveSpeedMod ("Wave Speed", Float) = 1
        _WaveStrength ("Wave Strength", Float) = 1
        _WaveLength ("Wave Length", Float) = 1
        _TexScrollSpeedX ("Tex Scroll X", Float) = 0
        _TexScrollSpeedY ("Tex Scroll Y", Float) = 0
    }
    SubShader
    {
        // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
        Name "Forward"
        Tags { "LightMode" = "AirshipForwardPass" 
            "Queue" = "Transparent"
            "IgnoreProjector"="True"
            "RenderType"="Transparent"
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"}
            
        //Tags { "RenderType"="Transparent"  "LightMode" = "AirshipForwardPass"  "Queue"="Transparent"}

		Cull back
        Lighting Off
        ZWrite Off
        Blend SrcAlpha OneMinusSrcAlpha
        
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"
            #include "../AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                fixed4 color : COLOR;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float2 texUV : TEXCOORD1;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            float4 _Color;
            float4 _ColorB;
            float4 _BGColor;
            float4 _EmissiveColor;
            float _EmissiveMix;
            float _WaveSpeedMod;
            float _WaveStrength;
            float _WaveLength;
            float _FadeA;
            float _FadeB;
            float _TexScrollSpeedX;
            float _TexScrollSpeedY;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.texUV = TRANSFORM_TEX(v.uv, _MainTex);
                o.color = SRGBtoLinear(v.color);
                return o;
            }

            fixed4 frag (v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {
                float4 texColor = tex2D(_MainTex, i.texUV + _Time.x * float2(_TexScrollSpeedX, _TexScrollSpeedY));
                float2 convertedUV = float2(ConvertFromNormalizedRange(i.uv.y), ConvertFromNormalizedRange(i.uv.x));

                float localSum = i.vertex.x + i.vertex.y + i.vertex.z;

                float wave1 = abs(ConvertFromNormalizedRange(frac((localSum + _Time.y * _WaveSpeedMod)   - i.uv.y)));
                float wave2 = smoothstep(0,1,wave1) * _WaveStrength + (i.uv.x * _WaveLength);
                float wave3 =  abs(ConvertFromNormalizedRange(fmod(wave2, 1)));

                float fadeA = (1 - i.uv.y * _FadeA);
                float fadeB = (1- i.uv.y) * _FadeB;
                float wave4 = saturate(fadeA * wave3 - fadeB);
                
                //finalColor.a =texColor.a;
                texColor *= wave4;
                float4 color =  SRGBtoLinear(lerp(_Color, _ColorB, i.uv.y));
                color = lerp(SRGBtoLinear(_BGColor), color, wave4);
                float4 finalColor = wave4 * i.color * color;
                finalColor += texColor;
                finalColor.a = wave4 * texColor.a * color.a;
                
                //clip(finalColor.a-.25);
                
				MRT0 = finalColor;
				MRT1 = lerp(finalColor, _Color, _EmissiveMix) * _EmissiveColor.a * finalColor.a;// * i.uv.y;
                return finalColor;
            }
            ENDCG
        }
    }
}
