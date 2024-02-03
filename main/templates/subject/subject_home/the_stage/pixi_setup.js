{% load static %}

/**
 * update the pixi players with new info
 */
setup_pixi: function setup_pixi(){    
    app.reset_pixi_app();

    PIXI.Assets.add('grass_tex', '{% static "background_tile_low.jpg"%}');

    let asset_names = ['grass_tex',];

    const textures_promise = PIXI.Assets.load(asset_names);


    textures_promise.then((textures) => {
        app.setup_pixi_sheets(textures);
        
        

        pixi_setup_complete = true;
    });

    pixi_text_emitter = {};
    pixi_text_emitter_key = 0;
    app.pixi_tick_tock = {value:"tick", time:Date.now()};
    pixi_transfer_beams = {};
    pixi_transfer_beams_key = 0;
},

reset_pixi_app: function reset_pixi_app(){    

    app.stage_width = app.session.parameter_set.world_width;
    app.stage_height = app.session.parameter_set.world_height;

    let canvas = document.getElementById('sd_graph_id');

    pixi_app = new PIXI.Application({resizeTo : canvas,
                                        backgroundColor : 0xFFFFFF,
                                        autoResize: true,
                                        antialias: true,
                                        resolution: 1,
                                        view: canvas });

    // The stage will handle the move events
    pixi_app.stage.eventMode = 'static';
    pixi_app.stage.hitArea = pixi_app.screen;

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
    pixi_container_main.eventMode = 'passive';

    pixi_app.stage.addChild(pixi_container_main);
   
    let tiling_sprite = new PIXI.TilingSprite(
        app.pixi_textures["grass_tex"],
        app.stage_width,
        app.stage_height,
    );
    tiling_sprite.position.set(0,0);
    pixi_container_main.addChild(tiling_sprite);

    //subject controls
    if(app.pixi_mode=="subject")
    {
        tiling_sprite.eventMode ='static';
        
        pixi_target = new PIXI.Graphics();
        pixi_target.lineStyle(3, 0x000000);
        pixi_target.alpha = 0.33;
        pixi_target.drawCircle(0, 0, 10);
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
        fill: 'black',
        align: 'left',
    };
    let fps_label = new PIXI.Text("0 fps", text_style);
    fps_label.eventMode = 'none';

    pixi_fps_label = fps_label;
    pixi_fps_label.position.set(10, app.canvas_height-25);
    pixi_app.stage.addChild(pixi_fps_label);   
    {%endif%}

    //start game loop
    pixi_app.ticker.add(app.game_loop);
},

/**
 * game loop for pixi
 */
game_loop: function game_loop(delta)
{

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