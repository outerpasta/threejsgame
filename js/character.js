var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';

        // Set the character modelisation object
        this.mesh = new THREE.Object3D();

        // Set and add its body
        this.body = new THREE.Mesh(
            new THREE.SphereGeometry(50, 32, 32),
            new THREE.MeshLambertMaterial(args)
        );
        this.body.castShadow = true;
//        this.body.position.y += 48;

        this.mesh.add(this.body);
//        this.mesh.position.y = 48;

        // Set the vector of the current motion
        this.m = {
            // Maximum distance from the origin before we consider collision
            rayDistance: 50,

            forward      : new THREE.Vector3(), //necessary?
            displacement : new THREE.Vector3(), //necessary?
            angles       : new THREE.Vector2(), //necessary?
            damping      : 0.9,
            gravity      : -10,
            jump         : false,
            jumpVelocity : 0,
            jumpDelta    : 0,
            jumpPower    : 50,  // add for gravity

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
    reset: function () {
        this.m.forward      = new THREE.Vector3(); //necessary?
        this.m.displacement = new THREE.Vector3(); //necessary?
        this.m.angles       = new THREE.Vector2(); //necessary?
        this.m.jump         = false;
        this.m.jumpVelocity = 0;
        this.m.jumpDelta    = 0;
        this.m.airborne     = true;
        this.m.position     = new THREE.Vector3();
        this.m.velocity     = new THREE.Vector3();
        this.m.rotation     = new THREE.Vector2();
        this.m.spinning     = new THREE.Vector2();
    },
    collision: function (velocity) {
        'use strict';
        var collisions,
            obstacles = basicScene.world.getObstacles();
        this.m.airborne = true;
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
        x = (x - (x * 2))/1000;
        y = y / 4;

        if (y > 0) y *= 0.5; // half speed backwards

        if(Math.abs(x)>=Math.abs(this.m.spinning.x)) this.m.spinning.x = x;

        this.m.forward.set(
            Math.sin( this.m.rotation.x ),
            0,
            Math.cos( this.m.rotation.x )
        );
        this.m.forward.multiplyScalar( y );

        if (this.m.airborne) this.m.forward.y += this.m.gravity; // Gravity

        this.jump();
        this.collision(this.m.forward);

        this.m.velocity.y = this.m.forward.y; // if( Math.abs( this.m.forward.y ) >= Math.abs( this.m.velocity.y ) ) this.m.velocity.y = this.m.forward.y;
        if( Math.abs( this.m.forward.x ) >= Math.abs( this.m.velocity.x ) ) this.m.velocity.x = this.m.forward.x;
        if( Math.abs( this.m.forward.z ) >= Math.abs( this.m.velocity.z ) ) this.m.velocity.z = this.m.forward.z;

        this.move();

        if (this.mesh.position.y < -800) this.reset();
    },
    move: function () {
        this.m.rotation.add( this.m.spinning );
        this.m.position.add( this.m.forward );

        this.m.spinning.multiplyScalar( this.m.damping );
        this.m.velocity.multiplyScalar( this.m.damping );

        this.mesh.position.copy( this.m.position );
        this.mesh.rotation.y = this.m.rotation.x;
    },
    jump: function () {
        if (this.m.jump == true && this.m.airborne == false) {
            this.m.jump = false;
            this.m.jumpVelocity = this.m.jumpPower;
            this.m.position.y += this.m.jumpVelocity;
            this.jumpStep();
        } else if (this.m.airborne) {
            this.jumpStep();
        }
        this.m.forward.y += this.m.jumpVelocity;
    },
    jumpStep: function () {
//        if (!this.m.jumpDelta == 0) this.m.jumpDelta -= .1;
        this.m.jumpVelocity -= 3;
    }
});