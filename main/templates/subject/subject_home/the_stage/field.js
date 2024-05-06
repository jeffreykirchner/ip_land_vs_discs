/**
 * setup field objects
 */
setup_pixi_fields: function setup_pixi_fields()
{
    for(const i in app.session.world_state.fields)
    {
        // pixi_objects.field_container.destroy({children:true, texture:true, baseTexture:true});
        if(pixi_fields[i])
        {
            if(pixi_fields[i].hasOwnProperty('field_container'))
            {
                pixi_container_main.removeChild(pixi_fields[i].field_container);
                pixi_fields[i].field_container.destroy({children:true, baseTexture:true});
            }
        }
        else
        {
            pixi_fields[i] = {};
        }

        const field = app.session.world_state.fields[i];
        const parameter_set_field = app.session.parameter_set.parameter_set_fields[i];
        const parameter_set_period = app.get_current_parameter_set_period();
        
        let field_container = new PIXI.Container();
        // field_container.eventMode = 'static';
        field_container.zIndex = 0;

        let available_container = new PIXI.Container();
        // available_container.eventMode = 'static';
        available_container.zIndex = 0;
        available_container.visible = true;

        let claimed_container = new PIXI.Container();
        // claimed_container.eventMode = 'static';
        claimed_container.zIndex = 0;
        claimed_container.visible = false;

        pixi_fields[i].available_container = available_container;
        pixi_fields[i].claimed_container = claimed_container;

        //available_container
        let outline_dash = new PIXI.Graphics();
        //fill
        outline_dash.rect(0, 0, parameter_set_field.width, parameter_set_field.height);
        outline_dash.fill({color:0xFFFFFF, alpha:0.5});

        let matrix_2 = new PIXI.Matrix(1,0,0,1,0,0);
        matrix_2.rotate(1.5708);
        outline_dash.stroke({width:10,
                             texture:app.pixi_textures['dash_tex'],
                             alpha:0.5,
                             alignment:1,
                             color:0x000000,
                             matrix:matrix_2});
        // outline_dash.endFill();

        //outline
        // let matrix_1 = new PIXI.Matrix(1,0,0,1,0,0);
    
        // let matrix_2 = new PIXI.Matrix(1,0,0,1,0,0);
        // matrix_2.rotate(1.5708);

        // line_texture_style_1 = {width:10,
        //                         color:0x000000,
        //                         alpha:0.5,
        //                         texture:app.pixi_textures['dash_tex'],
        //                         matrix:matrix_1,
        //                         alignment:0};
        
        // line_texture_style_2 = {width:10,   
        //                         color:0x000000,
        //                         alpha:0.5,
        //                         texture:app.pixi_textures['dash_tex'],
        //                         matrix:matrix_2,
        //                         alignment:0};
        
        // // outline_dash.stroke(line_texture_style_1);
        // outline_dash.moveTo(0, 0);
        // outline_dash.lineTo(parameter_set_field.width, 0);

        // // outline_dash.stroke(line_texture_style_2);
        // outline_dash.lineTo(parameter_set_field.width, parameter_set_field.height);

        // // outline_dash.stroke(line_texture_style_1);
        // outline_dash.lineTo(0, parameter_set_field.height);

        // // outline_dash.stroke(line_texture_style_2);
        // outline_dash.lineTo(0, -10);
        // outline_dash.stroke(line_texture_style_1)

        // outline_dash.eventMode = 'passive';  

        //text
        let text_style = {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: {color:'white'},
            align: 'center',
            stroke: {color:'black', width:3},              
        };

        let id_label = null;
        if(app.is_subject && app.get_parameter_set_player_from_player_id(app.session_player.id).enable_field_production)
        {
            id_label = new PIXI.Text({text:"Right click to start field.", style:text_style});
        }
        else
        {
            id_label = new PIXI.Text({text:"This field has not started.", style:text_style});
        }
        // id_label.eventMode = 'passive';
        id_label.anchor.set(0.5);

        //right click
        let right_click_graphic = PIXI.Sprite.from(app.pixi_textures["right_click_tex"]);
        right_click_graphic.anchor.set(0.5)
        // right_click_graphic.eventMode = 'passive';

        available_container.addChild(outline_dash);        

        id_label.position.set(available_container.width/2,
                              id_label.height/2 + 30);
        
        right_click_graphic.position.set(available_container.width/2 + id_label.width/2 + 10 +  right_click_graphic.width/2,
                                         id_label.position.y);

        //cost label 
        let cost_label = new PIXI.Text({text:"Cost: " + app.session.parameter_set.field_build_length + " production seconds.", 
                                        style:text_style});
        // cost_label.eventMode = 'passive';
        cost_label.anchor.set(0.5);
        cost_label.position.set(available_container.width/2,
                                id_label.position.y + cost_label.height);
        
        available_container.addChild(id_label);
        if(app.is_subject && app.get_parameter_set_player_from_player_id(app.session_player.id).enable_field_production)
        {           
            available_container.addChild(right_click_graphic);
            available_container.addChild(cost_label);
        }

        field_container.addChild(available_container);

        //claimed_container
        //let parameter_set_player = app.get_parameter_set_player_from_player_id(field.owner);
        let outline_solid = new PIXI.Graphics();
       
        outline_solid.rect(0, 0, parameter_set_field.width, parameter_set_field.height);
        outline_solid.fill({color:'white', alpha: 0.75});
        outline_solid.stroke({width:10,color:0x000000,alpha:1});

        // outline_solid.endFill();

        // outline_solid.eventMode = 'passive';  

        //text
        let text_style_2 = {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: {color:'white'},
            align: 'center',
            stroke: {color:'black', width:3},
            wordWrap : true,
            wordWrapWidth : parameter_set_field.width - 20,
        };

        let id_label_text = ""
        let left_cone_graphic = null;
        let right_cone_graphic = null;
        let management_label = null;

        id_label_text = "Started by ___ .";

        management_label = new PIXI.Text({text:"Right click to admit others.", 
                                          style:text_style_2});

        left_cone_graphic = PIXI.Sprite.from(app.pixi_textures["cone_tex"]);
        left_cone_graphic.anchor.set(1,0.5);
        // left_cone_graphic.eventMode = 'passive';
        left_cone_graphic.scale.set(0.5);

        right_cone_graphic = PIXI.Sprite.from(app.pixi_textures["cone_tex"]);
        right_cone_graphic.anchor.set(0,0.5);
        // right_cone_graphic.eventMode = 'passive';
        right_cone_graphic.scale.set(0.5);

        let id_label_2 = new PIXI.Text({text:id_label_text, 
                                        style:text_style_2});
        // id_label_2.eventMode = 'passive';
        
        claimed_container.addChild(outline_solid);        

        id_label_2.anchor.set(0.5);
        id_label_2.position.set(field_container.width/2,
                                id_label_2.height/2 + 40);

        claimed_container.addChild(id_label_2);

        management_label.anchor.set(0.5);
        management_label.position.set(field_container.width/2,
                                      field_container.height - management_label.height/2 - 20);
        claimed_container.addChild(management_label);

        //right click
        let right_click_graphic_2 = PIXI.Sprite.from(app.pixi_textures["right_click_tex"]);
        right_click_graphic_2.anchor.set(0.5)
        // right_click_graphic_2.eventMode = 'passive';

        right_click_graphic_2.position.set(field_container.width/2 + management_label.width/2 + 10 + right_click_graphic_2.width/2,
                                            field_container.height - management_label.height/2 - 20);

        claimed_container.addChild(right_click_graphic_2);

        left_cone_graphic.position.set(0,0);
        right_cone_graphic.position.set(0,0);

        claimed_container.addChild(left_cone_graphic);
        claimed_container.addChild(right_cone_graphic);

        pixi_fields[i].outline_solid = outline_solid;
        pixi_fields[i].id_label_2 = id_label_2;
        pixi_fields[i].management_label = management_label;
        pixi_fields[i].left_cone_graphic = left_cone_graphic;
        pixi_fields[i].right_cone_graphic = right_cone_graphic;
        pixi_fields[i].right_click_graphic_2 = right_click_graphic_2;

        field_container.addChild(claimed_container);

        let text_style_multiplier = {
            fontFamily: 'Arial',
            fontSize: 26,
            fill: {color:'white'},
            align: 'center',
            stroke: {color:'black', width:3},
        };

        //multiplier table
        //header
        let multiplier_table_container = new PIXI.Container();
        let multiplier_text = "Seed Earnings Multiplier"
        let multiplier_list = app.session.parameter_set.seed_multipliers.split("\n");

        let multiplier_label = new PIXI.Text({text:multiplier_text, 
                                              style:text_style_multiplier});
        // multiplier_label.eventMode = 'passive';
        
        multiplier_label.anchor.set(0);
        multiplier_label.position.set(0,0);

        multiplier_table_container.addChild(multiplier_label);

        let present_players_length = field.present_players.length;

        if(present_players_length > multiplier_list.length) present_players_length = multiplier_list.length;

        //list
        let temp_y = multiplier_label.position.y + multiplier_label.height+2;
        pixi_fields[i].multiplier_table_left = [];
        pixi_fields[i].multiplier_table_right = [];

        for(const j in multiplier_list)
        {
            let v = parseInt(j)+1;
            let multiplier_text_left = "";
            let multiplier_text_right = "";
            
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

            multiplier_text_right =  multiplier_list[j].trim() + " x";

            let multiplier_label_left = new PIXI.Text({text:multiplier_text_left, 
                                                       style:text_style_multiplier});
            let multiplier_label_right = new PIXI.Text({text:multiplier_text_right, 
                                                        style:text_style_multiplier});

            // multiplier_label_left.eventMode = 'passive';           
            // multiplier_label_right.eventMode = 'passive';

            multiplier_label_left.anchor.set(0,0);
            multiplier_label_right.anchor.set(1,0);

            multiplier_label_left.position.set(0,temp_y);  
            multiplier_label_right.position.set(multiplier_label.width,
                                                temp_y);
            
            multiplier_table_container.addChild(multiplier_label_left);
            multiplier_table_container.addChild(multiplier_label_right);
            
            pixi_fields[i].multiplier_table_left.push(multiplier_label_left);
            pixi_fields[i].multiplier_table_right.push(multiplier_label_right);

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

        field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                     parameter_set_field.y - parameter_set_field.height/2);

        pixi_container_main.addChild(pixi_fields[i].field_container);
    }

    app.update_fields();
},

/**
 * update field containers
 */
update_field: function update_field(field_id)
{
    const field = app.session.world_state.fields[field_id];
    const parameter_set_field = app.session.parameter_set.parameter_set_fields[field_id];
    const parameter_set_period = app.get_current_parameter_set_period();

    let pixi_field = pixi_fields[field_id];

    if(field.status == "available")
    {
        pixi_field.available_container.visible = true;
        pixi_field.claimed_container.visible = false;
    }
    else
    {
        let owner = app.get_parameter_set_player_from_player_id(field.owner);

        pixi_field.available_container.visible = false;
        pixi_field.claimed_container.visible = true;

        let outline_solid = new PIXI.Graphics();
        //fill
        outline_solid.rect(0, 0, parameter_set_field.width, parameter_set_field.height);
        outline_solid.fill({color:owner.hex_color, alpha:0.75});
        outline_solid.stroke({width:10,color:0x000000,alpha:1});
        // outline_solid.endFill();

        // outline_solid.eventMode = 'passive';  

        pixi_field.outline_solid.destroy();
        pixi_field.claimed_container.addChildAt(outline_solid,0);
        pixi_field.outline_solid = outline_solid;

        if(field.status == "building")
        {
            pixi_field.id_label_2.text = "Under construction by " + owner.id_label + ".";
            pixi_field.left_cone_graphic.visible = true;
            pixi_field.right_cone_graphic.visible = true;
            pixi_field.management_label.visible = false;
            pixi_field.right_click_graphic_2.visible = false;

            pixi_field.left_cone_graphic.position.set(pixi_field.id_label_2.position.x - pixi_field.id_label_2.width/2 - 5,
                                                      pixi_field.id_label_2.position.y);
            pixi_field.right_cone_graphic.position.set(pixi_field.id_label_2.position.x + pixi_field.id_label_2.width/2 + 5,
                                                       pixi_field.id_label_2.position.y);
        }
        else
        {
            pixi_field.id_label_2.text = "Started by " + owner.id_label + ".";

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

                pixi_field.id_label_2.text += "\n Allowed Players: " + allowed_players_text + ".";
            }

            pixi_field.left_cone_graphic.visible = false;
            pixi_field.right_cone_graphic.visible = false;

            if(app.is_subject && field.owner == app.session_player.id)
            {
                if(parameter_set_period.field_pr == "True")
                {
                    pixi_field.management_label.visible = true;
                    pixi_field.right_click_graphic_2.visible = true;
                }
            }
            else
            {
                pixi_field.management_label.visible = false;
                pixi_field.right_click_graphic_2.visible = false;
            }
        }
    }
},

/**
 * update fields
 */
update_fields: function update_fields()
{
    for(const i in app.session.world_state.fields)
    {
        app.update_field(i);
    }
},

/**
 * update filed multiplier table
 
 */
update_field_multiplier_table: function update_field_multiplier_table(field_id)
{
    const field = app.session.world_state.fields[field_id];
    const parameter_set_field = app.session.parameter_set.parameter_set_fields[field_id];
    const parameter_set_period = app.get_current_parameter_set_period();

    let pixi_field = pixi_fields[field_id];

    let present_players_length = field.present_players.length;

    if(present_players_length > pixi_field.multiplier_table_left.length)
        present_players_length =  pixi_field.multiplier_table_left.length;

    for(let i=0; i<pixi_field.multiplier_table_left.length; i++)
    {
        if(present_players_length == i+1)
        {
            pixi_field.multiplier_table_left[i].style.fill = 'yellow';
            pixi_field.multiplier_table_right[i].style.fill = 'yellow';
        }
        else
        {
            pixi_field.multiplier_table_left[i].style.fill = 'white';
            pixi_field.multiplier_table_right[i].style.fill = 'white';
        }
    }

},

/** 
update multiplier tables
*/
update_field_multiplier_tables: function update_field_multiplier_tables()
{
    for(const i in app.session.world_state.fields)
    {
        app.update_field_multiplier_table(i);
    }
},

/**
 * send field claim
 */
send_field_claim: function send_field_claim()
{
    
    let field_id = app.selected_field.field.id;
    let field = app.session.world_state.fields[field_id];

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_field_claim(field_id, field);
    }
    else
    {    
        app.working = true;
            
        app.send_message("field_claim", 
                        {"field_id" : field_id, "source" : "client"},
                        "group"); 
    }
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

        app.update_field(field_id);

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
            app.working = false;
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_error = message_data.error_message[0].message;
            app.working = false;
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

    //check if enough time remaining in period to build
    if(app.selected_field.field.owner == null)
    {
        if(!app.get_parameter_set_player_from_player_id(app.session_player.id).enable_field_production)
        {
            let obj = app.session.world_state.session_players[app.session_player.id];
            app.add_text_emitters("You cannot start a field.", 
                                    obj.current_location.x, 
                                    obj.current_location.y,
                                    obj.current_location.x,
                                    obj.current_location.y-100,
                                    0xFFFFFF,
                                    28,
                                    null);
            return;
        }

        if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
            app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
        {
            let obj = app.session.world_state.session_players[app.session_player.id];
            app.add_text_emitters("No starts while on break.", 
                                    obj.current_location.x, 
                                    obj.current_location.y,
                                    obj.current_location.x,
                                    obj.current_location.y-100,
                                    0xFFFFFF,
                                    28,
                                    null);
            return;
        }

        if(app.session.world_state.time_remaining - app.session.parameter_set.disc_build_length < 
            app.session.parameter_set.interaction_only_length)
        {
            let obj = app.session.world_state.session_players[app.session_player.id];
            app.add_text_emitters("Not enough time remaining in period to start.", 
                                    obj.current_location.x, 
                                    obj.current_location.y,
                                    obj.current_location.x,
                                    obj.current_location.y-100,
                                    0xFFFFFF,
                                    28,
                                    null);
            
            app.selected_field.field = null;
            return;
        }
    }

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
    //check if on break
    if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
        app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
    {
        let obj = app.session.world_state.session_players[app.session_player.id];
        app.add_text_emitters("No production while on break.", 
                                obj.current_location.x, 
                                obj.current_location.y,
                                obj.current_location.x,
                                obj.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    //check if enough time remaining in period to build
    if(app.session.world_state.time_remaining - app.session.parameter_set.disc_build_length < 
       app.session.parameter_set.interaction_only_length)
    {
        let obj = app.session.world_state.session_players[app.session_player.id];
        app.add_text_emitters("Not enough time remaining in period to produce.", 
                                obj.current_location.x, 
                                obj.current_location.y,
                                obj.current_location.x,
                                obj.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_build_disc();
    }
    else
    {

        app.working = true;
            
        app.send_message("build_disc", 
                        {"source" : "client"},
                        "group"); 
    }
},

/**
 * take build disc
 */
take_build_disc: function take_build_disc(message_data)
{
    let source_player_id = message_data.source_player_id;
    let session_player = app.session.world_state.session_players[source_player_id];
    let source_location =  session_player.current_location;

    if(message_data.status == "success")
    {
        session_player.build_time_remaining =  message_data.build_time_remaining;
        session_player.frozen = message_data.frozen;
        session_player.state = message_data.state;
        session_player.interaction = message_data.interaction;

        if(session_player.state == "open")
        {
            session_player.disc_inventory =  message_data.disc_inventory;
            app.update_disc_wedges(message_data.source_player_id);
            
            let disc_graphic = PIXI.Sprite.from(app.pixi_textures['disc_tex']);
            // disc_graphic.eventMode = 'none';
            disc_graphic.scale.set(0.4);
            disc_graphic.alpha = 0.7;
            disc_graphic.tint = app.get_parameter_set_player_from_player_id(source_player_id).hex_color;

            app.add_text_emitters("+", 
                                source_location.x, 
                                source_location.y,
                                source_location.x,
                                source_location.y - 100,
                                0xFFFFFF,
                                28,
                                disc_graphic)
        }

        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.working = false;
            app.setup_disc_inventory();
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.working = false;

            app.add_text_emitters(message_data.error_message[0].message,
                source_location.x, 
                source_location.y,
                source_location.x,
                source_location.y - 100,
                'white',
                28,
                null)
        }
    }
},

/**
 * send build seeds
 */
send_build_seeds: function send_build_seeds()
{
    //check if on break
    if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
        app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
    {
        let obj = app.session.world_state.session_players[app.session_player.id];
        app.add_text_emitters("No production while on break.", 
                                obj.current_location.x, 
                                obj.current_location.y,
                                obj.current_location.x,
                                obj.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    //check if enough time remaining in period to build
    if(app.session.world_state.time_remaining - (app.build_seed_count * app.session.parameter_set.seed_build_length) < 
       app.session.parameter_set.interaction_only_length)
    {
        let obj = app.session.world_state.session_players[app.session_player.id];
        app.add_text_emitters("Not enough time remaining in period to produce.", 
                                obj.current_location.x, 
                                obj.current_location.y,
                                obj.current_location.x,
                                obj.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }


    if(!Number.isInteger(app.build_seed_count) ||
       app.build_seed_count<=0)
    {
        let obj = app.session.world_state.session_players[app.session_player.id];
        app.add_text_emitters("Invalid entry.", 
                                obj.current_location.x, 
                                obj.current_location.y,
                                obj.current_location.x,
                                obj.current_location.y-100,
                                0xFFFFFF,
                                28,
                                null);
        return;
    }

    
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_build_seeds();
    }
    else
    {
        app.working = true;
            
        app.send_message("build_seeds", 
                        {"build_seed_count" : app.build_seed_count,
                        "source" : "client"},
                        "group"); 
    }
},

/**
 * take build seeds
 */
take_build_seeds: function take_build_seeds(message_data)
{
    let source_player_id = message_data.source_player_id;

    let session_player = app.session.world_state.session_players[source_player_id];
    let source_location =  session_player.current_location;

    if(message_data.status == "success")
    {
        session_player.seeds =  message_data.seeds;
        session_player.build_time_remaining =  message_data.build_time_remaining;
        session_player.frozen = message_data.frozen;
        session_player.state = message_data.state;
        session_player.interaction = message_data.interaction;

        if(session_player.state == "open")
        {
            // pixi_avatars[source_player_id].inventory_label.text = session_player.seeds;
            app.update_player_inventory();
            
            let seed_graphic = PIXI.Sprite.from(app.pixi_textures['seed_tex']);
            // seed_graphic.eventMode = 'none';
            seed_graphic.scale.set(0.4);
            seed_graphic.alpha = 0.7;

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
            app.working = false;
            app.setup_seed_inventory();
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.working = false;

            app.add_text_emitters(message_data.error_message[0].message,
                                source_location.x, 
                                source_location.y,
                                source_location.x,
                                source_location.y - 100,
                                'white',
                                28,
                                null)
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
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_grant_field_access(target_player_id);
    }
    else
    {
        app.working = true;
            
        app.send_message("grant_field_access", 
                        {"target_player_id" : target_player_id,
                        "field_id" : app.selected_field.field.id,
                        "source" : "client"},
                        "group"); 
    }
},

/**
 * take grant field access
 */
take_grant_field_access: function take_grant_field_access(message_data)
{
    let source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {
        let field_id = message_data.field_id;
        let target_player_id = message_data.target_player_id;

        app.session.world_state.fields[field_id] = message_data.field;
        app.update_field(field_id);

        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_manage_modal.hide();
            app.working = false;
        }

        if(app.is_subject && target_player_id == app.session_player.id)
        {
            let source_parameter_set_player = app.get_parameter_set_player_from_player_id(source_player_id);
            let target_location = app.session.world_state.session_players[target_player_id].current_location;

            app.add_text_emitters("Access granted to " + source_parameter_set_player.id_label + "'s field.",
                                    target_location.x, 
                                    target_location.y,
                                    target_location.x,
                                    target_location.y - 100,
                                    0xFFFFFF,
                                    28,
                                    null)
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_manage_error = message_data.error_message[0].message;
            app.working = false;
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

    if(pixi_setup_complete)
    {
        for(const i in app.session.world_state.fields)
        {
            if(app.session.world_state.fields[i].owner == app.session_player.id)
            {
                field_id = i;
                break;
            }
        }
    }

    if(!field_id)
    {
        if(app.session.world_state.current_experiment_phase == 'Instructions')
        {
            app.simulate_present_players(null, []);
        }
        return;
    };

    let field = app.session.world_state.fields[field_id];
    let parameter_set_field = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];

    for(const i in app.session.world_state.session_players)
    {
        let session_player = app.session.world_state.session_players[i];
        let container=pixi_avatars[i].bounding_box;

        if(field.allowed_players.includes(parseInt(session_player.id)))
        {

            let rect2={x:parameter_set_field.x - parameter_set_field.width/2,
                       y:parameter_set_field.y - parameter_set_field.height/2,
                       width:parameter_set_field.width,
                       height:parameter_set_field.height};

            if(app.check_point_in_rectagle(session_player.current_location, rect2))
            {  
                present_players.push(i);
            }
        }
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_present_players(field_id, present_players);
    }
    else
    {
        app.send_message("present_players", 
                        {"field_id" : field_id,
                        "present_players" : present_players,
                        "source" : "client"},
                        "group"); 
    }
},