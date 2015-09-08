var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';

        // Set the character modelisation object
        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 48;

        // Set and add its body
        this.body = new THREE.Mesh(
            new THREE.SphereGeometry(32, 16, 16),
            new THREE.MeshLambertMaterial(args)
        );
        this.body.castShadow = true;
        this.mesh.add(this.body);

        // Set the vector of the current motion
        this.m = {

            forward      : new THREE.Vector3(), //necessary?
            displacement : new THREE.Vector3(), //necessary?
            angles       : new THREE.Vector2(), //necessary?
            damping      : 0.93,

            airborne : false,
            position : new THREE.Vector3(),
            velocity : new THREE.Vector3(),
            rotation : new THREE.Vector2(),
            spinning : new THREE.Vector2()
        };
        this.m.position.copy( this.mesh.position );

        // Set the rays : one vector for every potential direction
        this.rays = [
            new THREE.Vector3(0, 0, 1),  // up
            new THREE.Vector3(1, 0, 1),  // up-left
            new THREE.Vector3(1, 0, 0),  // left
            new THREE.Vector3(1, 0, -1), // down-left
            new THREE.Vector3(0, 0, -1), // down
            new THREE.Vector3(-1, 0, -1),//
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1)
        ];
        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();
    },
    collision: function () {
        'use strict';
        var collisions, i,
            // Maximum distance from the origin before we consider collision
            distance = 32,
            // Get the obstacles array from our world
            obstacles = basicScene.world.getObstacles();
        // For each ray
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.m.velocity.z > 0) {
                    this.m.velocity.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.m.velocity.z < 0) {
                    this.m.velocity.setZ(0);
                }

                if ((i === 1 || i === 2 || i === 3) && this.m.velocity.x > 0) {
                    this.m.velocity.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.m.velocity.x < 0) {
                    this.m.velocity.setX(0);
                }
            }
        }
    },
    update: function (x, y) {
        'use strict';
        // invert joystick direction, and modulate speed
        x = (x - (x * 2))/3000;
        y = y / 10;

        //KeyboardControls
        if( Math.abs( x ) >= Math.abs( this.m.spinning.x ) ) {
            this.m.spinning.x = x;
        }

        this.m.forward.set(
            Math.sin( this.m.rotation.x ),
            0,
            Math.cos( this.m.rotation.x )
        );
        this.m.forward.multiplyScalar( y );

        if( Math.abs( this.m.forward.x ) >= Math.abs( this.m.velocity.x ) ) {
            this.m.velocity.x = this.m.forward.x;
        }
        if( Math.abs( this.m.forward.z ) >= Math.abs( this.m.velocity.z ) ) {
            this.m.velocity.z = this.m.forward.z;
        }

        this.collision();

        this.m.rotation.add( this.m.spinning );
        this.m.position.add( this.m.velocity );

        this.m.spinning.multiplyScalar( this.m.damping );
        this.m.velocity.multiplyScalar( this.m.damping );

        this.mesh.position.copy( this.m.position );
        this.mesh.rotation.y = this.m.rotation.x;
    }
});