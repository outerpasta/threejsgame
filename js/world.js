var World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();

        var loader = new THREE.JSONLoader();
        // level 1
        loader.load( "blender/level1.json", function( geometry ) {
            var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: 0xFF0000}) );
            mesh.scale.set( 30, 30, 30 );
            this.mesh.add(mesh);
        }.bind(this));
    },
    getObstacles: function () {
        'use strict';
//        return this.obstacles.concat();
        return this.mesh.children;
    }
});