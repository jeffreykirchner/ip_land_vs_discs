/**
 * setup mini map on subject screen 
 * */
setup_pixi_minimap: function setup_pixi_minimap()
{
    if(mini_map.container)
    {
        pixi_app.stage.removeChild(mini_map.container);
        mini_map.container.destroy({children:true, baseTexture:true});
    } 

    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;

    app.mini_map_scale = Math.min((pixi_app.screen.width * 0.2)/app.stage_width,  (pixi_app.screen.height * 0.3)/app.stage_height);

    let scale = app.mini_map_scale;
    let obj = app.session.world_state.session_players[app.session_player.id]

    mini_map.container = new PIXI.Container();
    // mini_map.container.eventMode = 'none';
    mini_map.container.zIndex = 9998;

    //mini map background
    let mini_map_bg = new PIXI.Graphics();
    
    mini_map_bg.width = app.stage_width * scale;
    mini_map_bg.height =  app.stage_height * scale;
    mini_map_bg.rect(0, 0, app.stage_width * scale, app.stage_height * scale);
    mini_map_bg.stroke(1, 0x000000);
    mini_map_bg.fill({color:'BDB76B'});
    // mini_map_bg.endFill();
    
    mini_map.container.addChild(mini_map_bg);

    //grounds
    for(const i in app.session.parameter_set.parameter_set_grounds){
        const ground = app.session.parameter_set.parameter_set_grounds[i];

        let temp_ground = new PIXI.Graphics();
        
        temp_ground.rect(ground.x * scale, ground.y * scale, ground.width * scale, ground.height * scale);
        temp_ground.fill({color:ground.tint});

        mini_map.container.addChild(temp_ground);
    }

    

    //walls
    // for(const i in app.session.parameter_set.parameter_set_walls)
    // { 

    //     const wall = app.session.parameter_set.parameter_set_walls[i];

    //     let temp_wall = new PIXI.Graphics();
    //     temp_wall.fill('DEB887');
    //     temp_wall.rect(wall.start_x * scale, wall.start_y * scale, wall.width * scale, wall.height * scale);

    //     mini_map.container.addChild(temp_wall);
    // }
    
    //players
    for(const i in app.session.world_state.session_players){
        const parameter_set_player = app.get_parameter_set_player_from_player_id(i);
        const player = app.session.world_state.session_players[i];

        let temp_player = new PIXI.Graphics();
        
        temp_player.circle(0,0,8);
        temp_player.fill({color:parameter_set_player.hex_color, alpha:0.75});
        temp_player.stroke({alignment:1, width:1, color:'black'});

        //temp_player.pivot.set(temp_player.width/2, temp_player.height/2);
        // temp_player.position.set(player.current_location.x * scale, player.current_location.y * scale);

        mini_map.players[i] = temp_player;
        
        if(i == app.session_player.id)
        {
            mini_map.container.addChild(mini_map.players[i]);
        }
        else
        {
            mini_map.container.addChildAt(mini_map.players[i],1);
        }
    }

    //fields
    for(const i in app.session.parameter_set.parameter_set_fields){
        const parameter_set_field = app.session.parameter_set.parameter_set_fields[i];
        const field = app.session.world_state.fields[i];

        let temp_field = new PIXI.Graphics();
        
        temp_field.rect((parameter_set_field.x - parameter_set_field.width/2) * scale, 
                            (parameter_set_field.y - parameter_set_field.height/2) * scale, 
                             parameter_set_field.width * scale, 
                             parameter_set_field.height * scale);

        if(field.owner){
            let parameter_set_player = app.get_parameter_set_player_from_player_id(field.owner);
            temp_field.fill({color:parameter_set_player.hex_color, alpha:0.75});
        }
        else
        {
            temp_field.fill({color:"white", alpha:0.5});
        }

        mini_map.container.addChildAt(temp_field,1);

        mini_map.fields[i] = temp_field;
    }

    //mini map view port
    let mini_map_vp = new PIXI.Graphics();  
    mini_map_vp.rect(0, 0, pixi_app.screen.width * scale, pixi_app.screen.height * scale);
    mini_map_vp.stroke({width:2,color:0x000000,alignment:0});
    mini_map_vp.fill({color:0xFFFFFF, alpha:0});
    mini_map_vp.pivot.set(pixi_app.screen.width * scale/2, pixi_app.screen.height * scale/2);
    // mini_map_vp.endFill();    
    
    //mini_map_vp.position.set(obj.current_location.x * scale, obj.current_location.y * scale);

    mini_map.view_port = mini_map_vp;

    mini_map.container.addChild(mini_map.view_port);

    //add to stage
    mini_map.container.position.set(20, 20);
    // mini_map.container.alpha = 0.9;
    pixi_app.stage.addChild(mini_map.container);
},

/**
 * update the mini map
 */
update_mini_map: function update_mini_map(delta)
{
    if(!app.mini_map_scale) return;
    
    //update view port
    let obj = app.session.world_state.session_players[app.session_player.id]

    mini_map.view_port.position.set((obj.current_location.x * app.mini_map_scale), 
                                    (obj.current_location.y * app.mini_map_scale));

    //update players
    for(const i in app.session.world_state.session_players){
        const player = app.session.world_state.session_players[i];

        mini_map.players[i].position.set(player.current_location.x * app.mini_map_scale, 
                                         player.current_location.y * app.mini_map_scale);
    }
},