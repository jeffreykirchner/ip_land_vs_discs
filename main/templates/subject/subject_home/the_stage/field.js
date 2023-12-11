/**
 * setup field objects
 */
setup_pixi_fields: function setup_pixi_fields()
{
    for(const i in app.session.world_state.fields)
    {
        pixi_fields[i] = {};

        const field = app.session.world_state.fields[i];
        const parameter_set_field = app.session.parameter_set.parameter_set_fields[i];
        
        let field_container = new PIXI.Container();
        field_container.eventMode = 'passive';
        field_container.zIndex = 0;

        if(field.status == "available")
        {
            let outline = new PIXI.Graphics();
            //fill
            outline.beginFill(0xFFFFFF, 0.5);
            outline.drawRect(0, 0, parameter_set_field.width, parameter_set_field.height);
            outline.endFill();

            //outline
            let matrix_1 = new PIXI.Matrix(1,0,0,1,0,0);
        
            let matrix_2 = new PIXI.Matrix(1,0,0,1,0,0);
            matrix_2.rotate(1.5708);

            line_texture_style_1 = {width:10,
                                    color:0x000000,
                                    alpha:0.5,
                                    texture:app.pixi_textures['dash_tex'],
                                    matrix:matrix_1,
                                    alignment:0};
            
            line_texture_style_2 = {width:10,   
                                    color:0x000000,
                                    alpha:0.5,
                                    texture:app.pixi_textures['dash_tex'],
                                    matrix:matrix_2,
                                    alignment:0};
            
            outline.lineTextureStyle(line_texture_style_1);
            outline.moveTo(0, 0);
            outline.lineTo(parameter_set_field.width, 0);

            outline.lineTextureStyle(line_texture_style_2);
            outline.lineTo(parameter_set_field.width, parameter_set_field.height);

            outline.lineTextureStyle(line_texture_style_1);
            outline.lineTo(0, parameter_set_field.height);

            outline.lineTextureStyle(line_texture_style_2);
            outline.lineTo(0, 0);

            outline.eventMode = 'passive';  

            //text
            let text_style = {
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 'white',
                align: 'center',
                stroke: 'black',
                strokeThickness: 3,
            };

            let id_label = new PIXI.Text("Right click to claim.", text_style);
            id_label.eventMode = 'passive';
            id_label.anchor.set(0.5);

            //right click
            let right_click_graphic = PIXI.Sprite.from(app.pixi_textures["right_click_tex"]);
            right_click_graphic.anchor.set(0.5)
            right_click_graphic.eventMode = 'passive';

            field_container.addChild(outline);        

            id_label.position.set(field_container.width/2,
                                field_container.height/2 - id_label.height/2 - 20);
            
            right_click_graphic.position.set(field_container.width/2 + id_label.width/2 + 10 +  right_click_graphic.width/2,
                                            field_container.height/2- id_label.height/2 - 20);

            //cost label 
            let cost_label = new PIXI.Text("Cost: " + app.session.parameter_set.field_build_length + " production seconds.", text_style);
            cost_label.eventMode = 'passive';
            cost_label.anchor.set(0.5);
            cost_label.position.set(field_container.width/2,
                                    field_container.height/2);
            
            field_container.addChild(id_label);
            field_container.addChild(right_click_graphic);
            field_container.addChild(cost_label);

            field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                        parameter_set_field.y - parameter_set_field.height/2);
        }
        else if(field.status == "claimed")
        {
            let parameter_set_player = app.get_parameter_set_player_from_player_id(field.owner);
            let outline = new PIXI.Graphics();
            //fill
            outline.lineStyle({width:10,color:0x000000,alpha:1});
            outline.beginFill(parameter_set_player.hex_color, 1);
            outline.drawRect(0, 0, parameter_set_field.width, parameter_set_field.height);
            outline.endFill();

            outline.eventMode = 'passive';  

            //text
            let text_style = {
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 'white',
                align: 'center',
                stroke: 'black',
                strokeThickness: 3,
            };

            let id_label = new PIXI.Text("Claimed by " + parameter_set_player.id_label + ".", text_style);
            id_label.eventMode = 'passive';
            id_label.anchor.set(0.5);

            field_container.addChild(outline);        

            id_label.position.set(field_container.width/2,
                                 field_container.height/2 - id_label.height/2 - 20);
            
            field_container.addChild(id_label);

            field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                        parameter_set_field.y - parameter_set_field.height/2);
        }

        field_container.zIndex = 0;

        pixi_fields[i].field_container = field_container;
        pixi_fields[i].rect = {x:parameter_set_field.x, 
                               y:parameter_set_field.y, 
                               width:parameter_set_field.width, 
                               height:parameter_set_field.height};

        pixi_container_main.addChild(pixi_fields[i].field_container);
    }
},

/**
 * destory pixi field objects in world state
 */
destroy_pixi_fields: function destory_setup_pixi_fields()
{
    if(!app.session) return;

    for(const i in app.session.world_state.fields){

        let pixi_objects = pixi_fields[i];

        if(pixi_objects)
        {
            pixi_objects.field_container.destroy();
        }
    }
},

/**
 * send field claim
 */
send_field_claim: function send_field_claim()
{

    let field_id = app.selected_field.field.id;
    let field = app.session.world_state.fields[field_id];

    app.working = true;
        
    app.send_message("field_claim", 
                    {"field_id" : field_id,},
                    "group"); 
},

/**
 * take field_claim
 */
take_field_claim: function take_field_claim(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {
        let field_id = message_data.field_id;
        app.session.world_state.fields[field_id] = message_data.field;

        app.destroy_pixi_fields();
        app.setup_pixi_fields();

        app.setup_pixi_minimap();

        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_modal.hide();
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_error = message_data.error_message[0].message;
        }
    }
},

/**
 * handle field modal hide
 */
hide_field_modal: function hide_field_modal()
{
    app.selected_field.field = null;
    app.selected_field.field_type = null;
    app.field_modal_open = false
    app.working = false;
},

/**
 * subject field click
 */
subject_field_click: function subject_field_click(target_field_id)
{

    app.selected_field.field = app.session.world_state.fields[target_field_id];

    app.clear_main_form_errors();

    app.field_modal.show();
    app.working = false;
    app.field_modal_open = true;
    app.field_error = null;
},

/**
 * send build disc
 */
send_build_disc: function send_build_disc()
{

    app.working = true;
        
    app.send_message("build_disc", 
                    {},
                    "group"); 
},

/**
 * take build disc
 */
take_build_disc: function take_build_disc(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {


        if(app.is_subject && source_player_id == app.session_player.id)
        {
            
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
           
        }
    }
},

/**
 * send build seeds
 */
send_build_seeds: function send_build_seeds()
{
    app.working = true;
        
    app.send_message("build_seeds", 
                    {"build_seed_count" : app.build_seed_count,
                     "source" : "client"},
                    "group"); 
},

/**
 * take build seeds
 */
take_build_seeds: function take_build_seeds(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {

        let session_player = app.session.world_state.session_players[source_player_id];

        session_player.seeds =  message_data.seeds;
        session_player.build_time_remaining =  message_data.build_time_remaining;
        session_player.frozen = message_data.frozen;
        session_player.state = message_data.state;
        session_player.interaction = message_data.interaction;

        if(session_player.state == "open")
        {
            pixi_avatars[source_player_id].inventory_label.text = session_player.seeds;

            let seed_graphic = PIXI.Sprite.from(app.pixi_textures['seed_tex']);
            seed_graphic.eventMode = 'none';
            seed_graphic.scale.set(0.4);
            seed_graphic.alpha = 0.7;

            let source_location =  session_player.current_location;

            app.add_text_emitters("+" + message_data.build_seed_count, 
                                source_location.x, 
                                source_location.y,
                                source_location.x,
                                source_location.y - 100,
                                0xFFFFFF,
                                28,
                                seed_graphic)
        }

        if(app.is_subject && source_player_id == app.session_player.id)
        {
            
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
           
        }
    }
},