/**
 * setup the pixi components for each subject
 */
setup_pixi_subjects: function setup_pixi_subjects(){

    if(!app.session) return;
    if(!app.session.started) return;
    
    let current_z_index = 1000;
    let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];
    for(const i in app.session.world_state.session_players)
    {      
        let subject = app.session.world_state.session_players[i];
        let parameter_set_player = app.get_parameter_set_player_from_player_id(i);
        pixi_avatars[i] = {};

        //avatar
        let avatar_container = new PIXI.Container();
        avatar_container.position.set(subject.current_location.x, subject.current_location.y);
        avatar_container.height = 250;
        avatar_container.width = 250;
        // avatar_container.eventMode = 'passive';
        avatar_container.label = {player_id : i};
        avatar_container.zIndex=200;
        // avatar_container.on("pointerup", app.subject_avatar_click);

        let gear_sprite = new PIXI.AnimatedSprite(app.pixi_textures.sprite_sheet.animations['walk']);
        gear_sprite.animationSpeed = app.session.parameter_set.avatar_animation_speed;
        gear_sprite.anchor.set(0.5)
        gear_sprite.tint = parameter_set_player.hex_color;
        // gear_sprite.eventMode = 'passive';    

        let face_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["face_1.png"]);
        face_sprite.anchor.set(0.5);
        // face_sprite.eventMode = 'passive';

        let text_style = {
            fontFamily: 'Arial',
            fontSize: 40,
            fill: {color:'white'},
            align: 'left',
            stroke: {color:'black', width: 3},
        };

        let text_style_2 = {
            fontFamily: 'Arial',
            fontSize: 50,
            fill: {color:'white'},
            align: 'left',
            stroke: {color:'black', width: 3},
        };

        let id_label = new PIXI.Text({text:parameter_set_player.id_label, 
                                      style:text_style});
        // id_label.eventMode = 'passive';
        id_label.anchor.set(0.5);
        
        let token_graphic = PIXI.Sprite.from(app.pixi_textures["seed_tex"]);
        // token_graphic.eventMode = 'passive';
        token_graphic.scale.set(0.7);
        token_graphic.anchor.set(1, 0.5)
        // token_graphic.alpha = 0.7;

        let inventory_label = new PIXI.Text({text : subject.seeds,style : text_style_2});
        // inventory_label.eventMode = 'passive';
        inventory_label.anchor.set(0, 0.5);

        let status_label = new PIXI.Text({text:"Working ... 10", style:text_style});
        // status_label.eventMode = 'passive';
        status_label.anchor.set(0.5);
        status_label.visible = false;

        let disc_wedges = new PIXI.Graphics(); 
        // disc_wedges.eventMode = 'passive';    
        let disc_wedge_radius = gear_sprite.width/2-80;        
        disc_wedges.circle(0, 0, disc_wedge_radius);
        disc_wedges.fill({color:'white', alpha:0.5});
        // disc_wedges.endFill();

        pixi_avatars[i].disc_wedges = disc_wedges;
       
        avatar_container.addChild(gear_sprite);
        if(app.session.parameter_set.enable_discs=="True") avatar_container.addChild(disc_wedges);
        avatar_container.addChild(face_sprite);
        avatar_container.addChild(id_label);
        avatar_container.addChild(token_graphic);
        avatar_container.addChild(inventory_label);
        avatar_container.addChild(status_label);
        
        let avatar_height = avatar_container.height;

        face_sprite.position.set(0, 0);
        id_label.position.set(0, avatar_height/2 - 30);
        token_graphic.position.set(-2, -avatar_height/2+10);
        inventory_label.position.set(2, -avatar_height/2+10);
        status_label.position.set(0, avatar_height/2 + 15);
        disc_wedges.position.set(0, 0);

        pixi_avatars[i].status_label = status_label;
        pixi_avatars[i].gear_sprite = gear_sprite;
        pixi_avatars[i].inventory_label = inventory_label;

        app.update_disc_wedges(i);

        avatar_container.scale.set(app.session.parameter_set.avatar_scale);

        //bounding box with avatar scaller        
        let bounding_box = new PIXI.Graphics();
    
       
        bounding_box.rect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale, 
                                    avatar_container.height * app.session.parameter_set.avatar_bound_box_percent * app.session.parameter_set.avatar_scale);
        bounding_box.stroke(2, "orchid");
        bounding_box.pivot.set(bounding_box.width/2, bounding_box.height/2);
        bounding_box.position.set(0, 0);
        bounding_box.visible = false;

        avatar_container.addChild(bounding_box);
        pixi_avatars[i].bounding_box = bounding_box;

        //bound box view
        let bounding_box_view = new PIXI.Graphics();
    
        
        bounding_box_view.rect(0, 0, avatar_container.width * app.session.parameter_set.avatar_bound_box_percent, 
                                    avatar_container.height * app.session.parameter_set.avatar_bound_box_percent);
        bounding_box_view.stroke(2, "orchid");
        bounding_box_view.pivot.set(bounding_box_view.width/2, bounding_box_view.height/2);
        bounding_box_view.position.set(0, 0);

        avatar_container.addChild(bounding_box_view);
        
        if(!app.draw_bounding_boxes)
        {
            bounding_box_view.visible = false;
        }

        pixi_avatars[i].avatar = {};
        pixi_avatars[i].avatar_container = avatar_container;

        pixi_container_main.addChild(pixi_avatars[i].avatar_container);

        //chat
        let chat_container = new PIXI.Container();
        chat_container.position.set(subject.current_location.x, subject.current_location.y);
        //chat_container.visible = true;
        
        let chat_bubble_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["chat_bubble.png"]);
        chat_bubble_sprite.anchor.set(0.5);
        // chat_bubble_sprite.eventMode = 'none';

        let chat_bubble_text = new PIXI.Text({text:'',style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0x000000,
                align: 'left',
            }});
        // chat_bubble_text.eventMode = 'none';    

        chat_container.addChild(chat_bubble_sprite);
        chat_container.addChild(chat_bubble_text);

        chat_bubble_text.position.set(-14 * app.session.parameter_set.avatar_scale, -chat_container.height*.09)
        chat_bubble_text.anchor.set(0.5);
        
        pixi_avatars[i].chat = {};
        pixi_avatars[i].chat.container = chat_container;
        pixi_avatars[i].chat.bubble_text = chat_bubble_text;
        pixi_avatars[i].chat.bubble_sprite = chat_bubble_sprite;
        pixi_avatars[i].chat.container.zIndex = current_z_index++;

        subject.show_chat = false;
        subject.chat_time = null;

        pixi_container_main.addChild(pixi_avatars[i].chat.container);

        //tractor beam
        pixi_avatars[i].tractor_beam = [];
        subject.tractor_beam_target = null;

        for(let j=0; j<15; j++)
        {
            let tractor_beam_sprite = PIXI.Sprite.from(app.pixi_textures.sprite_sheet_2.textures["particle2.png"]);
            tractor_beam_sprite.anchor.set(0.5);
            // tractor_beam_sprite.eventMode = 'passive';
            tractor_beam_sprite.visible = false;
            tractor_beam_sprite.zIndex = 1500;
            pixi_avatars[i].tractor_beam.push(tractor_beam_sprite);
            pixi_container_main.addChild(tractor_beam_sprite);
        }

        //interaction range
        let interaction_container = new PIXI.Container();
        interaction_container.position.set(subject.current_location.x, subject.current_location.y);

        let interaction_range = new PIXI.Graphics();
        let interaction_range_radius = app.session.parameter_set.interaction_range;

        interaction_range.circle(0, 0, interaction_range_radius);
        interaction_range.stroke({width:1, color:"dimgray", alignment:0});

        interaction_container.zIndex=2
        interaction_container.addChild(interaction_range);
        pixi_avatars[i].interaction_container = interaction_container;
        pixi_container_main.addChild(pixi_avatars[i].interaction_container);

        if(app.pixi_mode != "subject")
        {
            //view range for server
            let view_container = new PIXI.Container();
            view_container.position.set(subject.current_location.x, subject.current_location.y);

            let view_range = new PIXI.Graphics();
           
            view_range.rect(0, 0, 1850, 800);
            view_range.fill({color:parameter_set_player.hex_color, 
                             alpha:0.1});
            // view_range.endFill();    
            view_range.zIndex = 75;
            view_range.pivot.set(1850/2, 800/2);
            view_range.position.set(0, 0);

            view_container.addChild(view_range);
            pixi_avatars[i].view_container = view_container;
            pixi_container_main.addChild(pixi_avatars[i].view_container);
        }

    }

    //make local subject the top layer
    if(app.pixi_mode=="subject")
    {  
        pixi_avatars[app.session_player.id].avatar_container.zIndex = 999;
        pixi_avatars[app.session_player.id].chat.container.zIndex = current_z_index;
    }
},

/**
 * destroy pixi subject objects in world state
 */
destroy_pixi_subjects: function destroy_pixi_subjects()
{
    if(!app.session) return;

    for(const i in app.session.world_state.session_players){

        let pixi_objects = pixi_avatars[i];

        if(pixi_objects)
        {
            pixi_container_main.removeChild(pixi_objects.avatar_container);
            pixi_container_main.removeChild(pixi_objects.chat.container);
            pixi_container_main.removeChild(pixi_objects.interaction_container);

            pixi_objects.avatar_container.destroy({children:true, baseTexture:true});
            pixi_objects.chat.container.destroy({children:true, baseTexture:true});
            pixi_objects.interaction_container.destroy({children:true, baseTexture:true});

            if(app.pixi_mode != "subject")
            {
                pixi_container_main.removeChild(pixi_objects.view_container);
                pixi_objects.view_container.destroy({children:true, baseTexture:true});
            }

            for(let j=0; j<pixi_objects.tractor_beam.length; j++)
            {
                pixi_container_main.removeChild(pixi_objects.tractor_beam[j]);
                pixi_objects.tractor_beam[j].destroy({children:true, baseTexture:true});
            }
        }
    }
},

/**
 * subject avatar click
 */
subject_avatar_click: function subject_avatar_click(target_player_id)
{
    if(target_player_id == app.session_player.id) return;

    if(app.session.world_state.current_experiment_phase == 'Instructions' && 
       app.session_player.current_instruction != app.instructions.action_page_interaction)
    {
        return;
    }

    // console.log("subject avatar click", target_player_id);

    // app.send_message("tractor_beam", 
    //                  {"target_player_id" : target_player_id},
    //                  "group");
    
    app.selected_player.session_player = app.session.world_state.session_players[target_player_id];
    app.selected_player.selected_player_id = target_player_id;
    app.selected_player.parameter_set_player = app.get_parameter_set_player_from_player_id(target_player_id);

    app.interaction_start_modal.toggle();
    app.interaction_start_modal_open = true;
},

/**
 * start send seeds
 */
start_send_seeds: function start_send_seeds()
{
    app.selected_player.interaction_type = "send_seeds";
    app.selected_player.interaction_amount = 0;
    app.interaction_start_modal.hide();
    app.interaction_modal.toggle();
    app.interaction_modal_open = true;
},

/**
 * start take seeds
 */
start_take_seeds: function start_take_seeds()
{
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.add_text_emitters("Disabled during instructions.", 
                session_player.current_location.x, 
                session_player.current_location.y,
                session_player.current_location.x,
                session_player.current_location.y-100,
                0xFFFFFF,
                28,
                null);
        return;
    }


    if(session_player.cool_down > 0 || target_player.cool_down > 0)
    {
        app.interaction_error = "No takes while cooling down.";
        return;
    }

    if(session_player.interaction > 0 || target_player.interaction > 0)
    {
        app.interaction_error = "No takes while interacting.";
        return;
    }
    
    app.working = true;
    app.selected_player.interaction_type = "take_seeds";
    app.selected_player.interaction_amount = 0;
    
    app.send_message("tractor_beam", 
                    {"target_player_id": app.selected_player.selected_player_id,
                     "interaction_type": app.selected_player.interaction_type},
                     "group");
},

/**
 * select all seeds
 */
select_all_seeds: function select_all_seeds()
{
    if(app.selected_player.interaction_type == "send_seeds")
    {
        let session_player = app.session.world_state.session_players[app.session_player.id];
        app.selected_player.interaction_amount = session_player.seeds;
    }
    else if(app.selected_player.interaction_type == "take_seeds")
    {
        let session_player = app.session.world_state.session_players[app.selected_player.selected_player_id];
        app.selected_player.interaction_amount = session_player.seeds;
    }
},

/**
 * start send disc
 */
start_send_disc: function start_send_disc()
{
    app.selected_player.interaction_type = "send_disc";

    app.selected_player.interaction_discs={};

    let session_player = app.session.world_state.session_players[app.session_player.id];

    for(const i in session_player.disc_inventory)
    {
        if(session_player.disc_inventory[i])
        {
            // if(i == app.session_player.id)
            // {
            //     app.selected_player.interaction_discs[i] = true;
            // }
            // else
            // {
                app.selected_player.interaction_discs[i] = false;
            //}
        }
    }

    app.interaction_start_modal.hide();
    app.interaction_modal.toggle();
    app.interaction_modal_open = true;
},

/**
 * send my disc only
 */
send_my_disc: function send_my_disc()
{
    let session_player = app.session.world_state.session_players[app.session_player.id];

    if(!session_player.disc_inventory[app.session_player.id])
    {
        app.interaction_error = "Your disc is not built.";
        return;
    }

    app.selected_player.interaction_discs={};
    app.selected_player.interaction_discs[app.session_player.id] = true;
    app.selected_player.interaction_type = "send_disc";

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_interaction();
    }
    else
    {
        app.working = true;

        app.send_message("interaction", 
                        {"target_player_id": app.selected_player.selected_player_id,
                        "interaction_type": app.selected_player.interaction_type,
                        "interaction_amount" : 0,
                        "interaction_discs": app.selected_player.interaction_discs},
                        "group"); 
    }
   
},

/**
 * start take disc
 */ 
start_take_disc: function start_take_disc()
{
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.add_text_emitters("Disabled during instructions.", 
                session_player.current_location.x, 
                session_player.current_location.y,
                session_player.current_location.x,
                session_player.current_location.y-100,
                0xFFFFFF,
                28,
                null);
        return;
    }

    if(session_player.cool_down > 0 || target_player.cool_down > 0)
    {
        app.interaction_error = "No takes while cooling down.";
        return;
    }

    if(session_player.interaction > 0 || target_player.interaction > 0)
    {
        app.interaction_error = "No takes while interacting.";
        return;
    }
    
    app.working = true;
    app.selected_player.interaction_type = "take_disc";

    app.selected_player.interaction_discs={};

    for(const i in target_player.disc_inventory)
    {
        if(target_player.disc_inventory[i])
        {
            app.selected_player.interaction_discs[i] = false;
        }
    }

    app.send_message("tractor_beam", 
                    {"target_player_id": app.selected_player.selected_player_id,
                     "interaction_type": app.selected_player.interaction_type},
                     "group");
},

/**
 * select all discs
 */
select_all_discs: function select_all_discs()
{
   for(const i in app.selected_player.interaction_discs)
   {
       app.selected_player.interaction_discs[i] = true;
   }
},

/*
* select disc
*/
select_disc: function select_disc(id)
{
    for(const i in app.selected_player.interaction_discs)
    {
        app.selected_player.interaction_discs[i] = false;
    }
    app.selected_player.interaction_discs[id] = true;
},


/**
 * update the inventory of the player
 */
update_player_inventory: function update_player_inventory()
{

    let period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    for(const i in app.session.session_players_order)
    {
        const player_id = app.session.session_players_order[i];
        let session_player = app.session.world_state.session_players[player_id];
        let multiplied_seeds = session_player.seeds * session_player.seed_multiplier;
        let text = session_player.seeds;
        pixi_avatars[player_id].inventory_label.text = text;
    }
},

/**
 * send interaction to server
 */
send_interaction: function send_interaction()
{
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];
    
    if(app.selected_player.interaction_type == "send_seeds" || 
       app.selected_player.interaction_type == "take_seeds")
    {
        if(!Number.isInteger(app.selected_player.interaction_amount) ||
            app.selected_player.interaction_amount<=0)
        {
            app.interaction_error = "Invalid entry.";
            return;
        }

        if(app.selected_player.interaction_type == "send_seeds")
        {
            if(app.selected_player.interaction_amount > session_player.seeds)
            {
                app.interaction_error = "You do not have enough seeds.";
                return;
            }
        }

    }

    if(app.selected_player.interaction_type == "send_disc" ||
         app.selected_player.interaction_type == "take_disc")
    {
        let disc_count = 0;
        for(const i in app.selected_player.interaction_discs)
        {
            if(app.selected_player.interaction_discs[i])
            {
                disc_count++;
            }
        }

        if(disc_count == 0)
        {
            app.interaction_error = "Select at least one disc.";
            return;
        }
    }


    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.simulate_interaction();
    }
    else
    {
        
        app.working = true;

        app.send_message("interaction", 
                        {"target_player_id": app.selected_player.selected_player_id,
                         "interaction_type": app.selected_player.interaction_type,
                         "interaction_amount" : app.selected_player.interaction_amount,
                         "interaction_discs": app.selected_player.interaction_discs},
                         "group"); 
    } 
    
},

/**
 * result of subject activating tractor beam
 */
take_tractor_beam: function take_tractor_beam(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {

        let player_id = message_data.player_id;
        let target_player_id = message_data.target_player_id;
    
        app.session.world_state.session_players[player_id].tractor_beam_target = target_player_id;
    
        app.session.world_state.session_players[player_id].frozen = true
        app.session.world_state.session_players[target_player_id].frozen = true
    
        app.session.world_state.session_players[player_id].interaction = app.session.parameter_set.interaction_length;
        app.session.world_state.session_players[target_player_id].interaction = app.session.parameter_set.interaction_length;
    
        if(app.is_subject)
        {
            if(player_id == app.session_player.id)
            {
                app.interaction_start_modal.hide();
                app.field_modal.hide();
                app.field_manage_modal.hide();

                app.interaction_modal.toggle();
                app.interaction_modal_open = true;

                app.working = false;
            }
            else if(target_player_id == app.session_player.id)
            {
                
                app.field_modal.hide();
                app.field_manage_modal.hide();

                app.interaction_modal.hide();
                app.interaction_start_modal.hide();

                app.working = false;
            }
        }
        
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.interaction_error = message_data.error_message[0].message;
        }
    }

   
},

/**
 * take update from server about interactions
 */
take_interaction: function take_interaction(message_data)
{
    let interaction_type = message_data.interaction_type;

    let source_player_id = message_data.source_player_id;
    let target_player_id = message_data.target_player_id;

    if(message_data.status == "success")
    {
        let source_player = app.session.world_state.session_players[source_player_id];
        let target_player = app.session.world_state.session_players[target_player_id];

        let period = message_data.period;

        //update status
        source_player.tractor_beam_target = null;

        source_player.frozen = message_data.source_player_frozen;
        target_player.frozen = message_data.target_player_frozen;
    
        source_player.interaction = message_data.source_player_interaction;
        target_player.interaction = message_data.target_player_interaction;

        source_player.cool_down = message_data.source_player_cool_down;
        target_player.cool_down = message_data.target_player_cool_down;

        //update inventory
        source_player.seeds = message_data.source_player_seeds;
        target_player.seeds = message_data.target_player_seeds;

        source_player.disc_inventory = message_data.source_player_disc_inventory;
        target_player.disc_inventory = message_data.target_player_disc_inventory;
        
        app.update_disc_wedges(source_player_id);
        app.update_disc_wedges(target_player_id);

        app.update_player_inventory();

        //add transfer beam
        if(interaction_type == "take_seeds")
        {
            let elements = [];
            element = {source_change:message_data.target_player_change,
                       target_change:message_data.source_player_change,
                       texture:app.pixi_textures["seed_tex"]}
            elements.push(element);

            app.add_transfer_beam(target_player.current_location, 
                                  source_player.current_location,
                                  elements);
        }
        else if(interaction_type == "send_seeds")
        {
            let elements = [];
            element = {source_change:message_data.source_player_change,
                       target_change:message_data.target_player_change,
                       texture:app.pixi_textures["seed_tex"]}
            elements.push(element);

            app.add_transfer_beam(source_player.current_location, 
                                  target_player.current_location,
                                  elements);
        }
        else if(interaction_type == "take_disc")
        {
            let parameter_set_player = null;
            for(const i in message_data.interaction_discs)
            {
                if(message_data.interaction_discs[i])
                {
                    parameter_set_player = app.get_parameter_set_player_from_player_id(parseInt(i));
                }
            }

            let elements = [];
            element = {source_change:null,
                       target_change:null,
                       tint:parameter_set_player.hex_color,
                       texture:app.pixi_textures["disc_tex"]}
            elements.push(element);

            app.add_transfer_beam(target_player.current_location,
                                  source_player.current_location,
                                  elements,
                                  show_target_emitter=false);
        }
        else if(interaction_type == "send_disc")
        {
            let parameter_set_player = null;
            for(const i in message_data.interaction_discs)
            {
                if(message_data.interaction_discs[i])
                {
                    parameter_set_player = app.get_parameter_set_player_from_player_id(parseInt(i));
                }
            }

            let elements = [];
            element = {source_change:null,
                       target_change:null,
                       tint:parameter_set_player.hex_color,
                       texture:app.pixi_textures["disc_tex"]}
            elements.push(element);

            app.add_transfer_beam(source_player.current_location,
                                  target_player.current_location,
                                  elements,
                                  show_source_emitter=false);
        }

        if(app.pixi_mode=="subject")
        {
            if(source_player_id == app.session_player.id)
            {
                app.working = false;
                app.interaction_modal.hide();
                app.interaction_start_modal.hide();
                app.setup_disc_inventory();
                app.setup_seed_inventory();
            }

            if(target_player_id == app.session_player.id)
            {
                app.setup_disc_inventory();
                app.setup_seed_inventory();
            }
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.interaction_error = message_data.error_message;
            app.working = false;
        }
    }
},

/** hide choice grid modal modal
*/
hide_interaction_modal: function hide_interaction_modal(){
    app.interaction_error = null;
    app.working = false;
    app.interaction_modal_open = false;
},

/**
 * hide interaction start modal
 */
hide_interaction_start_modal: function hide_interaction_start_modal(){
    app.interaction_error = null;
    app.interaction_start_modal_open = false;
    app.working = false;
},

/**
 * cancel interaction in progress
 */
cancel_interaction:function cancel_interaction()
{
    session_player = app.session.world_state.session_players[app.session_player.id];

    if(session_player.interaction == 0)
    {        
        app.interaction_modal.hide();
        return;
    }

    app.working = true;
    app.send_message("cancel_interaction", 
                    {"interaction_type": app.selected_player.interaction_type,},
                     "group"); 
},

take_cancel_interaction: function take_cancel_interaction(message_data)
{
    let source_player_id = message_data.source_player_id;
    let target_player_id = message_data.target_player_id;

    let source_player = app.session.world_state.session_players[source_player_id];
    let target_player = app.session.world_state.session_players[target_player_id];

    if(message_data.value == "success")
    {
        source_player.tractor_beam_target = null;

        source_player.frozen = false
        target_player.frozen = false

        source_player.interaction = 0;
        target_player.interaction = 0;

        source_player.cool_down = app.session.parameter_set.cool_down_length;

        if(app.is_subject)
        {
            if(source_player_id == app.session_player.id)
            {
                app.working = false;
                app.interaction_modal.hide();
            }
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.interaction_error = message_data.error_message[0].message;
            app.working = false;
        }
    }
    
}, 

/**
 * send movement update to server
 */
target_location_update: function target_location_update()
{
    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        if(app.session_player.current_instruction == app.instructions.action_page_move)
        {
            app.session_player.current_instruction_complete=app.instructions.action_page_move;
        }

        return;
    }


    let session_player = app.session.world_state.session_players[app.session_player.id];

    app.send_message("target_location_update", 
                    {"target_location" : session_player.target_location, 
                     "current_location" : session_player.current_location},
                     "group");                   
},


/**
 * update tractor beam between two players
 */
setup_tractor_beam: function setup_tractor_beam(source_id, target_id)
{
    let source_player = app.session.world_state.session_players[source_id];
    let target_player = app.session.world_state.session_players[target_id];

    let dY = source_player.current_location.y - target_player.current_location.y;
    let dX = source_player.current_location.x - target_player.current_location.x;

    let myX = source_player.current_location.x;
    let myY = source_player.current_location.y;
    let targetX = target_player.current_location.x;
    let targetY = target_player.current_location.y;
    
    let tempAngle = Math.atan2(dY, dX);
    let tempSlope = (myY - targetY) / (myX - targetX);

    if (myX - targetX == 0) tempSlope = 0.999999999999;

    let tempYIntercept = myY - tempSlope * myX;

    // Rectangle rectTractor;
    let tractorCircles = pixi_avatars[source_id].tractor_beam.length;
    let tempScale = 1 / tractorCircles;

    let xIncrement = Math.sqrt(Math.pow(myX - targetX, 2) + Math.pow(myY - targetY, 2)) / tractorCircles;

    for (let i=0; i<tractorCircles; i++)
    {
        let temp_x = (myX - Math.cos(tempAngle) * xIncrement * i);
        let temp_y = (myY - Math.sin(tempAngle) * xIncrement * i);

        tb_sprite = pixi_avatars[source_id].tractor_beam[i];
        tb_sprite.position.set(temp_x, temp_y)
        tb_sprite.scale.set(tempScale * i);
        tb_sprite.visible = true;
        
        if (app.pixi_tick_tock.value == 'tick')
        {
            if (i%2 == 0)
            {
                tb_sprite.tint = app.get_parameter_set_player_from_player_id(source_id).hex_color;
            }
            else
            {
                tb_sprite.tint = 0xFFFFFF;
            }
        }
        else
        {
            if (i%2 == 0)
            {
               tb_sprite.tint = 0xFFFFFF;
            }
            else
            {
                tb_sprite.tint = app.get_parameter_set_player_from_player_id(source_id).hex_color;
            }
        }

    }
},

/**
 * move players if target does not equal current location
 */
move_player: function move_player(delta)
{
    if(!app.session.world_state.started) return;

    //move players
    for(let i in app.session.world_state.session_players){

        let obj = app.session.world_state.session_players[i];

        let avatar_container = pixi_avatars[i].avatar_container;
        let gear_sprite = pixi_avatars[i].gear_sprite;
        let status_label = pixi_avatars[i].status_label;

        if((obj.target_location.x !=  obj.current_location.x ||
            obj.target_location.y !=  obj.current_location.y) && 
            !obj.frozen)
        {           
            //move player towards target

            app.move_avatar(delta,i);

            //update the sprite locations
            gear_sprite.play();
            avatar_container.position.set(obj.current_location.x, obj.current_location.y);
            if (obj.current_location.x < obj.target_location.x )
            {
                gear_sprite.animationSpeed =  app.session.parameter_set.avatar_animation_speed;
            }
            else
            {
                gear_sprite.animationSpeed = -app.session.parameter_set.avatar_animation_speed;
            }

            //hide chat if longer than 10 seconds and moving
            if(obj.chat_time)
            {
                if(Date.now() - obj.chat_time >= 10000)
                {
                    obj.show_chat = false;
                }
            }
        }
        else
        {
            gear_sprite.stop();
        }

        //update status
        if(obj.interaction > 0)
        {
            if(obj.state=="building_seeds")
            {
                status_label.text = "Growing Seeds ... " + obj.interaction;
            }
            else if(obj.state=="claiming_field")
            {
                status_label.text = "Claiming Field ... " + obj.interaction;
            }
            else if(obj.state=="building_disc")
            {
                status_label.text = "Building Disc ... " + obj.interaction;
            }
            else
            {
                status_label.text = "Interaction ... " + obj.interaction;
            }

            status_label.visible = true;
        }
        else if(obj.cool_down > 0)
        {
            status_label.text = "Cooling ... " + obj.cool_down;
            status_label.visible = true;
        }
        else
        {
            status_label.visible = false;
        }

    }

    //find nearest players
    for(let i in app.session.world_state.session_players)
    {
        let obj1 = app.session.world_state.session_players[i];
        obj1.nearest_player = null;
        obj1.nearest_player_distance = null;

        for(let j in app.session.world_state.session_players)
        {
            let obj2 = app.session.world_state.session_players[j];

            if(i != j)
            {
                temp_distance = app.get_distance(obj1.current_location, obj2.current_location);

                if(!obj1.nearest_player)
                {
                    obj1.nearest_player = j;
                    obj1.nearest_player_distance = temp_distance;
                }
                else
                {
                   if(temp_distance < obj1.nearest_player_distance)
                   {
                        obj1.nearest_player = j;
                        obj1.nearest_player_distance = temp_distance;
                   }
                }
            }
        }
    }

    //update chat boxes
    for(let i in app.session.world_state.session_players)
    {
        let obj = app.session.world_state.session_players[i];
        let chat_container = pixi_avatars[i].chat.container;
        let chat_bubble_sprite = pixi_avatars[i].chat.bubble_sprite;
        // let avatar_container = obj.pixi.chat_container;
        let offset = {x:chat_container.width*.5, y:chat_container.height*.45};

        if(obj.nearest_player && 
           app.session.world_state.session_players[obj.nearest_player].current_location.x < obj.current_location.x)
        {
            chat_container.position.set(obj.current_location.x + offset.x,
                                        obj.current_location.y - offset.y);
            
            chat_bubble_sprite.scale.x = 1;
        }
        else
        {
            chat_container.position.set(obj.current_location.x - offset.x,
                                        obj.current_location.y - offset.y);

            chat_bubble_sprite.scale.x = -1;
        }

        chat_container.visible = obj.show_chat;
    }   

    //update tractor beams and status
    for(let i in app.session.world_state.session_players)
    {
        let player = app.session.world_state.session_players[i];

        if(player.tractor_beam_target)
        {
            app.setup_tractor_beam(i, player.tractor_beam_target);
        }
        else
        {
            for (let j=0; j< pixi_avatars[i].tractor_beam.length; j++)
            {
                tb_sprite = pixi_avatars[i].tractor_beam[j];
                tb_sprite.visible = false;
            }
        }
    }

    for(let i in app.session.world_state.session_players)
    {
        let obj = app.session.world_state.session_players[i];

        //update interaction ranges
        let interaction_container = pixi_avatars[i].interaction_container;
        interaction_container.position.set(obj.current_location.x, obj.current_location.y);

        //update view ranges on staff screen
        if(app.pixi_mode != "subject")
        {
            let view_container = pixi_avatars[i].view_container;
            view_container.position.set(obj.current_location.x, obj.current_location.y);
        }
    }
    
},

/**
 * update disc wedges
 */
update_disc_wedges: function update_disc_wedges(player_id)
{
    if(app.session.parameter_set.enable_discs=="False") return;
    
    let disc_wedges = pixi_avatars[player_id].disc_wedges;
    let session_player = app.session.world_state.session_players[player_id];

    disc_wedges.clear();

    let disc_wedge_radius = pixi_avatars[player_id].gear_sprite.width/2-80;
    disc_wedges.circle(0, 0, disc_wedge_radius);
    disc_wedges.fill({color:'white', 
                      alpha:0.5});
   
    let disc_producer_count = 0;
    for(const j in app.session.parameter_set.parameter_set_players)
    {
        if(app.session.parameter_set.parameter_set_players[j].enable_disc_production)
        {
            disc_producer_count++;
        }
    }

    let start_angle = -90;
    let wedge_size = 360/disc_producer_count;
    disc_wedges.moveTo(0, 0);

    for(const j in app.session.world_state.session_players)
    {
        let parameter_set_player = app.get_parameter_set_player_from_player_id(j);

        if(parameter_set_player.enable_disc_production)
        {
            let alpha = 0;

            if(session_player.disc_inventory[j])
            {
                alpha = 1;
            }

            let temp_point =  app.get_point_on_circle(0, 0, disc_wedge_radius, app.degrees_to_radians(start_angle));
            disc_wedges.lineTo(temp_point.x, temp_point.y);

            disc_wedges.arc(0, 0, disc_wedge_radius, app.degrees_to_radians(start_angle), app.degrees_to_radians(start_angle + wedge_size));
            disc_wedges.lineTo(0, 0);

            disc_wedges.fill({color:parameter_set_player.hex_color, 
                            alpha:alpha});
            
            disc_wedges.stroke({color:"dimgray", width:2});

            start_angle += wedge_size;
        }

        // disc_wedges.endFill();
    }
},

/**
 * send for interaction help doc
 */
send_interaction_help: function send_interaction_help()
{
    let help_doc_name = ""

    if(app.selected_player.interaction_type == "send_seeds")
    {
        help_doc_name = "subject_send_seeds";
    }
    else if(app.selected_player.interaction_type == "take_seeds")
    {
        help_doc_name = "subject_take_seeds";
    }
    else if(app.selected_player.interaction_type == "send_disc")
    {
        help_doc_name = "subject_send_disc";
    }
    else if(app.selected_player.interaction_type == "take_disc")
    {
        help_doc_name = "subject_take_disc";
    }

    app.send_load_help_doc_subject(help_doc_name);
},

/**
 * take update from client for new location target
 */
take_target_location_update: function take_target_location_update(message_data)
{
    if(message_data.value == "success")
    {
        app.session.world_state.session_players[message_data.session_player_id].target_location = message_data.target_location;          
    } 
    else
    {
        
    }
},
