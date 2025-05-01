
using Mirror;
using UnityEngine;

public class LagTest : NetworkBehaviour {
    public Transform position1;
    public Transform position2;
    public float time;

    private float lastDelta = 0;
    
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    private void FixedUpdate() {
        if (!isServer) return;
        var delta = (float) (NetworkTime.time % time) / time;
        if (lastDelta > delta) {
            var oldPos1 = position1;
            position1 = position2;
            position2 = oldPos1;
        }
        lastDelta = delta;
        this.transform.position = Vector3.Lerp(position1.position, position2.position, delta);
    }
}
