Shader "Airship/AirshipToonOrb2"
{
    Properties
    {
        [HDR] _Color1("Color1", Color) = (1,1,1,1)
        [HDR] _Color2("Color2", Color) = (1,1,1,1)
        _SmoothColor("SmoothColor", Vector) = (0,1,0,0)
       
        _Emissive("Emissive", Range(0,1)) = 1
        _MainTex ("Texture", 2D) = "white" {}
        _Mask ("Mask", 2D) = "white" {}
        _Step ("Step", Float) = 0
        _Posterize ("Posterize", Float) = 0
        _Scale ("Scale", Vector) = (1,1,0,0)
        _Powernoise ("Powernoise", Float) = 1

       
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
                float2 uv : TEXCOORD0;
                fixed4 color : COLOR;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
            };

            float4 _Color1;
            float4 _Color2;
            float2 _SmoothColor;
           
            float _Emissive;
            sampler2D _MainTex;
            sampler2D _Mask;    
            float _Step;
            float _Posterize;
            float _Powernoise;
            float2 _Scale;

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
                float2 CenteredUV15_g2 = (i.uv.xy - float2(0.5,0.5));
                float2 appendResult23_g2 = (float2((length(CenteredUV15_g2) * 1.0 * 2.0), (atan2(CenteredUV15_g2.x, CenteredUV15_g2.y) * (1.0 / 6.2832) * 1.0)));
                float2 panner19 = (1.0 * _Time.y * float2(-0.5, 0) + (appendResult23_g2 * _Scale));
                float temp_output_23_0 = pow(tex2D(_MainTex, panner19).r, _Powernoise);
                float blendOpSrc14 = temp_output_23_0;
                float blendOpDest14 = tex2D(_Mask, i.uv).r;
                float4 temp_cast_1 = ((saturate((blendOpDest14 / max(1.0 - blendOpSrc14, 0.00001))))).xxxx;
                float div15 = 256.0 / float((int)_Posterize);
                float4 posterize15 = (floor(temp_cast_1 * div15) / div15);
                float4 temp_cast_3 = (_Step).xxxx;
               
                float3 Color = posterize15.rgb;



                float smoothstepCol = smoothstep(_SmoothColor.x, _SmoothColor.y, posterize15.r);
                





                //float Alpha = step(temp_cast_3, posterize15).r;

                
                float4 finalColor = lerp(SRGBtoLinear(_Color1), SRGBtoLinear(_Color2), smoothstepCol) * i.color;
                finalColor.a = step(temp_cast_3, posterize15).r;
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
