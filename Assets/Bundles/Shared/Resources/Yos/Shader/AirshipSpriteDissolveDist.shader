Shader "Airship/AirshipSpriteDissolveDist"
{
    Properties
    {
        _Color("Tint", Color) = (1,1,1,1)
        _Emissive("Emissive", Range(0,1)) = 1
        _MainTex ("Texture", 2D) = "white" {}
        _dist ("Dist", 2D) = "white" {}
        _Step ("Step", Float) = 0
        _Scalestep("Scalestep", Vector) = (1,1,0,0)
       
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
            #include "Packages/gg.easy.airship/Runtime/Code/Airship/Resources/BaseShaders/AirshipShaderIncludes.cginc"

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

            sampler2D _MainTex;
            sampler2D _dist;
            float4 _MainTex_ST;
            float4 _dist_ST;
            float4 _Color;
            float _Emissive;
            float _Step;
            float2 _Scalestep;

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
                return o;
            }

            fixed4 frag (v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {
                
                float4 finalColor = tex2D(_MainTex, i.uv) * SRGBtoLinear(_Color) * i.color;





                

               
                
                
                float2 texCoordvor = i.uv * _Scalestep;
                float2 uv_dist = i.uv.xy * _dist_ST.xy + _dist_ST.zw;
                float2 temp_cast_1 = (tex2D(_dist, uv_dist).r).xx;
                float2 lerpResult = lerp(texCoordvor, temp_cast_1, (i.uv.w + 0));
                float2 coords61 = lerpResult * 4.65;
                
                float voroi = voronoi(coords61, 0, 0, 0, 0, 0);

              









               // finalColor.rgb = finalColor.rgb * tex2D(_MainTex, i.uv).rrr;
                finalColor.a = finalColor.a * step(     (i.uv.z + _Step)    , voroi);
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
