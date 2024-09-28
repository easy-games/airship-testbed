#ifndef WORLDPOSITIONSHADERGRAPH
#define WORLDPOSITIONSHADERGRAPH


void PositionToUV_float(float uvScale, float3 position, out float2 xPlane, out float2 yPlane, out float2 zPlane)
{
	position *= uvScale;
	xPlane = float2(position.x, position.y);
	yPlane = float2(position.z, position.y);
	zPlane = float2(position.x, position.z);
}



#endif