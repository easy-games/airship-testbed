#ifndef WORLDSHADER_INCLUDE
#define WORLDSHADER_INCLUDE

    #include "AirshipShaderIncludes.hlsl"
    


    //Main programs
    #pragma vertex vertFunction
    #pragma fragment fragFunction

    //Multi shader vars (you need these even if you're not using them, so that material properties can survive editor script reloads)
    float EXPLICIT_MAPS;
    float RIM_LIGHT;
    float SHADOW_COLOR;
    
        
    //Unity stuff
    //float4x4 unity_MatrixVP;
    //float4x4 unity_ObjectToWorld;
    //float4x4 unity_WorldToObject;
    //float4 unity_WorldTransformParams;
    //float3 _WorldSpaceCameraPos;

    //SamplerState sampler_MainTex;
    SamplerState my_sampler_point_repeat;
    SamplerState my_sampler_trilinear_repeat;
    
    Texture2D _MainTex;
    float4 _MainTex_TexelSize;
    Texture2D _NormalTex;
    Texture2D _MetalTex;
    Texture2D _RoughTex;
    Texture2D _EmissiveMaskTex;
    
    samplerCUBE _CubeTex;
    Texture2D _ColorMaskTex;

    float  _Alpha;
    float4 _Color;
    float4 _ColorMaskColor;
    float4 _ShadowColor;
    float4 _SpecularColor;
    float4 _OverrideColor;
    float _OverrideStrength;
    float4 _EmissiveColor;
    half _EmissiveMix;
    
    float4 _MainTex_ST;

    half _MetalOverride;
    half _RoughOverride;
    half _MRSliderOverrideMix;

    half _TriplanarScale;

    static const float maxMips = 12;//This is how many miplevels the cubemaps have

    

    struct Attributes
    {
        float4 positionOS   : POSITION;
        float4 color   : COLOR;
        float3 normal : NORMAL;
        float4 tangent: TANGENT;
        float4 uv_MainTex : TEXCOORD0;

        float2 instanceIndex : TEXCOORD7;

        ////////////////////
        float2 staticLightmapUV : TEXCOORD1;
        ////////////////////
    };

    struct vertToFrag
    {
        float4 positionCS : SV_POSITION;
        
        float4 baseColor : COLOR;
        float4 uv_MainTex : TEXCOORD1;
        float3 worldPos   : TEXCOORD2;

        half3  tspace0 : TEXCOORD3;
        half3  tspace1 : TEXCOORD4;
        half3  tspace2 : TEXCOORD5;

        half3 triplanarBlend : TEXCOORD7;
        float3 triplanarPos : TEXCOORD8;

        float4 shadowCasterPos0 :TEXCOORD9;
        float4 shadowCasterPos1 :TEXCOORD10;

        half3 worldNormal : TEXCOORD11;

        half3 viewVector : TEXCOORD12;

//If lightmapping /////////        
        float2 staticLightmapUV   : TEXCOORD13;
        float2 dynamicLightmapUV  : TEXCOORD14;
/////////////////        
    };

    vertToFrag vertFunction(Attributes input)
    {
        vertToFrag output;
        float4 worldPos = mul(unity_ObjectToWorld, input.positionOS);
        output.positionCS = mul(unity_MatrixVP, worldPos);

        // Transform the normal to world space and normalize it
        float3 shadowNormal = normalize(mul(float4(input.normal, 0.0), unity_WorldToObject).xyz);

#if SHADOWS_ON        
        //Calc shadow data
        output.shadowCasterPos0 = CalculateVertexShadowData0(worldPos, shadowNormal);
        output.shadowCasterPos1 = CalculateVertexShadowData1(worldPos, shadowNormal);
#endif
        
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

        output.worldPos = worldPos;
        output.baseColor = _Color;
#ifdef INSTANCE_DATA_ON
        float4 instanceColor = _ColorInstanceData[input.instanceIndex.x];
        output.baseColor = instanceColor;
 
#endif
        
        output.baseColor = lerp(output.baseColor, _OverrideColor, _OverrideStrength);
        

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

        output.viewVector = worldPos - _WorldSpaceCameraPos.xyz;

//Lightmapping
        OUTPUT_LIGHTMAP_UV(input.staticLightmapUV, unity_LightmapST, output.staticLightmapUV);
#ifdef DYNAMICLIGHTMAP_ON
        output.dynamicLightmapUV = input.dynamicLightmapUV.xy * unity_DynamicLightmapST.xy + unity_DynamicLightmapST.zw;
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
 
    half UnpackMetal(float metal)
    {
        return metal / 2.0;
    }

    half UnpackEmission(float metal)
    {
        float result = metal > 0.5;
        return result;
    }
  
    float3 envSampleLOD(float3 dir, float lod)
    {
        return texCUBElod(_CubeTex, half4(dir, lod)).rgb;
    }
    
    float3 pbrComputeSpecularMobileCheap(float3 viewDirection, float3 normal, float3 specColor, float roughness, float3 cubemapSample)
    {
        float3 radiance = float3(0, 0, 0);
        float ndv = dot(viewDirection, normal);
        specColor = EnvBRDFApprox(specColor, roughness, max(ndv, 0));
        radiance = cubemapSample * specColor;

        return radiance;
    }

    float3 pbrComputeDiffuse(float3 dir, float3 diffColor)
    {
        return SampleAmbientSphericalHarmonics(dir) * diffColor;
    }

    float3 pbrComputeBRDFMobile(float3 viewDirection, float3 normal, float3 diffColor, float3 specColor, float roughness, float3 cubemapSample)
    {
        return pbrComputeDiffuse(normal, diffColor) + pbrComputeSpecularMobileCheap(viewDirection, normal, specColor, roughness, cubemapSample);
    }
    
    void fragFunction(vertToFrag input, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1
#ifdef DOUBLE_SIDED_NORMALS
        , FRONT_FACE_TYPE frontFace : FRONT_FACE_SEMANTIC
#endif    
    )
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
        
        half metallicLevel;
        half roughnessLevel;
        half emissiveLevel = 0;
        half4 reflectedCubeSample;
        half3 worldReflect;
        half alpha = _Alpha;
             
        half3 viewVector = input.viewVector;
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

        worldNormal = normalize(worldNormal); //Normalize?
#ifdef DOUBLE_SIDED_NORMALS
        worldNormal *= IS_FRONT_VFACE(worldNormal, 1, -1);
#endif

        worldReflect = reflect(viewDirection, worldNormal);
        
        //Note to self: should try and sample reflectedCubeSample as early as possible
        roughnessLevel = max(roughSample.r, 0.04);
        metallicLevel = metalSample.r;
    #if EXTRA_FEATURES_ON
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
        worldReflect = reflect(viewDirection, worldNormal);

        //Note to self: should try and sample reflectedCubeSample as early as possible
        roughnessLevel = max(specialSample.a, 0.04);

        //metallic is packed
        metallicLevel = UnpackMetal(specialSample.b);
    #if EXTRA_FEATURES_ON
        emissiveLevel = UnpackEmission(specialSample.b);
        _EmissiveMix = 0;
    #endif

#endif

        metallicLevel = lerp(metallicLevel, _MetalOverride, _MRSliderOverrideMix);
        roughnessLevel = lerp(roughnessLevel, _RoughOverride, _MRSliderOverrideMix);
        roughnessLevel = max(roughnessLevel, 0.04);

        //Start fetching the cubemap as early as possible
        float3 cubemapSample = envSampleLOD(-reflect(-viewDirection, worldNormal), roughnessLevel * maxMips);


        //Shadows and light masks
#if SHADOWS_ON        
        half sunShadowMask = GetShadow(input.shadowCasterPos0, input.shadowCasterPos1, worldNormal, globalSunDirection);
#else
        half sunShadowMask = 0;
#endif
        
        //Sun
        half RoL = max(0, dot(worldReflect, -globalSunDirection));
        half NoV = max(dot(viewDirection, worldNormal), 0);
        half NoL = dot(-globalSunDirection, worldNormal); // -1 to 1

        /////////////////////////////////////////////////////
        //If you want to use half lambert
        //NoL = saturate((NoL + 1)*.5);
        /////////////////////////////////////////////////////
                
        //If using a color mask
#if EXTRA_FEATURES_ON
        //Use a color texture to determine if the baseColor effects the scene
        //White on the color mask = use base color. Black on the color mask = only use texture color
        half3 albedo = lerp(texSample.xyz * _ColorMaskColor, texSample.xyz * input.baseColor.rgb, Tex2DSampleTexture(_ColorMaskTex, coords).r);
#else
        //Otherwise always use the color
        half3 albedo = texSample.xyz * input.baseColor.rgb;
#endif
  
        //PBR setup
        half3 specularColor;
        half3 diffuseColor;
		
        float dielectricSpecular = 0.08 * 1;
        diffuseColor = max(albedo - albedo * metallicLevel, 0);		 
        specularColor = (dielectricSpecular - dielectricSpecular * metallicLevel) + albedo * metallicLevel;	 

#ifndef LIGHTPROBE_ON      
        //Image based lighting
        float3 imageBasedLighting = pbrComputeBRDFMobile(-viewDirection, worldNormal, diffuseColor, specularColor, roughnessLevel, cubemapSample);
       
        //If we're using separate shadow tints NPR
//#ifdef USE_SHADOW_COLOR_ON
        //half3 finalAmbient = lerp((imageBasedLighting * _ShadowColor), (imageBasedLighting * albedo), sunShadowMask);
//#else
        half3 finalAmbient = imageBasedLighting;
//#endif
        //Slider
        finalAmbient *= globalAmbientBrightness;
#else
        half3 finalAmbient = half3(0, 0, 0);
#endif


        half3 lightProbe = half3(0, 0, 0);
#ifdef LIGHTPROBE_ON 
#ifndef LIGHTMAP_ON        
        //only do lightprobes for materials that that dont have lightmaps
        half3 lightColor = SampleUnityLightProbe(worldNormal) * diffuseColor;
        lightProbe = lightColor;// pbrComputeBRDFMobile(-viewDirection, worldNormal, diffuseColor, specularColor, roughnessLevel, lightColor);
#endif         
#endif
        
        //Sun based Lighting
        half3 phongSpec = PhongApprox(roughnessLevel, RoL) * specularColor;
         
        //Direct sun + specular
        half3 sunColor = (globalSunColor * globalSunBrightness);
         
        //Final sun term
        half3 sunComposite = (diffuseColor + phongSpec) + (cubemapSample * specularColor);
        
        sunComposite *= NoL;
        sunComposite *= globalSunBrightness;
        
        //Mask in the sun, based on the shadows
        half3 finalSun = max( lerp(sunComposite, sunComposite * sunShadowMask, globalSunShadow),0);
   
        //PointLighting
        float3 pointLights = CalculatePointLightsForPoint(input.worldPos, worldNormal, diffuseColor, roughnessLevel, metallicLevel, specularColor, worldReflect, cubemapSample);


        half3 lightmapping = half3(0, 0, 0);
#ifdef LIGHTMAP_ON
        half4 lightmapNormal = half4(0, 0, 0,0);
        half3 lightmappingSample = SampleLightmapAirship(input.staticLightmapUV, input.dynamicLightmapUV, worldNormal, lightmapNormal);
        
        half3 lightmapDir = normalize(lightmapNormal.xyz - 0.5);
        half pRoL = max(0, dot(worldReflect, lightmapDir));
        half3 lightmapPhongSpec = PhongApprox(roughnessLevel, pRoL) * specularColor;
       
		half lightmapBrightness = max(lightmappingSample.r, max(lightmappingSample.g, lightmappingSample.b));
        half strength = lightmapNormal.w * lightmapBrightness;
        //strength *= strength;
        //work out what bit is the directional light component
        half3 lightmapPhong = lightmappingSample * (diffuseColor + lightmapPhongSpec * strength) + (cubemapSample * specularColor * strength);
        lightmapping = max(lightmapPhong,0);
#endif                

        //Start compositing now
        float3 finalColor = finalSun + finalAmbient + pointLights + lightmapping + lightProbe;
      
        //Rim light
#ifdef EXTRA_FEATURES_ON
        finalColor.xyz += RimLightSimple(worldNormal, -viewDirection);
#endif
        //Mix in fog
		finalColor = CalculateAtmosphericFog(finalColor, viewDistance);
    
        //Write time
        half4 MRT0Val;
        half4 MRT1Val;

#ifdef EXTRA_FEATURES_ON
        if (emissiveLevel > 0)
        {
            float3 colorMix = lerp(finalColor, albedo, _EmissiveMix);
            MRT0Val = half4(colorMix.r, colorMix.g, colorMix.b, alpha);

            float3 emissiveMix = lerp(diffuseColor.rgb, _EmissiveColor.rgb, _EmissiveMix);
            MRT1Val = half4(emissiveMix * _EmissiveColor.a, alpha);
        }
        else
        {
            MRT0Val = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
            MRT1Val = DoBloomCutoff(finalColor, alpha, 2);
        }
#else
        MRT0Val = half4(finalColor.r, finalColor.g, finalColor.b, alpha);

        //Choose emissive based on brightness values
        //half brightness = max(max(finalColor.r, finalColor.g), finalColor.b) * (1 - roughnessLevel) * alpha;
      
        ///if (brightness > globalSunBrightness + globalAmbientBrightness)
        MRT1Val = DoBloomCutoff(finalColor, alpha, 2);
#endif

        DoFinalColorWrite(MRT0Val, MRT1Val, MRT0, MRT1);
        
    }

#endif