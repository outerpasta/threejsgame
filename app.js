console.log("hello");
var basicScene = new BasicScene();
function animate () {
    requestAnimationFrame(animate);
    basicScene.frame();
}
animate();