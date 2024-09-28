#ifndef WORLDPOSITIONSHADERGRAPH
#define WORLDPOSITIONSHADERGRAPH


void PositionToUV_float(float uvScale, float3 position, float3 normal, out float2 xPlane, out float2 yPlane, out float2 zPlane)
{
	position *= uvScale;

	if (normal.z > 0) {
		xPlane = float2(-position.x, position.y);
	} else {
		xPlane = float2(position.x, position.y);
	}
	
	if (normal.x > 0) {
		yPlane = float2(position.z, position.y);
	}
	else {
		yPlane = float2(-position.z, position.y);
	}
	
	if (normal.y > 0) {
		zPlane = float2(position.x, position.z);
	}
	else {
		zPlane = float2(-position.x, position.z);
	}
	
}



#endif