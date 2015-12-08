var WIDTH, HEIGHT;
var point;
var lastPoint;
var pointsList = [];
var letsDraw = false;
var mouseDown = false;
var scene, camera, render;

// points
var top, right, bottom, left;

/**
 *
 */
function onMouseDown( e ) {
  mouseDown = true;
}

/**
 *
 */
function onMouseUp( e ) {
  mouseDown = false;
  letsDraw = false;
  console.log("***POINTS: " + pointsList.length);
  pointsList = []
}

/**
 *
 */
function onMouseMove (e) {
  if ( mouseDown ) {
    if ( letsDraw ) {
      var vector = new THREE.Vector3(
        ( e.clientX / window.innerWidth ) * 2 - 1,
        - ( e.clientY / window.innerHeight ) * 2 + 1,
        0.5 );
      vector.unproject( camera );
      var dir = vector.sub( camera.position ).normalize();
      var distance = - camera.position.z / dir.z;
      point = camera.position.clone().add( dir.multiplyScalar( distance ) );
      var geometry = new THREE.Geometry();
      geometry.vertices.push(lastPoint);
      geometry.vertices.push(point);
      var material = new THREE.LineBasicMaterial({color: 0x0000ff});
      var line = new THREE.Line(geometry, material);
      scene.add(line);
      pointsList.push( point );
      lastPoint = point;
    } else {
      var vector = new THREE.Vector3(( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1, 0.5 );
      vector.unproject( camera );
      var dir = vector.sub( camera.position ).normalize();
      var distance = - camera.position.z / dir.z;
      lastPoint = camera.position.clone().add( dir.multiplyScalar( distance ) );
      letsDraw = true;
      pointsList.push( lastPoint );
    }
    evaluate();
  }
}

function evaluate() {
  if (lastPoint.x > right.x) {
    right = lastPoint;
  }
  if (lastPoint.x < left.x) {
    left = lastPoint;
  }
  if (lastPoint.y > top.y) {
    top = lastPoint;
  }
  if (lastPoint.y < bottom.y) {
    bottom = lastPoint;
  }
  console.log("TOP: " + top.x + ", " + top.y);
  console.log("RIGHT: " + right.x + ", " + right.y);
  console.log("BOTTOM: " + bottom.x + ", " + bottom.y);
  console.log("LEFT: " + left.x + ", " + left.y);
}

/**
 *
 */
function init() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      75, WIDTH/HEIGHT, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize( WIDTH, HEIGHT );
  document.body.appendChild( renderer.domElement );
  renderer.shadowMapEnabled = true;

  camera.position.z = 3;
  camera.position.y = 0;
  camera.rotation.x = 0;

  top = new THREE.Vector3( 0, 0, 0 );
  right = new THREE.Vector3( 0, 0, 0 );
  bottom = new THREE.Vector3( 0, 0, 0 );
  left = new THREE.Vector3( 0, 0, 0 );

  renderer.domElement.addEventListener( 'mousedown', onMouseDown );
  renderer.domElement.addEventListener( 'mouseup', onMouseUp );
  renderer.domElement.addEventListener( 'mousemove', onMouseMove);

  $("#clear").click(function(){
    scene.clear();
    console.log("clear");
  });
}

/**
 *
 */
function render() {
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}

init();
render();
