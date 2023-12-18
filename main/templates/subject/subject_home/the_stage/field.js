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
        const parameter_set_period = app.get_current_parameter_set_period();
        
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
                fontSize: 28,
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
                                  id_label.height/2 + 30);
            
            right_click_graphic.position.set(field_container.width/2 + id_label.width/2 + 10 +  right_click_graphic.width/2,
                                             id_label.position.y);

            //cost label 
            let cost_label = new PIXI.Text("Cost: " + app.session.parameter_set.field_build_length + " production seconds.", text_style);
            cost_label.eventMode = 'passive';
            cost_label.anchor.set(0.5);
            cost_label.position.set(field_container.width/2,
                                    id_label.position.y + cost_label.height);
            
            field_container.addChild(id_label);
            field_container.addChild(right_click_graphic);
            field_container.addChild(cost_label);

            field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                         parameter_set_field.y - parameter_set_field.height/2);
        }
        else
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
                fontSize: 28,
                fill: 'white',
                align: 'center',
                stroke: 'black',
                strokeThickness: 3,
                wordWrap : true,
                wordWrapWidth : parameter_set_field.width - 20,
            };

            let id_label_text = ""
            let left_cone_graphic = null;
            let right_cone_graphic = null;
            let management_label = null;

            if(field.status == "claimed")
            {
                id_label_text = "Claimed by " + parameter_set_player.id_label + ".";

                //field PR enabled
                if(parameter_set_period.field_pr == "True")
                {
                    let allowed_players_text = "";

                    for(const j in field.allowed_players)
                    {
                        let allowed_player = app.get_parameter_set_player_from_player_id(field.allowed_players[j]);

                        if(field.allowed_players.length > 1)
                        {
                            if(j == field.allowed_players.length - 1)
                            {
                                allowed_players_text += " and ";
                            }
                            else if(j > 0)
                            {
                                allowed_players_text += ", ";
                            }
                        }
                        
                        allowed_players_text += allowed_player.id_label;
                    }

                    id_label_text += "\n Allowed Players: " + allowed_players_text + ".";

                    //management label
                    if(app.is_subject && field.owner == app.session_player.id)
                    {
                        management_label = new PIXI.Text("Right click to manage.", text_style);
                    }                   
                }
            }
            else
            {
                id_label_text = "Under construction by " + parameter_set_player.id_label + ".";

                left_cone_graphic = PIXI.Sprite.from(app.pixi_textures["cone_tex"]);
                left_cone_graphic.anchor.set(1,0.5)
                left_cone_graphic.eventMode = 'passive';
                left_cone_graphic.scale.set(0.5);

                right_cone_graphic = PIXI.Sprite.from(app.pixi_textures["cone_tex"]);
                right_cone_graphic.anchor.set(0,0.5)
                right_cone_graphic.eventMode = 'passive';
                right_cone_graphic.scale.set(0.5);
            }

            let id_label = new PIXI.Text(id_label_text, text_style);
            id_label.eventMode = 'passive';
           
            field_container.addChild(outline);        

            id_label.anchor.set(0.5);
            id_label.position.set(field_container.width/2,
                                  id_label.height/2 + 20);

            field_container.addChild(id_label);

            //management label
            if(management_label)
            {
                management_label.anchor.set(0.5);
                management_label.position.set(field_container.width/2,
                                              field_container.height - management_label.height/2 - 20);
                field_container.addChild(management_label);

                //right click
                let right_click_graphic = PIXI.Sprite.from(app.pixi_textures["right_click_tex"]);
                right_click_graphic.anchor.set(0.5)
                right_click_graphic.eventMode = 'passive';

                right_click_graphic.position.set(field_container.width/2 + management_label.width/2 + 10 + right_click_graphic.width/2,
                                                 field_container.height - management_label.height/2 - 20);

                field_container.addChild(right_click_graphic);
            }

            //cones
            if(field.status == "building")
            {
                left_cone_graphic.position.set(field_container.width/2 - id_label.width/2 - 5 - left_cone_graphic.width/2,
                                               id_label.position.y);
                right_cone_graphic.position.set(field_container.width/2 + id_label.width/2 + 5 +  right_cone_graphic.width/2,
                                                id_label.position.y);
                field_container.addChild(left_cone_graphic);
                field_container.addChild(right_cone_graphic);
            }

            field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                        parameter_set_field.y - parameter_set_field.height/2);
        }

        let text_style_multiplier = {
            fontFamily: 'Arial',
            fontSize: 26,
            fill: 'white',
            align: 'center',
            stroke: 'black',
            strokeThickness: 3,
        };

        //multiplier table
        //header
        let multiplier_table_container = new PIXI.Container();
        let multiplier_text = "Seed Earnings Multiplier"
        let multiplier_list = app.session.parameter_set.seed_multipliers.split("\n");

        let multiplier_label = new PIXI.Text(multiplier_text, text_style_multiplier);
        multiplier_label.eventMode = 'passive';
        
        multiplier_label.anchor.set(0);
        multiplier_label.position.set(0,0);

        multiplier_table_container.addChild(multiplier_label);

        //list
        let temp_y = multiplier_label.position.y + multiplier_label.height+2;
        for(const i in multiplier_list)
        {
            let v = parseInt(i)+1;
            let multiplier_text_left = "";
            let multiplier_text_right = "";

            if(field.present_players.length == v)
            {
                text_style_multiplier.fill = 'yellow';
            }
            else
            {
                text_style_multiplier.fill = 'white';
            }
            
            if(v == 1)
            {
                multiplier_text_left = v + " Player";
            }
            else if(v == multiplier_list.length)
            {
                multiplier_text_left = v + "+ Players";
            }
            else
            {
                multiplier_text_left = v + " Players";
            }

            multiplier_text_right =  multiplier_list[i] + " x";

            let multiplier_label_left = new PIXI.Text(multiplier_text_left, text_style_multiplier);
            let multiplier_label_right = new PIXI.Text(multiplier_text_right, text_style_multiplier);

            multiplier_label_left.eventMode = 'passive';           
            // multiplier_label_right.eventMode = 'passive';

            multiplier_label_left.anchor.set(0,0);
            multiplier_label_right.anchor.set(1,0);

            multiplier_label_left.position.set(0,temp_y);  
            multiplier_label_right.position.set(multiplier_label.width,
                                                temp_y);
            
            multiplier_table_container.addChild(multiplier_label_left);
            multiplier_table_container.addChild(multiplier_label_right);

            temp_y += multiplier_label_left.height-8;
        }

        multiplier_table_container.position.set(field_container.width/2 - multiplier_table_container.width/2,
                                                field_container.height/2 - multiplier_table_container.height/2+20);
                                    
        field_container.addChild(multiplier_table_container);

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
                    {"field_id" : field_id, "source" : "client"},
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

        if(app.is_subject)
        {
            app.setup_pixi_minimap();
        }

        let session_player = app.session.world_state.session_players[source_player_id];

        session_player.build_time_remaining =  message_data.build_time_remaining;
        session_player.frozen = message_data.frozen;
        session_player.state = message_data.state;
        session_player.interaction = message_data.interaction;

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
 * handle field manage modal hide
 */
hide_field_manage_modal: function hide_field_manage_modal()
{
    app.selected_field.field = null;
    app.selected_field.field_type = null;
    app.field_manage_modal_open = false
    app.working = false;
},

/**
 * subject field click
 */
subject_field_click: function subject_field_click(target_field_id)
{

    app.selected_field.field = app.session.world_state.fields[target_field_id];

    app.clear_main_form_errors();
    app.working = false;

    let parameter_set_period = app.get_current_parameter_set_period();

    if(app.selected_field.field.status == "available")
    {
        app.selected_field.field_type = "available";
        app.field_modal.show();
        app.field_modal_open = true;
        app.field_error = null;
    }
    else if (app.selected_field.field.status == "claimed" && 
             parameter_set_period.field_pr == "True" && 
             app.selected_field.field.owner == app.session_player.id)
    {
        app.selected_field.field_type = "claimed";
        app.field_manage_modal.show();
        app.field_manage_modal_open = true;
        app.field_manage_error = null;
    }
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

/**
 * check field intersection
 */
check_fields_intersection: function check_fields_intersection(rect1, player_id)
{
    for(let i in app.session.parameter_set.parameter_set_fields)
    {        
        
        let field = app.session.world_state.fields[i];
        let parameter_set_field = app.session.parameter_set.parameter_set_fields[i];

        if(!field.allowed_players.includes(parseInt(player_id)))
        {
            let rect2={x:parameter_set_field.x - parameter_set_field.width/2,
                       y:parameter_set_field.y - parameter_set_field.height/2,
                       width:parameter_set_field.width,
                       height:parameter_set_field.height};

            if(app.check_for_rect_intersection(rect1, rect2))
            {  
                return true;
            }
        }
    }

    return false;
},

/**
 * get manage field players that could be allowed
 */
get_manage_field_players_that_could_be_allowed: function get_manage_field_players_that_could_be_allowed(field_id)
{
    let current_allowed_players = app.session.world_state.fields[field_id].allowed_players;
    let potential_allowed_players = [];

    for(i in app.session.session_players)
    {
        if(!current_allowed_players.includes(app.session.session_players[i].id))
        {
            potential_allowed_players.push(app.session.session_players[i]);
        }
    }

    return potential_allowed_players;
},

/**
 * send grant field access
 */
send_grant_field_access: function send_grant_field_access(target_player_id)
{
    app.working = true;
        
    app.send_message("grant_field_access", 
                    {"target_player_id" : target_player_id,
                     "field_id" : app.selected_field.field.id,
                     "source" : "client"},
                     "group"); 
},

/**
 * take grant field access
 */
take_grant_field_access: function take_grant_field_access(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {
        let field_id = message_data.field_id;
        app.session.world_state.fields[field_id] = message_data.field;

        app.destroy_pixi_fields();
        app.setup_pixi_fields();

        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_manage_modal.hide();
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_manage_error = message_data.error_message[0].message;
        }
    }
},

/**
 * send grant field access
 */
send_present_players: function send_present_players()
{
    let field_id = null;
    let present_players = [];

    for(const i in app.session.world_state.fields)
    {
        if(app.session.world_state.fields[i].owner == app.session_player.id)
        {
            field_id = i;
            break;
        }
    }

    if(!field_id) return;

    let field = app.session.world_state.fields[field_id];
    let parameter_set_field = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];

    for(const i in app.session.world_state.session_players)
    {
        let session_player = app.session.world_state.session_players[i];
        let container=pixi_avatars[i].bounding_box;

        if(!field.allowed_players.includes(parseInt(session_player.id)))
        {
            let rect1={x:session_player.current_location.x - container.width/2,
                       y:session_player.current_location.y - container.height/2,
                       width:container.width,
                       height:container.height};

            let rect2={x:parameter_set_field.x - parameter_set_field.width/2,
                       y:parameter_set_field.y - parameter_set_field.height/2,
                       width:parameter_set_field.width,
                       height:parameter_set_field.height};

            if(app.check_for_rect_intersection(rect1, rect2))
            {  
                present_players.push(i);
            }
        }
    }
        
    app.send_message("present_players", 
                    {"field_id" : field_id,
                     "present_players" : present_players,
                     "source" : "client"},
                     "group"); 
},