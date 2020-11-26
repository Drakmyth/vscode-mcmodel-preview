const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraAnchor = new THREE.Object3D();
const grid = new THREE.GridHelper(16, 16);
grid.position.x = 8;
grid.position.z = 8;
cameraAnchor.add(camera);
cameraAnchor.position.x = 8;
cameraAnchor.position.z = 8;
camera.position.z = 25;
camera.position.y = 15;
camera.lookAt(cameraAnchor.position);
scene.add(cameraAnchor);
scene.add(grid);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const normalMap = {
    up: new THREE.Vector3(0, 1, 0),
    down: new THREE.Vector3(0, -1, 0),
    east: new THREE.Vector3(1, 0, 0),
    west: new THREE.Vector3(-1, 0, 0),
    north: new THREE.Vector3(0, 0, 1),
    south: new THREE.Vector3(0, 0, -1)
}

var tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
var windowHeight = window.innerHeight;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', onWindowResize);
window.addEventListener('message', onMessageReceived);

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));
    camera.updateProjectionMatrix();
    camera.lookAt(scene.position);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

var dragging = false;
var mousex = 0;
var mousey = 0;
var rollMode = false;

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

function onMouseMove(event) {
    if (!dragging) return;

    if (rollMode) {
        const deltax = mousex - event.x;
        cameraAnchor.rotateOnAxis(new THREE.Vector3(0, 0, 1), deltax / -200)
        mousex = event.x;
    } else {
        const deltax = mousex - event.x;
        const deltay = mousey - event.y;
        cameraAnchor.rotateOnAxis(new THREE.Vector3(0, 1, 0), deltax / 200)
        cameraAnchor.rotateOnAxis(new THREE.Vector3(1, 0, 0), deltay / 200)
        mousex = event.x;
        mousey = event.y;
    }
}

function onMouseDown(event) {
    dragging = true;
    mousex = event.x;
    mousey = event.y;
    rollMode = event.ctrlKey;
}

function onMouseUp(event) {
    dragging = false;
    rollMode = false;
}

function onMessageReceived(event) {
    const message = event.data;

    switch (message.command) {
        case 'update':
            const model = message.data;
            scene.clear();
            scene.add(cameraAnchor);
            scene.add(grid);
            const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });

            for (const element of model.elements) {
                const scale = new THREE.Vector3(
                    element.to[0] - element.from[0],
                    element.to[1] - element.from[1],
                    element.to[2] - element.from[2]);
                const position = new THREE.Vector3(
                    element.from[0] + scale.x / 2,
                    element.from[1] + scale.y / 2,
                    element.from[2] + scale.z / 2);

                const geometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
                var facesToRemove = [];

                if (element.faces) {

                    var faceNormalsToKeep = []
                    for (var dir in element.faces) {
                        faceNormalsToKeep.push(normalMap[dir]);
                    }

                    for (var face of geometry.faces) {
                        if (!faceNormalsToKeep.find((normal) =>
                            normal.x === face.normal.x &&
                            normal.y === face.normal.y &&
                            normal.z === face.normal.z)) {
                            facesToRemove.push(face);
                        }
                    }
                }

                for (var face of facesToRemove) {
                    const faceIndex = geometry.faces.indexOf(face);
                    geometry.faces.splice(faceIndex, 1);
                }

                geometry.faces.forEach(function (face) {
                    for (var i = 0; i < 3; i++) {
                        color = new THREE.Color(
                            Math.abs(face.normal.x),
                            Math.abs(face.normal.y),
                            Math.abs(face.normal.z)
                        );
                        face.vertexColors[i] = color;
                    }
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.translateX(position.x);
                cube.translateY(position.y);
                cube.translateZ(position.z);
                scene.add(cube);
            }
    }
}
