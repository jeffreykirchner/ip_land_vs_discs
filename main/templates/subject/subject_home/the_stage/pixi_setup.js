{% load static %}

/**
 * update the pixi players with new info
 */
setup_pixi: function setup_pixi(){    
    app.reset_pixi_app();

    PIXI.Assets.add({alias:'sprite_sheet', src:'{% static "gear_3_animated.json" %}'});
    PIXI.Assets.add({alias:'sprite_sheet_2', src:'{% static "sprite_sheet.json" %}'});
    PIXI.Assets.add({alias:'bg_tex', src:'{% static "background_tile_low.jpg"%}'});
    PIXI.Assets.add({alias:'wall_tex', src:'{% static "wall.png"%}'});
    PIXI.Assets.add({alias:'barrier_tex', src:'{% static "barrier.png"%}'});
    PIXI.Assets.add({alias:'bridge_tex', src:'{% static "bridge.jpg"%}'});
    PIXI.Assets.add({alias:'seed_tex', src:'{% static "seed_1.png"%}'});
    PIXI.Assets.add({alias:'disc_tex', src:'{% static "disc_1.png"%}'});
    PIXI.Assets.add({alias:'dash_tex', src:'{% static "dash_1.png"%}'});
    PIXI.Assets.add({alias:'left_click_tex', src:'{% static "left_click.png"%}'});
    PIXI.Assets.add({alias:'right_click_tex', src:'{% static "right_click.png"%}'});
    PIXI.Assets.add({alias:'cone_tex', src:'{% static "cone_1.png"%}'});

    const textures_promise = PIXI.Assets.load(['sprite_sheet', 'bg_tex', 'sprite_sheet_2', 'seed_tex', 'disc_tex',
                                               'wall_tex', 'barrier_tex', 'bridge_tex','dash_tex'
                                               ,'left_click_tex', 'right_click_tex', 'cone_tex']);

    textures_promise.then((textures) => {
        app.setup_pixi_sheets(textures);
        app.setup_pixi_ground();
        app.setup_pixi_fields();
        app.setup_pixi_subjects();
        app.setup_pixi_wall();
        app.setup_pixi_barrier();
        
        if(app.pixi_mode!="subject")
        {
            app.update_zoom();
            app.fit_to_screen();
        }
        else
        {
            app.setup_pixi_night();
            app.setup_pixi_minimap();
            app.setup_disc_inventory();
            app.setup_seed_inventory();
            app.update_pixi_night();
            // app.setup_subject_status_overlay();
        }

        pixi_setup_complete = true;
    });

    pixi_text_emitter = {};
    pixi_text_emitter_key = 0;
    app.pixi_tick_tock = {value:"tick", time:Date.now()};
    pixi_transfer_beams = {};
    pixi_transfer_beams_key = 0;
},

reset_pixi_app: async function reset_pixi_app(){    

    app.stage_width = app.session.parameter_set.world_width;
    app.stage_height = app.session.parameter_set.world_height;

    let canvas = document.getElementById('sd_graph_id');

    pixi_app = new PIXI.Application()

    await pixi_app.init({resizeTo : canvas,
                         backgroundColor : 0xFFFFFF,
                         autoResize: true,
                         antialias: true,
                         resolution: 1,
                         canvas: canvas });

    // The stage will handle the move events
    // pixi_app.stage.eventMode = 'static';
    //pixi_app.stage.hitArea = pixi_app.screen;

    app.canvas_width = canvas.width;
    app.canvas_height = canvas.height;
},

/** load pixi sprite sheets
*/
setup_pixi_sheets: function setup_pixi_sheets(textures){

    app.pixi_textures = textures;
    app.background_tile_tex = textures.bg_tex;

    pixi_container_main = new PIXI.Container();
    pixi_container_main.sortableChildren = true;
    //pixi_container_main.eventMode = 'static';

    pixi_app.stage.addChild(pixi_container_main);
   
    let tiling_sprite = new PIXI.TilingSprite({
        texture : textures.bg_tex,
        width : app.stage_width,
        height : app.stage_height});

    tiling_sprite.position.set(0,0);
    pixi_container_main.addChild(tiling_sprite);

    //subject controls
    if(app.pixi_mode=="subject")
    {
        tiling_sprite.eventMode ='static';
        tiling_sprite.on("click", app.subject_pointer_click);     
        tiling_sprite.on("rightclick", app.subject_pointer_right_click);   
        tiling_sprite.on("tap", app.subject_pointer_tap);
               
        pixi_target = new PIXI.Graphics();

        pixi_target.alpha = 0.33;
        pixi_target.circle(0, 0, 10);
        pixi_target.stroke({width:3, color:0x000000});
        pixi_target.eventMode='static';
        pixi_target.zIndex = 100;

        //pixi_target.scale.set(app.pixi_scale, app.pixi_scale);
        pixi_container_main.addChild(pixi_target)
    }
    else
    {
       
    }

    // staff controls
    if(app.pixi_mode=="staff"){

        app.scroll_button_up = app.add_scroll_button({w:50, h:30, x:pixi_app.screen.width/2, y:30}, 
                                                     {scroll_direction:{x:0,y:-app.scroll_speed}}, 
                                                   "↑↑↑");
        app.scroll_button_down = app.add_scroll_button({w:50, h:30, x:pixi_app.screen.width/2, y:pixi_app.screen.height - 30}, 
                                                     {scroll_direction:{x:0,y:app.scroll_speed}}, 
                                                     "↓↓↓");

        app.scroll_button_left = app.add_scroll_button({w:30, h:50, x:30, y:pixi_app.screen.height/2}, 
                                                     {scroll_direction:{x:-app.scroll_speed,y:0}}, 
                                                     "←\n←\n←");

        app.scroll_button_right = app.add_scroll_button({w:30, h:50, x:pixi_app.screen.width - 30, y:pixi_app.screen.height/2}, 
                                                      {scroll_direction:{x:app.scroll_speed,y:0}}, 
                                                      "→\n→\n→");
        
    }

    {%if DEBUG or session.parameter_set.test_mode%}
    //fps counter
    let text_style = {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: {color:'black'},
        align: 'left',
    };
    let fps_label = new PIXI.Text({text:"0 fps", 
                                   style:text_style});
    // fps_label.eventMode = 'none';

    pixi_fps_label = fps_label;
    pixi_fps_label.position.set(10, app.canvas_height-25);
    pixi_app.stage.addChild(pixi_fps_label);   
    {%endif%}

    pixi_app.ticker.add(app.game_loop);
},

/**
 * game loop for pixi
 */
game_loop: function game_loop(delta)
{
    app.move_player(delta.deltaTime);
    app.move_text_emitters(delta.deltaTime);
    app.animate_transfer_beams(delta.deltaTime);

    if(app.pixi_mode=="subject" && app.session.started)
    {   
        app.update_offsets_player(delta.deltaTime);
        app.update_mini_map(delta.deltaTime);
    }
    
    if(app.pixi_mode=="staff")
    {
        app.update_offsets_staff(delta.deltaTime);
        app.scroll_staff(delta.deltaTime);
    }  
    
    //tick tock
    if(Date.now() - app.pixi_tick_tock.time >= 200)
    {
        {%if DEBUG or session.parameter_set.test_mode%}
        pixi_fps_label.text = Math.round(pixi_app.ticker.FPS) + " FPS";
        {%endif%}

        app.pixi_tick_tock.time = Date.now();
        if(app.pixi_tick_tock.value == "tick") 
            app.pixi_tick_tock.value = "tock";
        else
            app.pixi_tick_tock.value = "tick";
    }
},

/**
 * move the object towards its target location
 */
move_object: function move_object(delta, obj, move_speed)
{
    let temp_move_speed = (move_speed * delta);

    let temp_current_location = Object.assign({}, obj.current_location);

    let target_location_local = Object.assign({}, obj.target_location);
    if("nav_point" in obj && obj.nav_point) 
        target_location_local = Object.assign({}, obj.nav_point);

    let temp_angle = Math.atan2(target_location_local.y - obj.current_location.y,
                                target_location_local.x - obj.current_location.x)

    //y
    if(Math.abs(target_location_local.y - obj.current_location.y) < temp_move_speed)
        obj.current_location.y = target_location_local.y;
    else
        obj.current_location.y += temp_move_speed * Math.sin(temp_angle);
 
    //x
    if(Math.abs(target_location_local.x - obj.current_location.x) < temp_move_speed)
        obj.current_location.x = target_location_local.x;
    else
        obj.current_location.x += temp_move_speed * Math.cos(temp_angle);
},