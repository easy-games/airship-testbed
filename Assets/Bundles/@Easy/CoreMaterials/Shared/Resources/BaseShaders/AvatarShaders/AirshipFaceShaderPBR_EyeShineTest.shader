Shader "Airship/AirshipFaceShaderPBR"
{
    
    Properties
    {
        [HDR] _Color("Color", Color) = (1,1,1,1)
        _Alpha("Alpha", Float) = 1.0
        [HDR] _SpecularColor("Specular Color", Color) = (1,1,1,1)
        [HDR] _OverrideColor("Override Color", Color) = (1,1,1,1)
        _OverrideStrength("Override Strength", Range(0,1)) = 0
        
        [Toggle] EXPLICIT_MAPS("Not using atlas", Float) = 1.0
        _MainTex("Albedo", 2D) = "white" {}
        _NormalTex("Normal", 2D) = "bump" {}
        _MetalTex("Metal", 2D) = "black" {}
        _RoughTex("Rough", 2D) = "white" {}
        _CubeTex("Cube", Cube) = "white" {}
        _EmissiveMaskTex("Emissive Mask", 2D) = "white" {}
        
        [Toggle] _ZWrite("Z-Write", Float) = 1.0
            
        [KeywordEnum(OFF, LOCAL, WORLD)] TRIPLANAR_STYLE("Triplanar", Float) = 0.0
        _TriplanarScale("TriplanarScale", Range(0.0, 16)) = 0.0

        [Toggle] SLIDER_OVERRIDE("Use Metal/Rough Sliders", Float) = 1.0
        _SliderOverrideMix("Metal Rough Mix", Range(0.0, 1)) = 0.0

        _MetalOverride("Metal", Range(0.0, 1)) = 0.0
        _RoughOverride("Rough", range(0.0, 1)) = 0.0

        [Toggle] EMISSIVE("Emissive", Float) = 0.0
        [HDR] _EmissiveColor("Emissive Color", Color) = (1,1,1,1)
        _EmissiveMix("Emissive/Albedo Mix", range(0, 1)) = 1.0
 
        [Toggle] RIM_LIGHT("Use Rim Light", Float) = 0.0
        [HDR] _RimColor("Rim Color", Color) = (1,1,1,1)
        _RimPower("Rim Power", Range(0.0, 10)) = 2.5
        _RimIntensity("Rim Intensity", Range(0, 5)) = 0.75
        
        [Toggle] INSTANCE_DATA("Has Baked Instance Data", Float) = 0.0
        
        _EyeMaskTex("Eye Mask", 2D) = "black" {}
    }

    SubShader
    {
        Pass
        {
            // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
            Name "Forward"
            Tags { "LightMode" = "AirshipForwardPass" "Queue" = "Opaque"}

            //Blend[_SrcBlend][_DstBlend]
            ZWrite[_ZWrite]
              
            HLSLPROGRAM

            #include "../AirshipShaderIncludes.hlsl"
                
            #pragma multi_compile TRIPLANAR_STYLE_OFF TRIPLANAR_STYLE_LOCAL TRIPLANAR_STYLE_WORLD
            #pragma multi_compile _ SLIDER_OVERRIDE_ON
     
            #pragma multi_compile _ EXPLICIT_MAPS_ON
     
			#pragma multi_compile _ EMISSIVE_ON
			#pragma multi_compile _ RIM_LIGHT_ON
            #pragma multi_compile _ INSTANCE_DATA_ON
            
            //Main programs
            #pragma vertex vertFunction
            #pragma fragment fragFunction

            //Multi shader vars (you need these even if you're not using them, so that material properties can survive editor script reloads)
            float SLIDER_OVERRIDE;
            float EXPLICIT_MAPS;
            float EMISSIVE;
            float RIM_LIGHT;
                        
            //Unity stuff
            float4x4 unity_MatrixVP;
            float4x4 unity_ObjectToWorld;
            float4x4 unity_WorldToObject;
            float4 unity_WorldTransformParams;
            float3 _WorldSpaceCameraPos;

            //SamplerState sampler_MainTex;
            SamplerState my_sampler_point_repeat;
            SamplerState my_sampler_trilinear_repeat;
            
            Texture2D _MainTex;
            float4 _MainTex_TexelSize;
            Texture2D _NormalTex;
            Texture2D _MetalTex;
            Texture2D _RoughTex;
            Texture2D _EmissiveMaskTex;
            Texture2D _EyeMaskTex;
            

            samplerCUBE _CubeTex;

            float  _Alpha;
            float4 _Color;
            float4 _SpecularColor;
            float4 _OverrideColor;
            float _OverrideStrength;
            float4 _EmissiveColor;
            half _EmissiveMix;
            float4 _Time;

            float4 _ProjectionParams;
            float4 _MainTex_ST;

            half _MetalOverride;
            half _RoughOverride;
            half _SliderOverrideMix;
            
            half _TriplanarScale;

            static const float maxMips = 8;//This is how many miplevels the cubemaps have
            
            struct Attributes
            {
                float4 positionOS   : POSITION;
                float4 color   : COLOR;
                float3 normal : NORMAL;
                float4 tangent: TANGENT;
                float4 uv_MainTex : TEXCOORD0;
                float2 bakedLightA : TEXCOORD1;
                float2 bakedLightB : TEXCOORD2;

                float2 instanceIndex : TEXCOORD7;
            };

            struct vertToFrag
            {
                float4 positionCS : SV_POSITION;

                float4 color      : COLOR;
                float4 baseColor : TEXCOORD0;
                float4 uv_MainTex : TEXCOORD1;
                float3 worldPos   : TEXCOORD2;

                half3  tspace0 : TEXCOORD3;
                half3  tspace1 : TEXCOORD4;
                half3  tspace2 : TEXCOORD5;
                
                float4 bakedLight : TEXCOORD6;

                half3 triplanarBlend : TEXCOORD7;
                float3 triplanarPos : TEXCOORD8;

                float4 shadowCasterPos0 :TEXCOORD9;
                float4 shadowCasterPos1 :TEXCOORD10;

                half3 worldNormal : TEXCOORD11;
                

            };

            inline float3 UnityObjectToWorldNormal(in float3 dir)
            {
                return normalize(mul(dir, (float3x3)unity_WorldToObject));
            }

            inline float3 UnityObjectToWorldDir(in float3 dir)
            {
                return normalize(mul((float3x3)unity_ObjectToWorld, dir));
            }
           
            vertToFrag vertFunction(Attributes input)
            {
                vertToFrag output;
                float4 worldPos = mul(unity_ObjectToWorld, input.positionOS);
                output.positionCS = mul(unity_MatrixVP, worldPos);

                // Transform the normal to world space and normalize it
                float3 shadowNormal = normalize(mul(float4(input.normal, 0.0), unity_WorldToObject).xyz);

                // Apply the adjusted offset
                output.shadowCasterPos0 = CalculateVertexShadowData0(worldPos, shadowNormal);
                output.shadowCasterPos1 = CalculateVertexShadowData1(worldPos, shadowNormal);
                        
                output.uv_MainTex = input.uv_MainTex;
                output.uv_MainTex = float4((input.uv_MainTex * _MainTex_ST.xy + _MainTex_ST.zw).xy, 1, 1);

            //Local triplanar
        #ifdef TRIPLANAR_STYLE_LOCAL
                float3 scale;
                scale.x = length(float3(unity_ObjectToWorld._m00, unity_ObjectToWorld._m10, unity_ObjectToWorld._m20));
                scale.y = length(float3(unity_ObjectToWorld._m01, unity_ObjectToWorld._m11, unity_ObjectToWorld._m21));
                scale.z = length(float3(unity_ObjectToWorld._m02, unity_ObjectToWorld._m12, unity_ObjectToWorld._m22));
                output.triplanarPos = float4((input.positionOS * _TriplanarScale + _MainTex_ST.zzz).xyz * scale, 1);
        #endif

                //World triplanar
        #ifdef TRIPLANAR_STYLE_WORLD
                output.triplanarPos = float4((worldPos * _TriplanarScale + _MainTex_ST.zzz).xyz, 1);
        #endif    

                //tex.uv* _MainTex_ST.xy + _MainTex_ST.zw;

                output.bakedLight = float4(input.bakedLightA.x, input.bakedLightA.y, input.bakedLightB.x, 0);

                output.worldPos = worldPos;
                output.color = input.color;
                output.baseColor = lerp(_Color, _OverrideColor, _OverrideStrength);

                //Do ambient occlusion at the vertex level, encode it into vertex color g
                //But only if we're part of the world geometry...
                //#if VERTEX_LIGHT_ON
                //output.color.g = clamp(output.color.g + (1 - globalAmbientOcclusion), 0, 1);
                //#endif        


        #if INSTANCE_DATA_ON
		        float4 instanceColor = _ColorInstanceData[input.instanceIndex.x];
                output.color *= instanceColor;
        #endif


                //output.screenPosition = ComputeScreenPos(output.positionCS);
         
                float3 normalWorld = normalize(mul(float4(input.normal, 0.0), unity_WorldToObject).xyz);
                float3 tangentWorld = normalize(mul(unity_ObjectToWorld, input.tangent.xyz));
                 
                half tangentSign = input.tangent.w * unity_WorldTransformParams.w;
                float3 binormalWorld = cross(normalWorld, tangentWorld) * tangentSign;

                output.tspace0 = half3(tangentWorld.x, binormalWorld.x, normalWorld.x);
                output.tspace1 = half3(tangentWorld.y, binormalWorld.y, normalWorld.y);
                output.tspace2 = half3(tangentWorld.z, binormalWorld.z, normalWorld.z);

                output.worldNormal = normalWorld;
            
                //calculate the triplanar blend based on the local normal   
        #ifdef TRIPLANAR_STYLE_LOCAL
                //Localspace triplanar
                output.triplanarBlend = normalize(abs(input.normal));
                output.triplanarBlend /= dot(output.triplanarBlend, (half3)1);
                
                
        #endif

        #ifdef TRIPLANAR_STYLE_WORLD
                //Worldspace triplanar
                output.triplanarBlend = normalize(abs(normalWorld));
                output.triplanarBlend /= dot(output.triplanarBlend, (half3)1);
                
        #endif    
                return output;
            }
                        
            half3 DecodeNormal(half3 norm)
            {
                return norm * 2.0 - 1.0;
            }

            half3 EncodeNormal(half3 norm)
            {
                return norm * 0.5 + 0.5;
            }

            //Two channel packed normals (assumes never negative z)
            half3 TextureDecodeNormal(half3 norm)
            {
                half3 n;
                n.xy = norm.xy * 2 - 1;
                n.z = sqrt(1 - dot(n.xy, n.xy));
                return n;
            }

            static float4 color1 = float4(1, 0, 0, 1); // red
            static float4 color2 = float4(1, 0.5, 0, 1); // orange
            static float4 color3 = float4(1, 1, 0, 1); // yellow
            static float4 color4 = float4(0, 1, 0, 1); // green
            static float4 color5 = float4(0, 0, 1, 1); // blue
            static float4 color6 = float4(0.5, 0, 1, 1); // purple
            static float4 color7 = float4(1, 0, 1, 1); // pink
            static float4 color8 = float4(0, 1, 1, 1);  // teal
            static float4 color9 = float4(1, 0, 1, 1); //more purple
            static float4 color10 = float4(0, 1, 0.5, 1); // ,0. 5,1); //more green
            static float4 color11 = float4(1, 1, 1, 1); // white

            float4 debugColor(float blendValue)
            {
                float4 color;
                if (blendValue < 1)
                    color = color1;
                else if (blendValue < 2)
                    color = lerp(color2, color3, blendValue - 1);
                else if (blendValue < 3)
                    color = lerp(color3, color4, blendValue - 2);
                else if (blendValue < 4)
                    color = lerp(color4, color5, blendValue - 3);
                else if (blendValue < 5)
                    color = lerp(color5, color6, blendValue - 4);
                else if (blendValue < 6)
                    color = lerp(color6, color7, blendValue - 5);
                else if (blendValue < 7)
                    color = lerp(color7, color8, blendValue - 6);
                else if (blendValue < 8)
                    color = lerp(color8, color9, blendValue - 7);
                else if (blendValue < 9)
                    color = lerp(color9, color10, blendValue - 8);
                else
                    color = color11;
                return color;
			}  
            
            struct Coordinates
            {
                half2 ddx;
                half2 ddy;
                half lod;
                half2 uvs;
                float3 pos;
                half3 triplanarBlend;
            };

            //Fancy filter that blends between point sampling and bilinear sampling
            half4 Tex2DSampleTexture(Texture2D tex, Coordinates coords)
            {
        #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
		        //float2 tx = coords.pos.yz; --Why is zy correct here for some things, and yz for others??
                //
                float2 tx = coords.pos.zy;
                float2 ty = coords.pos.xz;
                float2 tz = coords.pos.xy;

                half4 cx = tex.Sample(my_sampler_trilinear_repeat, tx) * coords.triplanarBlend.x;
                half4 cy = tex.Sample(my_sampler_trilinear_repeat, ty) * coords.triplanarBlend.y;
                half4 cz = tex.Sample(my_sampler_trilinear_repeat, tz) * coords.triplanarBlend.z;
                half4 color = (cx + cy + cz);
                return color;
        #endif

        #ifdef POINT_FILTER_ON

                const half bias = 0.0;//magic number, bigger value pushes the transition back further
                half blendValue = saturate((coords.lod) - bias);
                half4 pixelSample = tex.Sample(my_sampler_point_repeat, coords.uvs);

                float mipMap = coords.lod;
                mipMap = min(mipMap, 5); //clamp it because metal doesnt support partial mipmap chains (also possibly others)
                
                half4 filteredSample = tex.SampleLevel(my_sampler_trilinear_repeat, coords.uvs, mipMap);

                half4 blend = lerp(pixelSample, filteredSample, blendValue);

                //return half4(blend.x, blend.y, blendValue ,1);
                return blend;
        #elif !defined(EXPLICIT_MAPS_ON) && defined(SHADER_API_METAL) //Metal specific fix
                float mipMap = coords.lod;
                mipMap = min(mipMap, 5); //clamp it because metal doesnt support partial mipmap chains (also possibly others)
                
                half4 filteredSample = tex.SampleLevel(my_sampler_trilinear_repeat, coords.uvs, mipMap);
                return filteredSample;
        #else
                return tex.Sample(my_sampler_trilinear_repeat, coords.uvs);
        #endif
            }
            //Unity encoded normals (the pink ones)
            half3 UnpackNormalmapRGorAG(half4 packednormal)
            {
                packednormal.x *= packednormal.w;

                half3 normal;
                normal.xy = packednormal.xy * 2 - 1;
                normal.z = sqrt(1 - saturate(dot(normal.xy, normal.xy)));

                return normal;
            }

            float3 BlendTriplanarNormal(float3 mappedNormal, float3 surfaceNormal) 
            {
                float3 n;
                n.xy = mappedNormal.xy + surfaceNormal.xy;
                n.z = mappedNormal.z * surfaceNormal.z;
                return n;
            }

            half4 TriplanarMapNormal(Texture2D tex, Coordinates coords, half3 worldNormal)
            {
                //The trick here is to realize we can just swizzle the normals to get the correct X Y or Z transform
                half2 triUVx = coords.pos.zy;
                half2 triUVy = coords.pos.xz;
                half2 triUVz = coords.pos.xy;
                
                //Todo: Flip for the negative faces?
                half3 tangentNormalX = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVx));
                half3 tangentNormalY = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVy));
                half3 tangentNormalZ = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVz));

                //Blend with the 
                half3 worldNormalX = BlendTriplanarNormal(tangentNormalX, worldNormal.zyx).zyx * coords.triplanarBlend.x;
                half3 worldNormalY = BlendTriplanarNormal(tangentNormalY, worldNormal.xzy).xzy * coords.triplanarBlend.y;
                half3 worldNormalZ = BlendTriplanarNormal(tangentNormalZ, worldNormal) * coords.triplanarBlend.z;
                
                return half4(normalize(worldNormalX + worldNormalY + worldNormalZ),1);
            }


            half4 Tex2DSampleTextureUV(Texture2D tex, float4 uvs)
            {
                half4 cx = tex.Sample(my_sampler_trilinear_repeat, uvs);
                return cx;
            }
            
            half4 Tex2DSampleTextureDebug(Texture2D tex, Coordinates coords)
            {
                return debugColor(coords.lod);
            }

            half UnpackMetal(float metal)
            {
                return metal / 2.0;
            }

            half UnpackEmission(float metal)
            {
                float result = metal > 0.5;
                return result;
            }
     
            void fragFunction(vertToFrag input, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
            {
                Coordinates coords;  
                coords.uvs = input.uv_MainTex.xy; 
        #ifdef POINT_FILTER_ON
                float2 texture_coordinate = input.uv_MainTex.xy * _MainTex_TexelSize.zw;
                coords.ddx = ddx(texture_coordinate);
                coords.ddy = ddy(texture_coordinate);
                float delta_max_sqr = max(dot(coords.ddx, coords.ddx), dot(coords.ddy, coords.ddy));
                coords.lod = 0.5 * log2(delta_max_sqr);
        #elif !defined(EXPLICIT_MAPS_ON) && defined(SHADER_API_METAL) //Metal specific fix
                float2 texture_coordinate = input.uv_MainTex.xy * _MainTex_TexelSize.zw;
                coords.ddx = ddx(texture_coordinate);
                coords.ddy = ddy(texture_coordinate);
                float delta_max_sqr = max(dot(coords.ddx, coords.ddx), dot(coords.ddy, coords.ddy));
                coords.lod = 0.5 * log2(delta_max_sqr);
        #else
                coords.ddx = half2(0, 0);
                coords.ddy = half2(0, 0);
                coords.lod = 0;
        #endif
            
        #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
                coords.pos = input.triplanarPos;
                coords.triplanarBlend = input.triplanarBlend;
        #endif    
                half4 texSample = Tex2DSampleTexture(_MainTex, coords);

                half3 textureNormal;
                half3 worldNormal;
                half4 skyboxSample;

                half metallicLevel;
                half roughnessLevel;
                half emissiveLevel = 0;
                half4 reflectedCubeSample;
                half3 worldReflect;
                half alpha = _Alpha;

                half3 viewVector = _WorldSpaceCameraPos.xyz - input.worldPos;
                float viewDistance = length(viewVector);
                half3 viewDirection = normalize(viewVector);
                    
        #if EXPLICIT_MAPS_ON //Path used by anything passing in explicit maps like triplanar materials
                half4 metalSample = Tex2DSampleTexture(_MetalTex, coords);
                half4 roughSample = Tex2DSampleTexture(_RoughTex, coords);
                
            #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
                worldNormal = TriplanarMapNormal(_NormalTex, coords, input.worldNormal);
            #else
                half4 normalSample = (Tex2DSampleTexture(_NormalTex, coords));
                textureNormal = (UnpackNormalmapRGorAG(normalSample)); 
                textureNormal = normalize(textureNormal);
                
                worldNormal.x = dot(input.tspace0, textureNormal);
                worldNormal.y = dot(input.tspace1, textureNormal);
                worldNormal.z = dot(input.tspace2, textureNormal);
            #endif
                alpha = texSample.a * _Alpha;

                //worldNormal = (worldNormal); //Normalize?
                worldReflect = reflect(-viewDirection, worldNormal);

                //Note to self: should try and sample reflectedCubeSample as early as possible
                roughnessLevel = max(roughSample.r, 0.04);
                metallicLevel = metalSample.r;
            #if EMISSIVE_ON
                emissiveLevel = Tex2DSampleTexture(_EmissiveMaskTex, coords).r;
            #else
		        emissiveLevel = 0;
            #endif
                
        #else   //Path used by atlas rendering

            #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
                worldNormal = TriplanarMapNormal(_NormalTex, coords, input.worldNormal);
                half4 specialSample = Tex2DSampleTexture(_NormalTex, coords);
            #else
                //Path used by atlas rendering
                half4 specialSample = Tex2DSampleTexture(_NormalTex, coords);
                textureNormal = (TextureDecodeNormal(specialSample.xyz));
                textureNormal = normalize(textureNormal);

                worldNormal.x = dot(input.tspace0, textureNormal);
                worldNormal.y = dot(input.tspace1, textureNormal);
                worldNormal.z = dot(input.tspace2, textureNormal);
                //#else
            #endif
                worldReflect = reflect(-viewDirection, worldNormal);

                //Note to self: should try and sample reflectedCubeSample as early as possible
                roughnessLevel = max(specialSample.a, 0.04);

                //metallic is packed
                metallicLevel = UnpackMetal(specialSample.b);
            #if EMISSIVE_ON
                emissiveLevel = UnpackEmission(specialSample.b);
                _EmissiveMix = 0;
            #endif        
         
        #endif
           
                // Finish doing ALU calcs while the cubemap fetches in
        #ifdef SLIDER_OVERRIDE_ON
                metallicLevel = lerp(_MetalOverride, metallicLevel, _SliderOverrideMix);
                roughnessLevel = lerp(_RoughOverride, roughnessLevel, _SliderOverrideMix);
                roughnessLevel = max(roughnessLevel, 0.04);
        #endif

                float eyeMask = saturate(Tex2DSampleTexture(_EyeMaskTex, coords).r);
                roughnessLevel *= saturate(1-eyeMask+.01);
                
                reflectedCubeSample = texCUBElod(_CubeTex, half4(worldReflect, roughnessLevel * maxMips));;
                skyboxSample = texCUBE(_CubeTex, -viewDirection);
         
                half3 complexAmbientSample = SampleAmbientSphericalHarmonics(worldNormal);
                        
                //Shadows and light masks
                half sunShadowMask = GetShadow(input.shadowCasterPos0, input.shadowCasterPos1, worldNormal, globalSunDirection);
                //sunShadowMask = sunShadowMask *.8 + .2;//Never have shadows go full black
                half pointLight0Mask = 1;
                half pointLight1Mask = 1;
                half ambientOcclusionMask = 1;

                //Sun
                half RoL = max(0, dot(worldReflect, -globalSunDirection));
                half NoV = max(dot(viewDirection, worldNormal), 0);
                half NoL = dot(-globalSunDirection, worldNormal); // -1 to 1
                float eyeMaskStrength = saturate(RoL * eyeMask * NoV);
                
                /////////////////////////////////////////////////////
                //If you want to use half lambert 
                NoL = saturate((NoL + 1)*.5);
                /////////////////////////////////////////////////////

                half3 textureColor = texSample.xyz;

 

                //Specular
               // float eyeMask = tex2D(_EyeMaskTex, input.uv_MainTex);
                half3 specularColor;
                half3 diffuseColor;
                half dielectricSpecular = 0.08 * 0.3; //0.3 is the industry standard
                diffuseColor = textureColor - textureColor * metallicLevel;	// 1 mad
                specularColor = (dielectricSpecular - dielectricSpecular * metallicLevel) + textureColor * metallicLevel;	// 2 mad
                specularColor = EnvBRDFApprox(specularColor * _SpecularColor, roughnessLevel, NoV);
                /*//Alternate material for when metal is totally ignored
                    diffuseColor = textureColor;
                    half specLevel = EnvBRDFApproxNonmetal(roughnessLevel, NoV);
                    specularColor = half3(specLevel, specLevel, specLevel);
                */
                half3 imageSpecular = reflectedCubeSample.xyz;

                //Start compositing it all now
                half3 finalColor = half3(0, 0, 0);
                half3 sunIntensity = half3(0, 0, 0);

                //Diffuse colors
                diffuseColor *= input.baseColor;
                half3 ibl = globalSunColor;
         
                //Direct sun + specular
                
                //Sun Term
                half3 sunShine = (ibl * NoL);
                
                //Sun Specular
                half3 sunSpecular = specularColor * PhongApprox(roughnessLevel, RoL);
                //if(eyeStrength > .5)
                {
                    sunSpecular = eyeMaskStrength * .5;
                }
                //sunSpecular = round(sunSpecular) + ;
                //Sun Rim
                half3 sunRim = (NoL * imageSpecular * specularColor);
                //Final sun term
                half3 sunComposite = sunShine * diffuseColor + ((sunSpecular + sunRim) * globalSunBrightness);
                //Mask the sun based on the shadows
                half3 finalSun = lerp(sunComposite, sunComposite * sunShadowMask, globalSunShadow);
                
                //SH ambient 
                half3 ambientLight = (complexAmbientSample * globalAmbientTint);
  
                half3 finalAmbient = (ambientLight * diffuseColor);

                //Composite sun and ambient together
                finalColor = (finalSun + finalAmbient);
                
                //Start messing with the final color in fun ways
                //Ambient occlusion term
                finalColor *= ambientOcclusionMask;
        
                //Do point lighting
                finalColor.xyz += CalculatePointLightsForPoint(input.worldPos, worldNormal, diffuseColor, roughnessLevel, metallicLevel, specularColor, worldReflect);


                //Rim light
        #ifdef RIM_LIGHT_ON
                finalColor.xyz += RimLightSimple(worldNormal, viewDirection);
        #endif
                //Mix in fog
		        finalColor = CalculateAtmosphericFog(finalColor, viewDistance);
                       
        #ifdef EMISSIVE_ON  
                if (emissiveLevel > 0)
                {
                    float3 colorMix = lerp(finalColor, textureColor * input.baseColor, _EmissiveMix);
                    MRT0 = half4(colorMix.r, colorMix.g, colorMix.b, alpha);

                    float3 emissiveMix = lerp(diffuseColor.rgb, _EmissiveColor.rgb, _EmissiveMix);
                    MRT1 = half4(emissiveMix * _EmissiveColor.a, alpha);
                }
                else
                {
                    MRT0 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);

                    //Choose emissive based on brightness values
                    half brightness = max(max(finalColor.r, finalColor.g), finalColor.b) * (1 - roughnessLevel) * alpha;
               
                    ///if (brightness > globalSunBrightness + globalAmbientBrightness)
                    if (brightness > 0.95)
                    {
                        MRT1 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
                    }
                    else
                    {
                        MRT1 = half4(0, 0, 0, alpha);
                    }
		        
                }
        #else
                //finalColor = half4(eyeMask,eyeMask,eyeMask,eyeMask);
                MRT0 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);

                //Choose emissive based on brightness values
                half brightness = max(max(finalColor.r, finalColor.g), finalColor.b) * (1 - roughnessLevel) * alpha;

                ///if (brightness > globalSunBrightness + globalAmbientBrightness)
                if (brightness > 0.85)
                {
                    MRT1 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
                }
                else
                {
                    MRT1 = half4(0, 0, 0, alpha);
                }
        #endif        
            }
          
            ENDHLSL
        }
        
        Pass
        {
            // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
            Name "Forward"
            Tags { "LightMode" = "AirshipForwardPass" "Queue" = "Opaque"}

            //Blend[_SrcBlend][_DstBlend]
            ZWrite[_ZWrite]
              
            CGPROGRAM
            //Main programs
            #pragma vertex vert
            #pragma fragment frag
            
			#include "UnityCG.cginc"
            #include "../AirshipShaderIncludes.hlsl"
                       
            struct VertData
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
                float4 tangent : TANGENT;
                float2 UV : TEXCOORD0;
                float4 color      : COLOR;
                
                float2 instanceIndex : TEXCOORD7;
            };

            struct VertToFrag
            {
                float4 vertex : SV_POSITION;
                float2 uv : TEXCOORD0;
                float4 color      : COLOR;
                // these three vectors will hold a 3x3 rotation matrix
                // that transforms from tangent to world space
                half3 tspace0 : TEXCOORD1; // tangent.x, bitangent.x, normal.x
                half3 tspace1 : TEXCOORD2; // tangent.y, bitangent.y, normal.y
                half3 tspace2 : TEXCOORD3; // tangent.z, bitangent.z, normal.z
                float3 viewDir : TEXCOORD4;
                float cameraDistance: TEXCOORD5;
                float3 rimDot : TEXCOORD6;
                half3 worldNormal :TEXCOORD9;
                
            };
            
            VertToFrag vert (VertData v)
            {
                
                VertToFrag o;
                o.uv = v.UV;
                float4 worldPos = mul(unity_ObjectToWorld, v.vertex);
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.viewDir = normalize(UnityWorldSpaceViewDir(worldPos));
                o.color = v.color;

                //Normal Matrix
                half3 wNormal = UnityObjectToWorldNormal(v.normal);
                half3 wTangent = UnityObjectToWorldDir(v.tangent.xyz);
                // compute bitangent from cross product of normal and tangent
                half tangentSign = v.tangent.w * unity_WorldTransformParams.w;
                half3 wBitangent = cross(wNormal, wTangent) * tangentSign;
                
                // output the tangent space matrix
                o.tspace0 = half3(wTangent.x, wBitangent.x, wNormal.x);
                o.tspace1 = half3(wTangent.y, wBitangent.y, wNormal.y);
                o.tspace2 = half3(wTangent.z, wBitangent.z, wNormal.z);

                o.worldNormal = wNormal;

                //Custom angles
                o.cameraDistance = length(ObjSpaceViewDir(v.vertex));
                o.rimDot = saturate(dot(UnityObjectToWorldDir(normalize(globalSunDirection)), wNormal));
                               
                #if INSTANCE_DATA_ON
		            float4 instanceColor = _ColorInstanceData[v.instanceIndex.x];
                    o.color *= instanceColor;
                #endif
                
                return o;
            }

            void frag (VertToFrag i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
            {
                MRT0 = half4(1,0,0,1);
                MRT1 = half4(0,0,0,1);
            }
            
            ENDCG
        }
         
        Pass
        {
			Name "ShadowCaster"
            Tags
            {
                "RenderType" = "Opaque"
                "LightMode" = "AirshipShadowPass"
            }
            ZWrite On
            CGPROGRAM
                #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipSimpleShadowPass.hlsl"
            ENDCG
        }
    }
    
}
