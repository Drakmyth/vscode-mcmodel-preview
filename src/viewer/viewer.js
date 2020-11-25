const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
var faceIndices = ['a', 'b', 'c'];
var vertexIndex, point;
geometry.faces.forEach(function(face) {
    for (var i = 0; i < 3; i++) {
        vertexIndex = face[faceIndices[i]];
        point = geometry.vertices[vertexIndex];
        color = new THREE.Color(
            Math.abs(face.normal.x),
            Math.abs(face.normal.y),
            Math.abs(face.normal.z)
        );
        face.vertexColors[i] = color;
    }
})
const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

var tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
var windowHeight = window.innerHeight;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));
    camera.updateProjectionMatrix();
    camera.lookAt(scene.position);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function onMessageReceived(event) {
    const message = event.data;

    switch(message.command) {
        case 'update':
            const model = message.data;
            console.log(JSON.stringify(model));
    }
}
