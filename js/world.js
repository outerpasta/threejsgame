var World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();

        var loader = new THREE.JSONLoader();
        // level 1
        loader.load( "blender/level1.json", function( geometry ) {
            var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: args.color}) );
            mesh.scale.set( 200, 200, 200 );
            mesh.receiveShadow = true;
            mesh.position.y -= 200;
            mesh.name = 'ground';
            this.mesh.add(mesh);
            this.mesh.receiveShadow = true;
        }.bind(this));

        //Ceiling
//        var ceil = new THREE.Mesh(
//                new THREE.BoxGeometry(5000, 1, 5000),
//                new THREE.MeshBasicMaterial({wireframe: true})
//        );
//        ceil.position.y += 500;
////        this.mesh.add(ceil);
    },
    getObstacles: function () {
        'use strict';
//        return this.obstacles.concat();
        return this.mesh.children;
    }
});