
/**
 * Given the page number return the requested instruction text
 * @param pageNumber : int
 */
get_instruction_page: function get_instruction_page(pageNumber){

    for(let i=0;i<app.instructions.instruction_pages.length;i++)
    {
        if(app.instructions.instruction_pages[i].page_number==pageNumber)
        {
            return app.instructions.instruction_pages[i].text_html;
        }
    }

    return "Text not found";
},

/**
 * advance to next instruction page
 */
send_next_instruction: function send_next_instruction(direction){

    if(app.working) return;
    
    app.working = true;
    app.send_message("next_instruction", {"direction" : direction});
},

/**
 * advance to next instruction page
 */
take_next_instruction: function take_next_instruction(message_data){
    if(message_data.value == "success")
    {
        result = message_data.result;       
        
        app.session_player.current_instruction = result.current_instruction;
        app.session_player.current_instruction_complete = result.current_instruction_complete;

        app.process_instruction_page();
        app.instruction_display_scroll();

        app.working = false;
    } 
    else
    {
        
    }
    
},

/**
 * finish instructions
 */
send_finish_instructions: function send_finish_instructions(){

    if(app.working) return;
    
    app.working = true;
    app.send_message("finish_instructions", {});
},

/**
 * finish instructions
 */
take_finish_instructions: function take_finish_instructions(message_data){
    if(message_data.value == "success")
    {
        result = message_data.result;       
        
        app.session_player.instructions_finished = result.instructions_finished;
        app.session_player.current_instruction_complete = result.current_instruction_complete;
    } 
    else
    {
        
    }
},

/**
 * send_current_instruction_complete
 */
send_current_instruction_complete: function current_instruction_complete()
{
    app.send_message("current_instruction_complete", {"page_number" : app.session_player.current_instruction_complete});
},

/**
 * process instruction page
 */
process_instruction_page: function process_instruction_page(){

     //update view when instructions changes
     switch(app.session_player.current_instruction){
        case app.instructions.action_page_move:      
           
            return;      
            break; 
        case app.instructions.action_page_disc:

            return;
            break;
        case app.instructions.action_page_seed:
            
            return;
            break;        
        case app.instructions.action_page_field:
                
            return;
            break;        
        case app.instructions.action_page_interaction:
            let session_player = app.session.world_state.session_players[app.session_player.id];
            session_player.seeds = 10;
            session_player.disc_inventory[app.session_player.id] = true;
            app.setup_seed_inventory();
            app.update_player_inventory();
            return;
            break;
        case app.instructions.action_page_chat:
                    
            return;
            break;
    }

    if(app.session_player.current_instruction_complete < app.session_player.current_instruction)
    {
        app.session_player.current_instruction_complete = app.session_player.current_instruction;
    }

        
},

/**
 * scroll instruction into view
 */
instruction_display_scroll: function instruction_display_scroll(){
    
    if(document.getElementById("instructions_frame"))
        document.getElementById("instructions_frame").scrollIntoView();
    
    Vue.nextTick(() => {
        app.scroll_update();
    });
},

scroll_update: function scroll_update()
{
    let scroll_top = document.getElementById('instructions_frame_a').scrollTop;
    let scroll_height = document.getElementById('instructions_frame_a').scrollHeight; // added
    let offset_height = document.getElementById('instructions_frame_a').offsetHeight;

    let content_height = scroll_height - offset_height; // added
    if (content_height <= scroll_top) // modified
    {
        // Now this is called when scroll end!
        app.instruction_pages_show_scroll = false;
    }
    else
    {
        app.instruction_pages_show_scroll = true;
    }
},

send_chat_instructions: function send_chat_instructions()
{

    if(app.session_player.current_instruction != app.instructions.action_page_chat) return;

    // {
    //     "value": "success",
    //     "text": "asdfasdf",
    //     "text_limited": "BSDtBSDt",
    //     "sender_id": 273,
    //     "nearby_players": [
    //         "274"
    //     ]
    // }

    let message_data = {
        "status": "success",
        "text": app.chat_text.trim(),
        "text_limited": app.chat_text.trim(),
        "sender_id": app.session_player.id,       
        "nearby_players": [],
    };

    app.take_update_chat(message_data);

    app.session_player.current_instruction_complete = app.instructions.action_page_chat;
    app.send_current_instruction_complete();
},

/**
 * simulate build disc
 */
simulate_build_disc: function simulate_build_disc(){

    let session_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set = app.session.parameter_set;

    if(session_player.state=="open")
    {
        //start build disc
        if(app.session_player.current_instruction != app.instructions.action_page_disc) return;
        
        message_data = {
                "status": "success",
                "error_message": [],
                "source_player_id": app.session_player.id,
                "disc_inventory": session_player.disc_inventory,
                "build_time_remaining": session_player.build_time_remaining,
                "state": "building_disc",
                "frozen": true,
                "interaction": parameter_set.disc_build_length,
        };

        app.take_build_disc(message_data);
        setTimeout(app.simulate_build_disc, 1000);
    }
    else if(session_player.interaction>1)
    {
        //decrament interaction time
        session_player.interaction--;
        setTimeout(app.simulate_build_disc, 1000);
    }
    else
    {
        session_player.disc_inventory[app.session_player.id] = true;
        message_data = { 
            "status": "success",
            "error_message": [],
            "source_player_id": app.session_player.id,
            "disc_inventory": session_player.disc_inventory,
            "build_time_remaining": session_player.build_time_remaining - parameter_set.disc_build_length,
            "state": "open",
            "frozen": false,
            "interaction": 0
        }

        app.take_build_disc(message_data);
        app.session_player.current_instruction_complete=app.instructions.action_page_disc;
        app.send_current_instruction_complete();
    }

    
},

/**
 * simulate build seeds
 */
simulate_build_seeds: function simulate_build_seeds(){
    
        let session_player = app.session.world_state.session_players[app.session_player.id];
        let parameter_set = app.session.parameter_set;
    
        if(session_player.state=="open")
        {
            if(app.build_seed_count != 10) 
            {
                app.add_text_emitters("Invalid entry.", 
                                        session_player.current_location.x, 
                                        session_player.current_location.y,
                                        session_player.current_location.x,
                                        session_player.current_location.y-100,
                                        0xFFFFFF,
                                        28,
                                        null);
                return;
            }
            
            if(session_player.seeds > 0)
            {
                app.add_text_emitters("Continue to next page.", 
                                    session_player.current_location.x, 
                                    session_player.current_location.y,
                                    session_player.current_location.x,
                                    session_player.current_location.y-100,
                                        0xFFFFFF,
                                        28,
                                        null);
                
                return;
            }

            //start build seeds
            if(app.session_player.current_instruction != app.instructions.action_page_seed) return;
            
            message_data = {
                "status": "success",
                "error_message": [],
                "source_player_id": app.session_player.id,
                "seeds": 0,
                "build_time_remaining": session_player.build_time_remaining,
                "build_seed_count": app.build_seed_count,
                "state": "building_seeds",
                "frozen": true,
                "interaction": app.build_seed_count * parameter_set.seed_build_length,
            };
    
            app.take_build_seeds(message_data);
            setTimeout(app.simulate_build_seeds, 1000);
        }
        else if(session_player.interaction>1)
        {
            //decrament interaction time
            session_player.interaction--;
            setTimeout(app.simulate_build_seeds, 1000);
        }
        else
        {
            message_data = {
                "status": "success",
                "error_message": [],
                "source_player_id": app.session_player.id,
                "seeds": app.build_seed_count,
                "build_time_remaining": session_player.build_time_remaining - (app.build_seed_count * parameter_set.seed_build_length),
                "build_seed_count": app.build_seed_count,
                "state": "open",
                "frozen": false,
                "interaction": 0,
            };
    
            app.take_build_seeds(message_data);
            app.session_player.current_instruction_complete=app.instructions.action_page_seed;
            app.send_current_instruction_complete();
        }
},

/**
 * simulate build field
 */
simulate_field_claim: function simulate_field_claim(field_id, field){

    let session_player = app.session.world_state.session_players[app.session_player.id];
    let parameter_set = app.session.parameter_set;

    if(session_player.state=="open")
    {
        //start build field
        if(app.session_player.current_instruction != app.instructions.action_page_field) return;
        
        field.status = "building"
        field.owner = app.session_player.id;
        message_data = {
            "status": "success",
            "error_message": [],
            "source_player_id": app.session_player.id,
            "field_id": field_id,
            "field": field,
            "build_time_remaining": session_player.build_time_remaining,
            "state": "claiming_field",
            "frozen": true,
            "interaction": parameter_set.field_build_length,
        }

        app.take_field_claim(message_data);
        setTimeout(app.simulate_field_claim, 1000, field_id, field);
    }
    else if(session_player.interaction>1)
    {
        //decrament interaction time
        session_player.interaction--;
        setTimeout(app.simulate_field_claim, 1000, field_id, field);
    }
    else
    {
       
        field.status = "claimed";
        field.allowed_players = [app.session_player.id];
        message_data = {
            "status": "success",
            "error_message": [],
            "source_player_id": app.session_player.id,
            "field_id": field_id,
            "field": field,
            "build_time_remaining": session_player.build_time_remaining - parameter_set.field_build_length,
            "state": "open",
            "frozen": false,
            "interaction": 0
        }

        app.take_field_claim(message_data);
        app.session_player.current_instruction_complete=app.instructions.action_page_field;
        app.send_current_instruction_complete();
    }
},

/**
 * simulate send present players
 */
simulate_present_players: function simulate_present_players(field_id, present_players){

    if(pixi_setup_complete)
    {
        let session_player = app.session.world_state.session_players[app.session_player.id];
        if(field_id)
        {
            let field = app.session.world_state.fields[field_id];
            let parameter_set_field = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];
            field.present_players = present_players;

            app.destroy_pixi_fields();
            app.setup_pixi_fields();

            if(field.present_players.includes(app.session_player.id.toString()))
            {
                session_player.seed_multiplier = app.session.parameter_set.seed_multipliers.split('\n')[0];
            }
            else
            {
                session_player.seed_multiplier = 1;
            }
        }
        else
        {
            session_player.seed_multiplier = 1;
        }

        app.setup_seed_inventory();
    }

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        setTimeout(app.send_present_players, 1000);
    }
},

/**
 * simulate interaction
 */
simulate_interaction: function simulate_interaction(){
    
    let session_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];
    let parameter_set = app.session.parameter_set;

    if(app.selected_player.interaction_type == "take_seeds" ||
       app.selected_player.interaction_type == "take_disc")
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

    message_data = {
        "source_player_id": app.session_player.id,
        "source_player_change": "",
        "target_player_change": "",
        "status": "success",
        "error_message": [],
        "target_player_id": app.selected_player.selected_player_id,
        "source_player_seeds": session_player.seeds,
        "target_player_seeds": target_player.seeds,
        "source_player_disc_inventory": session_player.disc_inventory,
        "target_player_disc_inventory": target_player.disc_inventory,
        "interaction_type": app.selected_player.interaction_type,
        "interaction_amount": app.selected_player.interaction_amount,
        "interaction_discs":  app.selected_player.interaction_discs,
        "source_player_interaction": 0,
        "target_player_interaction": 0,
        "source_player_frozen": false,
        "target_player_frozen": false,
        "source_player_cool_down": 0,
        "target_player_cool_down": 0
    }

    if(app.selected_player.interaction_type == "send_seeds")
    {
        message_data.source_player_change = "-" + app.selected_player.interaction_amount;
        message_data.target_player_change = "+" + app.selected_player.interaction_amount;
        message_data.source_player_seeds =  message_data.source_player_seeds - app.selected_player.interaction_amount;
        message_data.target_player_seeds =  message_data.target_player_seeds + app.selected_player.interaction_amount;
    }
    else if(app.selected_player.interaction_type == "send_disc")
    {
        message_data.target_player_disc_inventory[app.session_player.id] = true;
    }

    app.take_interaction(message_data);
    app.session_player.current_instruction_complete=app.instructions.action_page_interaction;
    app.send_current_instruction_complete();
},

/**
 * simulate grant field access
 */
simulate_grant_field_access : function simulate_grant_field_access(target_player_id){

    message_data = {
        "status": "success",
        "error_message": [],
        "source_player_id": app.session_player.id,
        "field_id": app.selected_field.field.id,
        "field": app.clone_json(app.selected_field.field),
        "target_player_id": target_player_id
    }

    message_data.field.allowed_players.push(target_player_id);

    app.take_grant_field_access(message_data);
},