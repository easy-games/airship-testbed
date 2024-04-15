export class MathUtil {
	/**
	 * An equal chance of returning either -1 or +1
	 */
	public static RandomSign() {
		return math.random() > 0.5 ? 1 : -1;
	}

	public static RandomFloat(min: number, max: number) {
		return this.Lerp(min, max, math.random());
	}

	/**
	 * Calculates an intermediate value between `a` and `b` given a `t`.
	 * @param a Start number.
	 * @param b Goal number.
	 * @param t A number between 0 and 1.0.
	 */
	public static Lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}

	/**
	 * Remap `n` from range `[oldMin, oldMax]` to `[min, max]`.
	 * @param n Number to remap.
	 * @param oldMin Old range minimum.
	 * @param oldMax Old range maximum.
	 * @param min New range minimum.
	 * @param max New range maximum.
	 */
	public static Map(n: number, oldMin: number, oldMax: number, min: number, max: number): number {
		return min + (max - min) * ((n - oldMin) / (oldMax - oldMin));
	}

	/**
	 * Floor all components of a Vector3.
	 * @param vec A Vector3.
	 * @returns `vec` with all components floored.
	 */
	public static FloorVec(vec: Vector3): Vector3 {
		return new Vector3(math.floor(vec.x), math.floor(vec.y), math.floor(vec.z));
	}

	/**
	 * Round all components of a Vector3.
	 * @param vec A Vector3.
	 * @returns `vec` with all components rounded.
	 */
	public static RoundVec(vec: Vector3): Vector3 {
		return new Vector3(math.round(vec.x), math.round(vec.y), math.round(vec.z));
	}

	/**
	 * Calculates how far along `v` is between `a` and `b`.
	 * @param a Start number.
	 * @param b Goal number.
	 * @param v A number between `a` and `b`.
	 */
	public static InvLerp(a: number, b: number, v: number): number {
		return (v - a) / (b - a);
	}

	public static Clamp(value: number, min = 0, max = 1) {
		if (value <= min) {
			return min;
		}
		if (value >= max) {
			return max;
		}
		return value;
	}

	public static ClampAngle(angle: number, min: number, max: number): number {
		angle = angle % 360;
		min = min % 360;
		max = max % 360;
		let inverse = false;
		let tmin = min;
		let tangle = angle;
		if (min > 180) {
			inverse = !inverse;
			tmin -= 180;
		}
		if (angle > 180) {
			inverse = !inverse;
			tangle -= 180;
		}
		let result = !inverse ? tangle > tmin : tangle < tmin;
		if (!result) {
			angle = min;
		}
		inverse = false;
		tangle = angle;
		let tmax = max;
		if (angle > 180) {
			inverse = !inverse;
			tangle -= 180;
		}
		if (max > 180) {
			inverse = !inverse;
			tmax -= 180;
		}
		result = !inverse ? tangle < tmax : tangle > tmax;
		if (!result) {
			angle = max;
		}
		return angle;
	}

	/// <summary>
	/// Returns the inverse of a Quaternion.
	/// </summary>
	/// <param name="value">The source Quaternion.</param>
	/// <returns>The inverted Quaternion.</returns>
	public static Inverse(value: Quaternion): Quaternion {
		//  -1   (       a              -v       )
		// q   = ( -------------   ------------- )
		//       (  a^2 + |v|^2  ,  a^2 + |v|^2  )

		let ls = value.x * value.x + value.y * value.y + value.z * value.z + value.w * value.w;
		let invNorm = 1.0 / ls;

		return new Quaternion(-value.x * invNorm, -value.y * invNorm, -value.z * invNorm, value.w * invNorm);
	}
}
