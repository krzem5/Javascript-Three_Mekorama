var scene,cam,renderer,ENGINE
function init(){
	scene=new THREE.Scene()
	cam=new THREE.OrthographicCamera(window.innerWidth/-2,window.innerWidth/2,window.innerHeight/2,window.innerHeight/-2,0.1,100000)
	renderer=new THREE.WebGLRenderer({antialias:true})
	renderer.setSize(window.innerWidth,window.innerHeight)
	document.body.appendChild(renderer.domElement)
	window.addEventListener("resize",resize,false)
	ENGINE=new Engine(scene,cam,renderer,window)
}
function resize(){
	renderer.setSize(window.innerWidth,window.innerHeight)
	cam.left=window.innerWidth/-2
	cam.right=window.innerWidth/2
	cam.top=window.innerHeight/2
	cam.bottom=window.innerHeight/-2
	cam.updateProjectionMatrix()
}
document.addEventListener("DOMContentLoaded",init,false)
