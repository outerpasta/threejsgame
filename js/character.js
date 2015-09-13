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
            gravity      : -10,
            jump         : false,
            jumpVelocity : 0,
            jumpDelta    : 0,
            jumpPower    : 5,

            airborne : true,
            position : new THREE.Vector3(),
            velocity : new THREE.Vector3(),
            rotation : new THREE.Vector2(),
            spinning : new THREE.Vector2()
        };
        this.m.position.copy( this.mesh.position );

        // Set the rays : one vector for every potential direction
        this.rays = {
            'back'          : new THREE.Vector3(0, 0, 1),
            'back-right'    : new THREE.Vector3(1, 0, 1),
            'right'         : new THREE.Vector3(1, 0, 0),
            'forward-right' : new THREE.Vector3(1, 0, -1),
            'forward'       : new THREE.Vector3(0, 0, -1),
            'forward-left'  : new THREE.Vector3(-1, 0, -1),
            'left'          : new THREE.Vector3(-1, 0, 0),
            'back-left'     : new THREE.Vector3(-1, 0, 1),
            'up'            : new THREE.Vector3(0, -1, 0),
            'down'          : new THREE.Vector3(0, 1, 0)
        };

        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();


//        this.projector = new THREE.Projector();
//        this.mesh.add(this.projector);


    },
//    jump: function () {
//        this.m.position.y += 200;
//        console.log('jump')
//    },


    collision: function (velocity) {
        'use strict';
        var collisions,
            obstacles = basicScene.world.getObstacles();

        for(var key in this.rays) {
            if (this.rays.hasOwnProperty(key)) {
                this.caster.set(this.mesh.position, this.rays[key]);
                collisions = this.caster.intersectObjects(obstacles);
                if (collisions.length > 0) this.collide(this.rays[key], collisions[0], velocity);
            }
        }
    },
    collide: function (ray, collision, velocity) {
        if (collision.distance <= this.m.rayDistance) {
            if (ray.x) {velocity.setX(ray.x - ray.x * 2);}
            if (ray.y) {
                if (ray.y > 0) {                        // up
                    velocity.setY(ray.y - ray.y * 2);
                } else {                                // down
                    this.m.airborne = false;
                    if (collision.distance < this.m.rayDistance - 1) {
                        if (collision.distance < this.m.rayDistance - 20) {
                            velocity.setY(+((this.m.rayDistance - collision.distance)/10).toFixed(2));
                        } else {velocity.setY(0);}
                    } else {velocity.setY(0);}
                }
            }
            if (ray.z) {velocity.setZ(ray.z - ray.z * 2);}
        }

    },
    update: function (x, y) {
        'use strict';
        // invert joystick direction, and modulate speed
        x = (x - (x * 2))/3000;
        y = y / 10;
        if(Math.abs(x)>=Math.abs(this.m.spinning.x)) this.m.spinning.x = x;

        this.m.forward.set(
            Math.sin( this.m.rotation.x ),
            0,
            Math.cos( this.m.rotation.x )
        );
        this.m.forward.multiplyScalar( y );

//        if (this.m.airborne) console.log('airborne');

        if (this.m.airborne) this.m.forward.y += this.m.gravity;// Gravity

        if (!this.m.airborne) this.m.jumpVelocity = 0;


//        /////////////////////////////////Jump Logic
//        if (this.m.jump == true && this.m.airborne == false) {
//            this.m.position.y += 1;
//            this.m.jumpDelta = this.m.jumpPower;
//            this.jumpStep();
//            this.m.airborne = true;
//            this.m.jump     = false;
//        } else if (this.m.airborne) {
//            this.jumpStep();
//        }
//        /////////////////////////////////

        this.m.airborne = true;
        this.collision(this.m.forward);

        this.m.velocity.y = this.m.forward.y; // if( Math.abs( this.m.forward.y ) >= Math.abs( this.m.velocity.y ) ) this.m.velocity.y = this.m.forward.y;
        if( Math.abs( this.m.forward.x ) >= Math.abs( this.m.velocity.x ) ) this.m.velocity.x = this.m.forward.x;
        if( Math.abs( this.m.forward.z ) >= Math.abs( this.m.velocity.z ) ) this.m.velocity.z = this.m.forward.z;

        this.m.rotation.add( this.m.spinning );
        this.m.position.add( this.m.velocity );

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