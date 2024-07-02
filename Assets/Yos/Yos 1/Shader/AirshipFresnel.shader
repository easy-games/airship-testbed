Shader "Airship/AirshipFresnel"
{
    Properties
    {
        [HDR] _Color1("Color1", Color) = (1,1,1,1)
        [HDR] _Color2("Color2", Color) = (1,1,1,1)
        _Emissive("Emissive", Range(0,1)) = 1      
        _PowerFresnel ("PowerFresnel", Float) = 1
        _SmoothColor("PowerColor", Float) = 1
        _Alpha("Alpha", Float) = 1
       
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
		//Cull off
        
        Pass
        {
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // make fog work
            #pragma multi_compile_fog

            #include "UnityCG.cginc"
            #include "Assets/AirshipPackages/@Easy/CoreMaterials//BaseShaders/AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float4 uv : TEXCOORD0;
                fixed4 color : COLOR;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
                float3 viewDir : TEXCOORD1;
                half3 worldNormal :TEXCOORD2;
            };

            
            
            float _Emissive;
            float _PowerFresnel;
            float _SmoothColor;
            float _Alpha;
            float4 _Color1;
            float4 _Color2;
            

            float2 voronoihash61(float2 p)
            {
                p = float2(dot(p, float2(127.1, 311.7)), dot(p, float2(269.5, 183.3)));
                return frac(sin(p) * 43758.5453);
            }
            float voronoi(float2 v, float time,  float2 id,  float2 mr, float smoothness, float2 smoothId)
            {
                float2 n = floor(v);
                float2 f = frac(v);
                float F1 = 8.0;
                float F2 = 8.0; float2 mg = 0;
                for (int j = -1; j <= 1; j++)
                {
                    for (int i = -1; i <= 1; i++)
                    {
                        float2 g = float2(i, j);
                        float2 o = voronoihash61(n + g);
                        o = (sin(time + o * 6.2831) * 0.5 + 0.5); float2 r = f - g - o;
                        float d = 0.5 * dot(r, r);
                        if (d < F1) {
                            F2 = F1;
                            F1 = d; mg = g; mr = r; id = o;
                        }
                        else if (d < F2) {
                            F2 = d;
                        }
                    }
                }
                return F1;
            }

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = SRGBtoLinear(v.color);
                float4 worldPos = mul(unity_ObjectToWorld, v.vertex);
                o.viewDir = normalize(UnityWorldSpaceViewDir(worldPos));
                half3 wNormal = UnityObjectToWorldNormal(v.normal);
                o.worldNormal = wNormal;
                return o;
            }

            fixed4 frag(v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {
                half rim = 1 - saturate(dot(normalize(i.viewDir), i.worldNormal));
                float4 finalColor = lerp(SRGBtoLinear(_Color1), SRGBtoLinear(_Color2), pow( rim ,_SmoothColor)) * i.color;;

                finalColor.a = pow(rim, _PowerFresnel)*(_Alpha + i.uv.w );
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
