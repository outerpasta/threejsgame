var BasicScene = Class.extend({
    // Class constructor
    init: function () {
        'use strict';
        // Create a scene
        this.scene = new THREE.Scene();
        // Create the user's character
        this.user = new Character({
            color: 0x7A43B6
        });
        this.scene.add(this.user.mesh);

        //Camera
        this.camera = new THREE.TargetCamera(45, 1, 0.1, 10000);
        this.camera.addTarget({
            name: 'chase',
            targetObject: this.user.mesh,
            cameraPosition: new THREE.Vector3( 0, 100, 600 ),
            cameraRotation: new THREE.Euler( -0.4, 0, 0 , "XYZ"),
            stiffness: 0.04,
            fixed: false

        });
        this.camera.addTarget({
            name: 'birdseye',
            targetObject: this.user.mesh,
            cameraPosition: new THREE.Vector3( 0, 800, 0 ),
            cameraRotation: new THREE.Euler( 0, 0, 0 , "XYZ"),
            matchRotation: false,
            stiffness: 0.02,
            fixed: false

        });


//        this.camera.setTarget( 'birdseye' );
        this.camera.setTarget( 'chase' );

        this.scene.add(this.camera);
//        this.user.mesh.add(this.camera);

        //Light
        this.light = new THREE.SpotLight();
//        this.light.position.set(0, 300, 0);
        this.light.castShadow = true;
        this.light.shadowDarkness = 0.7;
//        this.light.shadowCameraVisible = true;
        this.light.target = this.user.mesh;
        this.scene.add(this.light);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
        this.renderer.shadowMapEnabled = true;

        // Define the container for the renderer
        this.container = jQuery('#container');

        // Create the "world" : a 3D representation of the place we'll be putting our character in
        this.world = new World({
            color: 0xF5F5F5
        });
        this.scene.add(this.world.mesh);
        // Define the size of the renderer
        this.setAspect();
        // Insert the renderer in the container
        this.container.prepend(this.renderer.domElement);
        // Set the camera to look at our user's character
//        this.setFocus(this.user.mesh);
        // Start the events handlers
        this.setControls();

        this.debug();
    },
    debug: function () {
        for (var i = 0; i < this.user.rays.length; i += 1) {
            var ray = new THREE.ArrowHelper( this.user.rays[i], this.user.mesh.position, 100, 0xffff00 );
            this.user.mesh.add(ray);
        }


        var dir = new THREE.Vector3( 1, 0, 0 );
        var origin = new THREE.Vector3( 0, 0, 0 );
    },
    // Event handlers
    setControls: function () {
        'use strict';
        this.joystick = new VirtualJoystick({
            container	     : document.getElementById('container'),
            mouseSupport	 : true,
            limitStickTravel : true,
            stickRadius      : 100
        });

        // On resize
        jQuery(window).resize(function () {
            // Redefine the size of the renderer
            basicScene.setAspect();
        });
    },
    // Defining the renderer's size
    setAspect: function () {
        'use strict';
        // Fit the container's full width
        var w = this.container.width(),
            // Fit the initial visible area's height
            h = jQuery(window).height();
        // Update the renderer and the camera
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    },
    // Update and draw the scene
    frame: function () {
        'use strict';

        // Run a new step of the user's motions
        this.user.update(this.joystick.deltaX(), this.joystick.deltaY());
        this.light.position.set(this.user.mesh.position.x, 2000, this.user.mesh.position.z);

        // Set the camera to look at our user's character
        this.camera.update();

        // And draw !
        this.renderer.render(this.scene, this.camera);
    }
});
