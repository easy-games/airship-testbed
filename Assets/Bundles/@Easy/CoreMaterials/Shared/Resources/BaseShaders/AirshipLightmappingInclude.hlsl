#ifndef AIRSHIP_LIGHTING_INCLUDED
#define AIRSHIP_LIGHTING_INCLUDED

//For lightmapping
//We declare our own version of all these defines so that we dont need anything from the URP directly...
//I am not a fan of this kind of #define based metaprogramming - I'd rather they just made multiple files and selected the right one.

#define LIGHTMAP_NAME unity_Lightmap
#define LIGHTMAP_INDIRECTION_NAME unity_LightmapInd
#define LIGHTMAP_SAMPLER_NAME samplerunity_Lightmap
#define LIGHTMAP_SAMPLE_EXTRA_ARGS staticLightmapUV

#define TEXTURE2D(textureName)                Texture2D textureName
#define SAMPLER(samplerName)                  SamplerState samplerName
#define PLATFORM_SAMPLE_TEXTURE2D(textureName, samplerName, coord2)                               textureName.Sample(samplerName, coord2)
#define SAMPLE_TEXTURE2D(textureName, samplerName, coord2)                               PLATFORM_SAMPLE_TEXTURE2D(textureName, samplerName, coord2)
#define TEXTURE2D_ARGS(textureName, samplerName)                textureName, samplerName

#define TEXTURE2D_PARAM(textureName, samplerName)                 TEXTURE2D(textureName),         SAMPLER(samplerName)
#define TEXTURE2D_LIGHTMAP_PARAM TEXTURE2D_PARAM
#define TEXTURE2D_LIGHTMAP_ARGS TEXTURE2D_ARGS
#define SAMPLE_TEXTURE2D_LIGHTMAP SAMPLE_TEXTURE2D
#define LIGHTMAP_EXTRA_ARGS float2 uv
#define LIGHTMAP_EXTRA_ARGS_USE uv

#define LIGHTMAP_RGBM_MAX_GAMMA     float(5.0)       // NB: Must match value in RGBMRanges.h
#define LIGHTMAP_RGBM_MAX_LINEAR    float(34.493242) // LIGHTMAP_RGBM_MAX_GAMMA ^ 2.2

#ifdef UNITY_LIGHTMAP_RGBM_ENCODING
#ifdef UNITY_COLORSPACE_GAMMA
#define LIGHTMAP_HDR_MULTIPLIER LIGHTMAP_RGBM_MAX_GAMMA
#define LIGHTMAP_HDR_EXPONENT   float(1.0)   // Not used in gamma color space
#else
#define LIGHTMAP_HDR_MULTIPLIER LIGHTMAP_RGBM_MAX_LINEAR
#define LIGHTMAP_HDR_EXPONENT   float(2.2)
#endif
#elif defined(UNITY_LIGHTMAP_DLDR_ENCODING)
#ifdef UNITY_COLORSPACE_GAMMA
#define LIGHTMAP_HDR_MULTIPLIER float(2.0)
#else
#define LIGHTMAP_HDR_MULTIPLIER float(4.59) // 2.0 ^ 2.2
#endif
#define LIGHTMAP_HDR_EXPONENT float(0.0)
#else // (UNITY_LIGHTMAP_FULL_HDR)
#define LIGHTMAP_HDR_MULTIPLIER float(1.0)
#define LIGHTMAP_HDR_EXPONENT float(1.0)
#endif

#if defined(LIGHTMAP_ON)
#define DECLARE_LIGHTMAP_OR_SH(lmName, shName, index) float2 lmName : TEXCOORD##index
#define OUTPUT_LIGHTMAP_UV(lightmapUV, lightmapScaleOffset, OUT) OUT.xy = lightmapUV.xy * lightmapScaleOffset.xy + lightmapScaleOffset.zw;
#define OUTPUT_SH4(absolutePositionWS, normalWS, viewDir, OUT)
#else
#define DECLARE_LIGHTMAP_OR_SH(lmName, shName, index) half3 shName : TEXCOORD##index
#define OUTPUT_LIGHTMAP_UV(lightmapUV, lightmapScaleOffset, OUT)
#define OUTPUT_SH4(absolutePositionWS, normalWS, viewDir, OUT) OUT.xyz = SampleProbeSHVertex(absolutePositionWS, normalWS, viewDir)
#endif


float4 SampleDirectionalLightmapAirship(TEXTURE2D_LIGHTMAP_PARAM(lightmapTex, lightmapSampler), TEXTURE2D_LIGHTMAP_PARAM(lightmapDirTex, lightmapDirSampler), LIGHTMAP_EXTRA_ARGS, float4 transform,
    float3 normalWS, bool encodedLightmap, float4 decodeInstructions, inout float3 bakeDiffuseLighting)
{
    // In directional mode Enlighten bakes dominant light direction
   // in a way, that using it for half Lambert and then dividing by a "rebalancing coefficient"
   // gives a result close to plain diffuse response lightmaps, but normalmapped.

   // Note that dir is not unit length on purpose. Its length is "directionality", like
   // for the directional specular lightmaps.

   // transform is scale and bias
    uv = uv * transform.xy + transform.zw;

    float4 direction = SAMPLE_TEXTURE2D_LIGHTMAP(lightmapDirTex, lightmapDirSampler, LIGHTMAP_EXTRA_ARGS_USE);
 
    // Remark: baked lightmap is RGBM for now, dynamic lightmap is RGB9E5
    float3 illuminance = float3(0.0, 0.0, 0.0);
    if (encodedLightmap)
    {
        float4 encodedIlluminance = SAMPLE_TEXTURE2D_LIGHTMAP(lightmapTex, lightmapSampler, LIGHTMAP_EXTRA_ARGS_USE).rgba;
        illuminance = DecodeLightmap(encodedIlluminance, decodeInstructions);
    }
    else
    {
        illuminance = SAMPLE_TEXTURE2D_LIGHTMAP(lightmapTex, lightmapSampler, LIGHTMAP_EXTRA_ARGS_USE).rgb;
    }
    
    half halfLambert = dot(normalWS, direction.xyz - 0.5) + 0.5;
    bakeDiffuseLighting += illuminance * halfLambert / max(1e-4, direction.w);
    //bakeDiffuseLighting += illuminance;
    return direction;
}

// Just a shortcut that call function above
float3 SampleDirectionalLightmapAirship(TEXTURE2D_LIGHTMAP_PARAM(lightmapTex, lightmapSampler), TEXTURE2D_LIGHTMAP_PARAM(lightmapDirTex, lightmapDirSampler), LIGHTMAP_EXTRA_ARGS, float4 transform,
    float3 normalWS, bool encodedLightmap, float4 decodeInstructions, inout half4 lightDir)
{
    
    float3 bakeDiffuseLighting = 0.0;
    
    lightDir = SampleDirectionalLightmapAirship(TEXTURE2D_LIGHTMAP_ARGS(lightmapTex, lightmapSampler), TEXTURE2D_LIGHTMAP_ARGS(lightmapDirTex, lightmapDirSampler), LIGHTMAP_EXTRA_ARGS_USE, transform,
        normalWS, encodedLightmap, decodeInstructions, bakeDiffuseLighting);
    

    return bakeDiffuseLighting;
}

#if SHADER_API_MOBILE || SHADER_API_GLES3
#pragma warning (enable : 3205) // conversion of larger type to smaller
#endif

// Sample baked lightmap. Non-Direction and Directional if available.
// Realtime GI is not supported.
half3 SampleLightmapAirship(float2 staticLightmapUV, float2 dynamicLightmapUV, half3 normalWS, inout half4 lightDir)
{
#ifdef UNITY_LIGHTMAP_FULL_HDR
    bool encodedLightmap = false;
#else
    bool encodedLightmap = true;
#endif

    half4 decodeInstructions = half4(LIGHTMAP_HDR_MULTIPLIER, LIGHTMAP_HDR_EXPONENT, 0.0h, 0.0);

    // The shader library sample lightmap functions transform the lightmap uv coords to apply bias and scale.
    // However, universal pipeline already transformed those coords in vertex. We pass half4(1, 1, 0, 0) and
    // the compiler will optimize the transform away.
    half4 transformCoords = half4(1, 1, 0, 0);

    float3 diffuseLighting = 0;
    

#if defined(LIGHTMAP_ON) && defined(DIRLIGHTMAP_COMBINED)
    diffuseLighting = SampleDirectionalLightmapAirship(TEXTURE2D_LIGHTMAP_ARGS(LIGHTMAP_NAME, LIGHTMAP_SAMPLER_NAME),
        TEXTURE2D_LIGHTMAP_ARGS(LIGHTMAP_INDIRECTION_NAME, LIGHTMAP_SAMPLER_NAME),
        LIGHTMAP_SAMPLE_EXTRA_ARGS, transformCoords, normalWS, encodedLightmap, decodeInstructions, lightDir);
    
#elif defined(LIGHTMAP_ON)
    diffuseLighting = SampleSingleLightmap(TEXTURE2D_LIGHTMAP_ARGS(LIGHTMAP_NAME, LIGHTMAP_SAMPLER_NAME), LIGHTMAP_SAMPLE_EXTRA_ARGS, transformCoords, encodedLightmap, decodeInstructions);
    lightDir = half4(0, 0, 0 , 0);
#endif

#if defined(DYNAMICLIGHTMAP_ON) && defined(DIRLIGHTMAP_COMBINED)
    diffuseLighting += SampleDirectionalLightmap(TEXTURE2D_ARGS(unity_DynamicLightmap, samplerunity_DynamicLightmap),
        TEXTURE2D_ARGS(unity_DynamicDirectionality, samplerunity_DynamicLightmap),
        dynamicLightmapUV, transformCoords, normalWS, false, decodeInstructions);
    lightDir = half4(0, 0, 0, 0);
#elif defined(DYNAMICLIGHTMAP_ON)
    diffuseLighting += SampleSingleLightmap(TEXTURE2D_ARGS(unity_DynamicLightmap, samplerunity_DynamicLightmap),
        dynamicLightmapUV, transformCoords, false, decodeInstructions);
    lightDir = half4(0, 0, 0, 0);
#endif

    return diffuseLighting;
}
 
#endif
