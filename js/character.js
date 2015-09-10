var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';

        // Set the character modelisation object
        this.mesh = new THREE.Object3D();

        // Set and add its body
        this.body = new THREE.Mesh(
            new THREE.SphereGeometry(16, 8, 8),
            new THREE.MeshLambertMaterial(args)
        );
        this.body.castShadow = true;
//        this.body.position.y += 48;

        this.mesh.add(this.body);
//        this.mesh.position.y = 48;

        // Set the vector of the current motion
        this.m = {

            forward      : new THREE.Vector3(), //necessary?
            displacement : new THREE.Vector3(), //necessary?
            angles       : new THREE.Vector2(), //necessary?
            damping      : 0.9,

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
            new THREE.Vector3(-1, 0, 1),

            new THREE.Vector3(0, -1, 0),
        ];

        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();


//        this.projector = new THREE.Projector();
//        this.mesh.add(this.projector);


    },
    collide: function (dir) {
        this.m.velocity = new THREE.Vector3(
            dir.x - dir.x * 2,
            dir.y - dir.y * 2,
            dir.z - dir.z * 2
        );
    },
    collision: function () {
        'use strict';
        var collisions,
            // Maximum distance from the origin before we consider collision
            distance = 100,
            // Get the obstacles array from our world
            obstacles = basicScene.world.getObstacles();
        // For each ray
        for (var i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // We reset the raycaster to this direction
                this.caster.set(this.mesh.position, this.rays[i]);
                // Test if we intersect with any obstacle mesh
                collisions = this.caster.intersectObjects(obstacles);
                // And disable that direction if we do
                if (collisions.length > 0) {
//                    for (var ii; ii < collisions.length; ii += 1 ) {
                    this.collide(this.rays[i]);
//                    }

//                //Yep, this.rays[i] gives us : 0 => forward, 1 => left, 2 => back, 3 => right
//                console.log(JSON.stringify(collisions));return true;
//                if ((i === 0 || i === 2 ) && this.m.velocity.z > 0) {
//                    this.m.velocity.setZ(0);
//                    this.m.velocity.setX(0);
//                    this.m.velocity.z -= this.m.velocity.z * 2;
//                }
//                if ((i === 1 || i === 3 ) && this.m.velocity.x > 0) {
//                    this.m.velocity.setX(0);
//                    this.m.velocity.setZ(0);
//                    this.m.velocity.x -= this.m.velocity.x * 2;
//                }
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