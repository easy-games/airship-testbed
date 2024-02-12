Shader "Airship/WriteToDepth"
{
    Properties
    {
        _Depth("Depth", float) = 0
    }
    SubShader
    {
        Name "Forward"
        Tags { "LightMode" = "AirshipForwardPass" }
        
        Pass
        {
            ZTest Always 
            Cull Off 
            ZWrite On
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            
            struct VertData
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct VertToFrag
            {
            };
            
            float _Depth;

            VertToFrag vert (VertData vertData)
            {
                VertToFrag outData;
                return outData;
            }


            void frag (VertToFrag i, out float depth : SV_Depth)
            {
                depth = _Depth;
            }
            ENDCG
        }
    }
}
