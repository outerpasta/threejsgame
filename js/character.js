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
            // Maximum distance from the origin before we consider collision
            rayDistance: 100,

            forward      : new THREE.Vector3(), //necessary?
            displacement : new THREE.Vector3(), //necessary?
            angles       : new THREE.Vector2(), //necessary?
            damping      : 0.9,
            gravity      : -4,
            jump         : false,
            jumpVelocity : 0,
            jumpDelta    : 0,
            jumpPower    : 8,

            airborne : true,
            position : new THREE.Vector3(),
            velocity : new THREE.Vector3(),
            rotation : new THREE.Vector2(),
            spinning : new THREE.Vector2()
        };
        this.m.position.copy( this.mesh.position );

        // Set the rays : one vector for every potential direction
        this.rays = [
            new THREE.Vector3(0, 0, 1),  // forward
            new THREE.Vector3(1, 0, 1),  // forward-left
            new THREE.Vector3(1, 0, 0),  // left
            new THREE.Vector3(1, 0, -1), // back-left
            new THREE.Vector3(0, 0, -1), // back
            new THREE.Vector3(-1, 0, -1),//
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1),

            new THREE.Vector3(0, -1, 0),// down
            new THREE.Vector3(0, 1, 0)  // up
        ];

        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();


//        this.projector = new THREE.Projector();
//        this.mesh.add(this.projector);


    },
//    jump: function () {
//        this.m.position.y += 200;
//        console.log('jump')
//    },
    collision: function () {
        'use strict';
        var collisions,
            obstacles = basicScene.world.getObstacles();

        this.m.airborne = true;
        for (var i = 0; i < this.rays.length; i += 1) {
            this.caster.set(this.mesh.position, this.rays[i]);
            collisions = this.caster.intersectObjects(obstacles);
            for (var ii = 0;ii < collisions.length;ii += 1) {
                if (collisions[ii].distance <= this.m.rayDistance) {

                    // Down
                    if (i == 8) {
//                        if (this.m.jump) {
////                            this.m.velocity.y += 1;
//                            break;
//                        }
                        this.m.jumpVelocity = 0;
//                        this.m.airborne = false;
//                        this.m.jump = false;
                        if (collisions[ii].distance < this.m.rayDistance ) {
                            this.m.airborne = false;
//                            this.m.velocity.setY(distance - collisions[ii].distance);
                            this.m.velocity.setY(Math.round(this.m.rayDistance - collisions[ii].distance));
                            console.log(this.m.velocity.y);
//                            this.m.velocity.setY(+(distance - collisions[ii].distance).toFixed(2));
                            if (this.m.velocity.y > 10) console.log(this.m.velocity.y);
                        } else {
                            this.m.velocity.setY(0);
                            this.m.airborne = false;
                        }

                        if (this.m.velocity.y > 3) {
                            this.m.velocity.y -= 1;
                        }


                    // Other Directions
                    }else {
                        this.m.velocity.setX(this.rays[i].x - this.rays[i].x * 2);
                        this.m.velocity.setY(this.rays[i].y - this.rays[i].y * 2);
                        this.m.velocity.setZ(this.rays[i].z - this.rays[i].z * 2);
                    }
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
//            this.m.velocity.y,
            0,
            Math.cos( this.m.rotation.x )
        );
        this.m.forward.multiplyScalar( y );
        if (this.m.airborne) this.m.forward.y += this.m.gravity;// Gravity
//        this.m.forward.y += this.m.gravity;// Gravity

        if( Math.abs( this.m.forward.y ) >= Math.abs( this.m.velocity.y ) ) this.m.velocity.y = this.m.forward.y;
        if( Math.abs( this.m.forward.x ) >= Math.abs( this.m.velocity.x ) ) this.m.velocity.x = this.m.forward.x;
        if( Math.abs( this.m.forward.z ) >= Math.abs( this.m.velocity.z ) ) this.m.velocity.z = this.m.forward.z;

        if (this.m.jump == true && this.m.airborne == false) {
            this.m.position.y += 1;
            this.m.jumpDelta = this.m.jumpPower;
            this.jumpStep();
            this.m.airborne = true;
            this.m.jump     = false;
        } else if (this.m.airborne) {
            this.jumpStep();
        }

        if (!this.m.airborne) this.m.jumpVelocity = 0

//        if (this.m.velocity.y > this.m.gravity) {
            this.m.velocity.y += this.m.jumpVelocity;
//        }

        this.collision();

        this.m.rotation.add( this.m.spinning );
        this.m.position.add( this.m.velocity );
//        console.log('this.m.jumpVelocity: ', this.m.jumpVelocity);
//        console.log('this.m.velocity.y: ', this.m.velocity.y);

//        if ( this.m.velocity.y < 0 ) console.log('falling');

        this.m.spinning.multiplyScalar( this.m.damping );
        this.m.velocity.multiplyScalar( this.m.damping );

        this.mesh.position.copy( this.m.position );
        this.mesh.rotation.y = this.m.rotation.x;
    },
    jumpStep: function () {

//        if (!this.m.jumpDelta < this.m.gravity) this.m.jumpDelta -= .01;

        this.m.jumpDelta -= .1;
//        this.m.jumpVelocity += this.m.jumpDelta;
        if (this.m.jumpDelta) this.m.jumpVelocity = this.m.jumpDelta;


//        console.log(!this.m.jumpDelta < this.m.gravity);
//        console.log(this.m.jumpDelta,this.m.gravity);
//        console.log('jumpDelta', this.m.jumpDelta);
//        console.log('jumpVelocity', this.m.jumpVelocity);
//        console.log('velocity.y', this.m.velocity.y);
    }
});