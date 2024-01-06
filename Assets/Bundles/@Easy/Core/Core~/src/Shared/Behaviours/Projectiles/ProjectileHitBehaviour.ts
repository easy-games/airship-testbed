export default class ProjectileHitBehaviour extends AirshipBehaviour {
	public knockbackOnHit = false;
	public knockbackModifier = new Vector3();
	public knockbackForce = 1;

	public ProjectileHit(direction: Vector3) {
		const rb = this.gameObject.GetComponent<Rigidbody>();
		if (rb) {
			rb.AddForce(direction.add(this.knockbackModifier).mul(this.knockbackForce), ForceMode.Impulse);
		}
	}
}
