
var WIDTH, HEIGHT;
var RESAMPLE_MAX;
var point;
var lastPoint;
var pointsList = [];
var newPointsList = [];
var drawLines = [];
var letsDraw = false;
var mouseDown = false;
var isHeadDrawn = false;
var isTorsoDrawn = false;
var cabezaCentroide = new THREE.Vector2();
var scene, camera, render;

var RESAMPLE_MAX = 128;

var ERR_HEAD_ALREADY_DRAWN = "The Head is already drawn.";
var ERR_TORSO_ALREADY_DRAWN = "The Torso is already drawn.";
var ERR_LEG_ALREADY_DRAWN = "The legs are already drawn.";
var ERR_ARM_ALREADY_DRAWN = "The arms are already drawn.";
var ERR_COULD_NOT_DETECT = "Could not detect draw.";

var HEAD_THRESHOLD = 60;
var TORSO_THRESHOLD = 40;

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

  if ( drawLines.length > 1 ) {
    var endPoint = pointsList[pointsList.length-1];
    resample();
    newPointsList[RESAMPLE_MAX - 1] = endPoint;

    // HEAD DETECTION
    var vector1 = new THREE.Vector2(newPointsList[Math.round(RESAMPLE_MAX/4)].x - newPointsList[0].x, newPointsList[Math.round(RESAMPLE_MAX/4)].y - newPointsList[0].y);
    var vector2 = new THREE.Vector2(newPointsList[Math.round(2*RESAMPLE_MAX/4)].x - newPointsList[Math.round(RESAMPLE_MAX/4)].x, newPointsList[Math.round(2*RESAMPLE_MAX/4)].y - newPointsList[Math.round(RESAMPLE_MAX/4)].y);
    var vector3 = new THREE.Vector2(newPointsList[Math.round(3*RESAMPLE_MAX/4)].x - newPointsList[Math.round(2*RESAMPLE_MAX/4)].x, newPointsList[Math.round(3*RESAMPLE_MAX/4)].y - newPointsList[Math.round(2*RESAMPLE_MAX/4)].y);
    var vector4 = new THREE.Vector2(newPointsList[0].x - newPointsList[Math.round(2*RESAMPLE_MAX/4)].x, newPointsList[0].y - newPointsList[Math.round(2*RESAMPLE_MAX/4)].y);
    var dot12 = Math.acos(vector1.dot(vector2)/(vector1.length()*vector2.length()))* (180/Math.PI);
    var dot23 = Math.acos(vector2.dot(vector3)/(vector2.length()*vector3.length()))* (180/Math.PI);
    var dot34 = Math.acos(vector3.dot(vector4)/(vector3.length()*vector4.length()))* (180/Math.PI);
    var dot41 = Math.acos(vector4.dot(vector1)/(vector4.length()*vector1.length()))* (180/Math.PI);
    if (dot12 > 90){
      dot12 = 180 - dot12;
    }
    if (dot23 > 90){
      dot23 = 180 - dot23;
    }
    if (dot34 > 90){
      dot34 = 180 - dot34;
    }
    if (dot41 > 90){
      dot41 = 180 - dot41;
    }
    var promedio = (dot12 + dot23 + dot34 + dot41)/4;
    console.log("PROMEDIO: " + promedio);
    // IF IS HEAD
    if ( promedio > HEAD_THRESHOLD) {
	  if(!isHeadDrawn){
		  var distanciaTotal = 0;
		  var distanciaSeparacion = 0;
		  for (i = 1; i < pointsList.length; i++) {
			distanciaTotal += pointsList[i-1].distanceTo(pointsList[i]);
		  }
		  distanciaSeparacion = pointsList[0].distanceTo(pointsList[pointsList.length-1]);
		  if (distanciaSeparacion < 7*distanciaTotal/RESAMPLE_MAX) {
			cabezaCentroide.x = newPointsList[0].x;
			cabezaCentroide.y = newPointsList[0].x;
			for (i = 1; i < newPointsList.length; i++) {
			  var geometry = new THREE.Geometry();
			  geometry.vertices.push(newPointsList[i-1]);
			  geometry.vertices.push(newPointsList[i]);
			  material = new THREE.LineBasicMaterial({color: 0xff0000});
			  var line = new THREE.Line(geometry, material);
			  scene.add(line);
			  cabezaCentroide.x += newPointsList[i].x;
			  cabezaCentroide.y += newPointsList[i].x;
			}
			cabezaCentroide.x /= newPointsList.length;
		    cabezaCentroide.y /= newPointsList.length;
			console.log("centroide x " + cabezaCentroide.x + " centroide y " + cabezaCentroide.y);
			isHeadDrawn = true;
		  }
      } else {
        showError(ERR_HEAD_ALREADY_DRAWN);
      }
    }
    // ELSE IF IS TORSO || IF IS ARM || IF IS LEG
    else if ( promedio < TORSO_THRESHOLD) {
      if (!isTorsoDrawn) {
        for (i = 1; i < newPointsList.length; i++) {
          var geometry = new THREE.Geometry();
          geometry.vertices.push(newPointsList[i-1]);
          geometry.vertices.push(newPointsList[i]);
          material = new THREE.LineBasicMaterial({color: 0x0000ff});
          var line = new THREE.Line(geometry, material);
          scene.add(line);
        }
        isTorsoDrawn = true;
      }
      // ELSE IF IS ARM
      // ELSE IF IS LEG
    }

    else {
      showError(ERR_COULD_NOT_DETECT);
    }


  }

  pointsList = [];
  newPointsList = [];
  drawLines = [];
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
			var material = new THREE.LineBasicMaterial({color: 0x000000});
			var line = new THREE.Line(geometry, material);
			scene.add(line);
			pointsList.push( point );
			drawLines.push( line );
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
	}
}

/**
 *
 */
function showError(error) {
  $(".error").remove();
  var div = document.createElement('div');
  $(div).attr('class', 'error');
  $(div).html(error);
  $('body').append(div);
  $(div).fadeIn("slow").delay(4000).fadeOut("slow");
}

/**
 *
 */
function clear() {
  scene.children={};
  scene = new THREE.Scene();
  isHeadDrawn = false;
  isTorsoDrawn = false;
  $(".error").remove();
}

/**
 *
 */
function resample() {
  var distanciaTotal = 0; //Distancia total del trazo
  var distanciaPromedio = 0; //distancia promedio para equi-espaciar los puntos
  var distancia = 0; //distancia entre 2 puntos
  var distanciaAvance = 0; //distancia acumulada en el resampling
  // REMOVE PREVIOUS SKETCH
  for (i = 0; i < drawLines.length; i++) {
    scene.remove( drawLines[i] );
  }
  for (i = 1; i < pointsList.length; i++) {
    distanciaTotal += pointsList[i-1].distanceTo(pointsList[i]);
  }
  distanciaPromedio = distanciaTotal/(RESAMPLE_MAX - 1);
  newPointsList.push( pointsList[0] );
  for (i = 1; i < pointsList.length; i++) {
    distancia = pointsList[i-1].distanceTo(pointsList[i]);
    if( (distanciaAvance + distancia) >= distanciaPromedio ) {
      var nuevoPunto = new THREE.Vector3();
      nuevoPunto.x = pointsList[i-1].x + ((distanciaPromedio - distanciaAvance)/distancia)*(pointsList[i].x-pointsList[i-1].x);
      nuevoPunto.y = pointsList[i-1].y + ((distanciaPromedio - distanciaAvance)/distancia)*(pointsList[i].y-pointsList[i-1].y);
      nuevoPunto.z = 0;
      newPointsList.push( nuevoPunto );
      pointsList.splice(i, 0, nuevoPunto);
      distanciaAvance = 0;
    } else {
      distanciaAvance += distancia;
    }
  }
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

  camera.position.z = 2;
  camera.position.y = 0;
  camera.rotation.x = 0;

  renderer.domElement.addEventListener( 'mousedown', onMouseDown );
  renderer.domElement.addEventListener( 'mouseup', onMouseUp );
  renderer.domElement.addEventListener( 'mousemove', onMouseMove);

  $(".fa-trash-o").click(function(){
    clear();
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
