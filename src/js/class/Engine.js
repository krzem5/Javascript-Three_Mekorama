class Engine{
	constructor(scene,cam,renderer,window_){
		this.OBJECTS=null
		this.BLOCKS=[]
		this.WATER_BLOCKS=null
		this.MODELS={}
		this.TEXTURES={}
		this.NAME=""
		this.WATER_DATA={}
		this.wait_queue=0
		this.scene=scene
		this.cam=cam
		this.renderer=renderer
		this.window=window_
		this._s()
		this._l()
		this.load_level("lvl1")
	}
	_s(){
		// this.renderer.shadowMap.enabled=true
		// this.renderer.shadowMap.type=THREE.PCFSoftShadowMap
		this.cam.position.set(-40,35,-50)
		this.cam.lookAt(new THREE.Vector3(0,0,0))
		this.cam.zoom=8
		this.cam.updateProjectionMatrix()
		this.scene.background=new THREE.Color().setHSL(1,1,1)
		var ambient=new THREE.AmbientLight(0xffffff,1)
		this.scene.add(ambient)
		var point=new THREE.PointLight(0xffffff,0.5,200)
		point.position.set(0,100,0)
		// point.castShadow=true
		// point.shadow.mapSize.width=512
		// point.shadow.mapSize.height=512
		// point.shadow.camera.near=0.5
		// point.shadow.camera.far=200
		this.scene.add(point)
		var ths=this
		this.window.addEventListener("keydown",function(){
			ths.keypress(arguments[0])
		})
		this.window.addEventListener("contextmenu",this._null_evt)
	}
	_l(){
		var ths=this
		requestAnimationFrame(function(){
			ths.render()
		})
	}
	_null_evt(e){
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
	}
	dispose(el){
		if (this.OBJECT==null){
			return
		}
		if (el==null){
			this.dispose(this.OBJECT)
		}
		if (el.geometry){
			el.geometry.dispose()
		}
		scene.remove(el)
		for (var c of el.children){
			this.dispose(c)
		}
	}
	keypress(e){
		switch (e.keyCode){
			case 39:
				this.rotate_cam(1)
				break
			case 37:
				this.rotate_cam(-1)
				break
		}
	}
	rotate_cam(a){
		if (this.cam.rotating==true){return}
		this.cam.rotating=true
		function get_sp(ths){
			var off=new THREE.Vector3()
			var t=new THREE.Vector3()
			var q=new THREE.Quaternion().setFromUnitVectors(ths.cam.up,new THREE.Vector3(0,1,0))
			off.copy(ths.cam.position).sub(t)
			off.applyQuaternion(q)
			return new THREE.Spherical().setFromVector3(off)
		}
		function set_rot(ths,a){
			var off=new THREE.Vector3()
			var t=new THREE.Vector3()
			var q=new THREE.Quaternion().setFromUnitVectors(ths.cam.up,new THREE.Vector3(0,1,0))
			var qI=q.clone().inverse()
			var s=get_sp(ths)
			s.theta=a
			s.makeSafe()
			off.setFromSpherical(s)
			off.applyQuaternion(qI)
			ths.cam.position.copy(t).add(off)
			ths.cam.lookAt(t)
		}
		function easeInOut(t,b,c,d){
			if ((t/=d/2)<1){
				return c/2*t*t*t+b
			}
			return c/2*((t-=2)*t*t+2)+b
		}
		a*=Math.PI/2
		var start=get_sp(this).theta,end=start+a
		var d=30
		function f(c=0){
			c++
			set_rot(this,easeInOut(c,start,end-start,d))
			if (c>=d){
				set_rot(this,end)
				this.cam.rotating=false
				return
			}
			setTimeout(f,1/60*1000,c)
		}
		setTimeout(f,1/60*1000)
	}
	load_level(name){
		this._s()
		this.dispose()
		this.OBJECT=new THREE.Group()
		this.BLOCKS=[]
		this.WATER=null
		this.NAME=""
		this.WATER_DATA={}
		this.wait_queue=0
		var min=new THREE.Vector3(0,0,0),max=new THREE.Vector3(0,0,0)
		var ths=this
		fetch("./data/"+name+".json").then((r)=>r.json()).then(function(json){
			ths.NAME=json.name
			for (var b of json.data){
				new Block(ths,b.pos.x,b.pos.y,b.pos.z,b.type,b.meta)
				min.min(new THREE.Vector3(b.pos.x,b.pos.y,b.pos.z))
				max.max(new THREE.Vector3(b.pos.x,b.pos.y,b.pos.z))
			}
			ths.WATER_DATA={l:json.water_level,min:min,max:max}
			ths.try_start()
		})
	}
	try_start(){
		if (this.wait_queue==0){
			this.create_water()
			this.scene.add(this.OBJECT)
		}
	}
	create_water(){
		if (this.WATER_DATA.l==-1){return}
		var o=new THREE.Mesh(new THREE.BoxBufferGeometry(this.WATER_DATA.max.x*10-this.WATER_DATA.min.x*10+9.5,this.WATER_DATA.l*10+7.5-0.5,this.WATER_DATA.max.z*10-this.WATER_DATA.min.z*10+9.5,1,1,1),new THREE.MeshBasicMaterial({color:0x4accec,transparent:true,opacity:0.6}))
		o.position.set((this.WATER_DATA.max.x*10-this.WATER_DATA.min.x*10)/2+this.WATER_DATA.min.x*10,this.WATER_DATA.l/2*10-1.25+this.WATER_DATA.min.y*10,(this.WATER_DATA.max.z*10-this.WATER_DATA.min.z*10)/2+this.WATER_DATA.min.z*10)
		this.WATER=o
		this.scene.add(this.WATER)
	}
	render(){
		this.renderer.render(this.scene,this.cam)
		var ths=this
		requestAnimationFrame(function(){
			ths.render()
		})
	}
}
