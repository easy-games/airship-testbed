Shader "Airship/AirshipNoiseDistorttoon"
{
    Properties
    {
        _Color("Tint", Color) = (1,1,1,1)
        _Emissive("Emissive", Range(0,1)) = 1
        _MainTex ("Texture", 2D) = "white" {}
        _Noise ("Noise", 2D) = "white" {}
        _PowerMask("PowerMask", Vector) = (0,1,0,0)
        _Mask("Mask", 2D) = "white" {}
        _PowerNoise("PowerNoise", Float) = 1
        _Posterize("Posterize", Float) = 1
        _Step("Step", Float) = 1
        _Alpha("Alpha", Float) = 1
        _Dist("Dist", Range(0,0.5)) = 0
        _Scalen ("Scalen", Vector) = (1,1,0,0)
        _Speedn ("Speedn", Vector) = (0.25,0.25,0,0)
        _Scaled ("Scaled", Vector) = (1,1,0,0)
        _Speedd ("Speedd", Vector) = (0.25,0.25,0,0)


        [KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _SrcBlend("SourceBlend", Float) = 1.0
		[KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _DstBlend("DestBlend", Float) = 10.0
    }
    SubShader
    {
        // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
        Name "Forward"
        Tags { "RenderType"="Transparent"  
            "LightMode" = "AirshipForwardPass"
			"Queue"="Transparent"}
        Blend[_SrcBlend][_DstBlend]

		ZWrite off
		Cull off
        
        Pass
        {
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // make fog work
            #pragma multi_compile_fog

            #include "UnityCG.cginc"
            #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float4 uv : TEXCOORD0;
                fixed4 color : COLOR;
            };

            struct v2f
            {
                float4 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
            };

            float4 _Color;
            float _Emissive;
            sampler2D _MainTex;
            float _PowerNoise;
            float _Posterize;
            float _Step;
            float _Alpha;
            sampler2D _Noise;
            sampler2D _Mask;
            float2 _PowerMask;
            float _Dist;
            float2 _Scalen;
            float2 _Speedn;
            float2 _Scaled;
            float2 _Speedd;

            

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = SRGBtoLinear(v.color);
                return o;
            }

            fixed4 frag (v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {

                float2 temp_cast_0 = (tex2D(_Noise, (((i.uv.zz + i.uv.xy) * _Scaled) + (_Time.y * _Speedd))).r).xx;
                float2 temp_cast_1 = (i.uv.zz + i.uv.xy) * _Scalen + (_Time.y * _Speedn);
                float2 lerp1 = lerp(temp_cast_1, temp_cast_0, _Dist);
                
                float auxuv_1 = 0;
                if (i.uv.x >= 0.5)
                    auxuv_1 = i.uv.x + -0.5;
                else
                    auxuv_1 = (i.uv.x + 0.5);
                
                float2 uv2 = (float2(auxuv_1, i.uv.y));

                float2 temp_cast_02 = (tex2D(_Noise, (((i.uv.zz + uv2) * _Scaled) + (_Time.y * _Speedd))).r).xx;
                float2 temp_cast_12 = (i.uv.zz + uv2) * _Scalen + (_Time.y * _Speedn);
                float2 lerp12 = lerp(temp_cast_12, temp_cast_02, _Dist);

                float lerpmask = smoothstep(0.0, 1.0, (1.0 + (abs((i.uv.x + -0.5)) - 0.0) * (0.0 - 1.0) / (0.5 - 0.0)));

                float text1 = (tex2D(_MainTex,lerp1)).x;
                float text2 = (tex2D(_MainTex, lerp12)).x;

                float ftext =  saturate (  pow (   lerp(text2, text1, lerpmask)   ,  _PowerNoise ) * _Alpha  ) * smoothstep(  _PowerMask.x, _PowerMask.y ,  tex2D(_Mask, i.uv).x  )  ;


                
                float div256 = 256.0 / float((int)_Posterize);
                float toontext = (floor(ftext * div256) / div256);

                float steptx = step(_Step, toontext);

                /*

                float2 temp_cast_0 = (tex2D(_Noise, (((i.uv.zz + i.uv.xy) * _Scale) + (_Time.y * _Speed))).r).xx;
                float2 lerpResult20 = lerp(i.uv.xy, temp_cast_0, _Dist);
                float Alpha = (tex2D(_MainTex, lerpResult20).r * i.color.a);
                */

                float4 finalColor = _Color * SRGBtoLinear(_Color) * i.color * toontext;
                finalColor.a = steptx * i.color.a;
				MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
