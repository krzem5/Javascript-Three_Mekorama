class Block{
	constructor(ENGINE,x,y,z,nm,meta){
		this.ENGINE=ENGINE
		this.pos={x,y,z}
		this.type=nm
		this.name="Object"
		this.tex_keymap={}
		this.tex_transparency=false
		this.block_meta=meta||null
		this.load()
	}
	load(){
		this.ENGINE.wait_queue++
		if (this.ENGINE.MODELS[this.type]!=undefined){
			this.create_model(this.ENGINE.MODELS[this.type])
			return
		}
		fetch("./assets/models/"+this.type+".json").then((r)=>r.json()).then((json)=>this.create_model(json))
	}
	create_model(json){
		this.ENGINE.MODELS[this.type]=json
		this.name=json.name
		this.tex_transparency=json.transparency||false
		var group=new THREE.Group()
		for (var k of Object.keys(json.tex_keys)){
			var nm=json.tex_keys[k]
			if (nm.startsWith("#")&&!nm.endsWith(".png")){
				this.tex_keymap[k]=json.tex_keys[k]
			}
			else{
				if (this.ENGINE.TEXTURES[json.tex_keys[k]]!=undefined){
					this.tex_keymap[k]=this.ENGINE.TEXTURES[json.tex_keys[k]]
				}
				else{
					this.ENGINE.wait_queue++
					var ths=this
					this.tex_keymap[k]=new THREE.TextureLoader().load("./assets/texture/"+json.tex_keys[k],function(){
						ths.ENGINE.wait_queue--
						ths.ENGINE.try_start()
					})
					this.ENGINE.TEXTURES[json.tex_keys[k]]=this.tex_keymap[k]
				}
			}
		}
		group.position.set(this.pos.x*10,this.pos.y*10,this.pos.z*10)
		if (this.block_meta!=null){
			var dt=json.meta_data[this.block_meta]||{}
			if (dt.pos!=undefined){
				group.position.add(dt.pos.x,dt.pos.y,dt.pos.z)
			}
			if (dt.rot!=undefined){
				group.rotation.set(dt.rot.a/(180/Math.PI),dt.rot.b/(180/Math.PI),dt.rot.c/(180/Math.PI))
			}
		}
		// group.reciveShadow=true
		// group.castShadow=true
		scene.add(group)
		this.object=group
		this.ENGINE.OBJECT.add(this.object)
		this.ENGINE.BLOCKS.push(this)
		this.create_sides(json.model)
		this.ENGINE.wait_queue--
		this.ENGINE.try_start()
	}
	create_sides(json){
		for (var i=0;i<json.length;i++){
			var dt=json[i]
			if (dt.toString()===dt){
				if (this.ENGINE.MODELS[dt]!=undefined){
					this.ENGINE.wait_queue++
					var ths=this
					setTimeout(function(){
						ths.create_sides(ths.ENGINE.MODELS[dt].model)
						this.ENGINE.wait_queue--
						this.ENGINE.try_start()
					},0)
				}
				else{
					this.ENGINE.wait_queue++
					var ths=this
					fetch("./assets/models/"+dt+".json").then((r)=>r.json()).then(function(json_r){
						ths.ENGINE.MODELS[dt]=json_r
						setTimeout(function(){
							ths.create_sides(json_r.model)
							this.ENGINE.wait_queue--
							this.ENGINE.try_start()
						},0)
					})
				}
				continue
			}
			var tx=null
			if (this.tex_keymap[dt.texture].toString()===this.tex_keymap[dt.texture]){
				tx=new THREE.MeshStandardMaterial({color:this.tex_keymap[dt.texture],transparent:this.tex_transparency,side:(dt.flip==true?THREE.BackSide:THREE.FrontSide),flatShading:true,metalness:0.5,roughness:1,refractionRatio:0,alphaTest:0})
			}
			else{
				tx=new THREE.MeshStandardMaterial({map:this.tex_keymap[dt.texture],transparent:this.tex_transparency,side:(dt.flip==true?THREE.BackSide:THREE.FrontSide),flatShading:true,metalness:0.5,roughness:1,refractionRatio:0,alphaTest:0})
			}
			var o=new THREE.Mesh(new THREE.PlaneBufferGeometry(dt.size.w,dt.size.h),tx)
			o.position.set(dt.pos.x,dt.pos.y,dt.pos.z)
			o.rotation.set(dt.rot.a/(180/Math.PI),dt.rot.b/(180/Math.PI),dt.rot.c/(180/Math.PI))
			// o.receiveShadow=true
			// o.castShadow=(dt.noShadow==true?false:true)
			this.object.add(o)
		}
	}
	dispose(){
		for (var c of this.object.children){
			c.geometry.dispose()
			scene.remove(c)
		}
		scene.remove(this.object)
	}
}