{%if session.parameter_set.test_mode%}

do_test_mode: function do_test_mode(){
    {%if DEBUG or session.parameter_set.test_mode%}
    console.log("Do Test Mode");
    {%endif%}

    if(app.end_game_modal_visible && app.test_mode)
    {
        if(app.session_player.name == "")
        {
            Vue.nextTick(() => {
                app.session_player.name = app.random_string(5, 20);
                app.session_player.student_id =  app.random_number(1000, 10000);

                app.send_name();
            })
        }

        return;
    }

    if(app.session.started &&
       app.test_mode
       )
    {
        
        switch (app.session.world_state.current_experiment_phase)
        {
            case "Instructions":
                app.do_test_mode_instructions();
                break;
            case "Run":
                app.do_test_mode_run();
                break;
            
        }        
       
    }

    setTimeout(app.do_test_mode, app.random_number(1000 , 1500));
},

/**
 * test during instruction phase
 */
do_test_mode_instructions: function do_test_mode_instructions()
 {
    if(app.session_player.instructions_finished) return;
    if(app.working) return;
    
   
    if( app.session_player.current_instruction_complete >= app.session_player.current_instruction)
    {

        if(app.session_player.current_instruction == app.instructions.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }
    else
    {
        let session_player = app.session.world_state.session_players[app.session_player.id];
        //take action if needed to complete page
        switch(app.session_player.current_instruction){
            case app.instructions.action_page_move:      
                session_player.target_location = {x:session_player.current_location.x + app.random_number(-100, 100),
                                                    y:session_player.current_location.y + app.random_number(-100, 100)};    
                app.target_location_update();
                return;      
                break; 
            case app.instructions.action_page_disc:
                if(session_player.state == "open")
                {
                    document.getElementById("id_send_build_disc").click();
                }
                return;
                break;
            case app.instructions.action_page_seed:
                if(session_player.state == "open")
                {
                    app.build_seed_count = 10;
                    document.getElementById("id_send_build_seeds").click();
                }    

                return;
                break;        
            case app.instructions.action_page_field:
                if(session_player.state == "open")
                {
                    if(!app.field_modal_open)
                    {   
                        let field = null;
                        //check if player has a field
                        for(let i in app.session.world_state.fields)
                        {
                            let temp_field = app.session.world_state.fields[i];
                            app.subject_field_click(temp_field.id);
                            break;
                        }                    
                    }
                    else 
                    {                    
                        document.getElementById("id_claim_field_button").click();
                    }    
                }
                return;
                break;        
            case app.instructions.action_page_interaction:
                if(app.interaction_modal_open)
                {
                    app.selected_player.interaction_amount = 1;
                    document.getElementById("id_submit_interaction_button").click();
                }
                else if(!app.interaction_start_modal_open)
                {
                    for(let i in app.session.world_state.session_players)
                    {
                        let temp_player = app.session.world_state.session_players[i];
                       
                        if(temp_player.id == app.session_player.id) continue;

                        app.subject_avatar_click(temp_player.id);
                    }
                }
                else if(app.interaction_start_modal_open)
                {
                    document.getElementById("id_start_send_seeds_button").click();
                }
                return;
                break;
            case app.instructions.action_page_chat:
                app.do_test_mode_chat();        
                return;
                break;
        }   
    }

    
 },

/**
 * test during run phase
 */
do_test_mode_run: function do_test_mode_run()
{
    //do chat
    
    if(app.session.world_state.finished) return;

    if(app.test_mode_info.task == null)
    {
        app.find_test_mode_task();
        return;
    }
    else
    {
        switch (app.test_mode_info.task){
            case "chat":
                app.do_test_mode_chat();
                break;            
            case "field_claim":                
                app.test_mode_claim_field();
                break;
            case "field_manage":
                app.test_mode_manage_field();
                break;
            case "go_to_field":
                app.test_mode_go_to_field();
                break;
            case "grow_seeds":
                app.test_mode_grow_seeds();
                break;
            case "build_disk":
                app.test_mode_build_discs();
                break;
            case "go_to_player":
                app.test_mode_go_to_player();
                break;
            case "choose_interaction":
                app.test_mode_choose_interaction();
                break;
            case "send_seeds":
                app.test_mode_send_seeds();
                break;
            case "take_seeds":
                app.test_mode_take_seeds();
                break;
            case "send_discs":
                app.test_mode_send_discs();
                break;
            case "take_discs":
                app.test_mode_take_discs();
                break;

        }
    }
        
},

find_test_mode_task: function find_test_mode_task()
{
    let v = app.random_number(1, 7);

    switch (v){
        case 1:
            app.test_mode_info.task = "chat";
            break;        
        case 2:                
            app.test_mode_info.task = "field_claim";
            break;
        case 3:
            app.test_mode_info.task = "field_manage";
            break;
        case 4:
            app.test_mode_info.task = "go_to_field";
            break;
        case 5:
            app.test_mode_info.task = "grow_seeds";
            break;
        case 6:
            app.test_mode_info.task = "build_disk";
            break;
        case 7:
            app.test_mode_info.task = "go_to_player";
            break;
    }
},

/**
 * test mode chat
 */
do_test_mode_chat: function do_test_mode_chat(){

    if(app.chat_text != "")
    {
        document.getElementById("send_chat_id").click();
        app.test_mode_reset_info();
    }
    else
    {
        app.chat_text = app.random_string(5, 20);
    }

    
},

/**
 * test mode claim field
 */
test_mode_claim_field: function test_mode_claim_field(){

    if(app.session.world_state.time_remaining>app.session.parameter_set.period_length)
    {
        app.test_mode_reset_info();
        return;
    }

    let local_player = app.session.world_state.session_players[app.session_player.id];

    //check if player has enough production time
    if(local_player.state == "open")
    {
        if(local_player.build_time_remaining < app.session.parameter_set.field_build_length)
        {
            app.test_mode_reset_info();
            return;
        }
    }

    //check if player has a field
    for(let i in app.session.world_state.fields)
    {
        let field = app.session.world_state.fields[i];

        if(field.owner == app.session_player.id && field.status == "claimed")
        {
            app.test_mode_reset_info();
            return;
        }
    }

    if(app.test_mode_info.target == null)
    {
        //find a field to claim
        for(let i in app.session.world_state.fields)
        {
            let field = app.session.world_state.fields[i];

            if(field.owner == null)
            {
                let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];

                app.test_mode_info.target_location = {x:field_ps.x, y:field_ps.y};
                app.test_mode_info.target = field;
                return;
            }
        }
    }

     //check if target found
     if(app.test_mode_info.target == null)
     {            
         app.test_mode_reset_info();
         return;
     }

    //check if field has been claimed
    if(app.test_mode_info.target.owner != null ||
       app.field_error != null)
    {
        app.test_mode_reset_info();
        app.field_modal.hide()
        return;
    }

    let field  = app.test_mode_info.target;

    let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];
    let field_rect={x:field_ps.x-field_ps.width/2, y:field_ps.y-field_ps.height/2, width:field_ps.width, height:field_ps.height};

    //check if field claim modal is open
    if(app.field_modal_open)
    {
        document.getElementById("id_claim_field_button").click();
        app.test_mode_reset_info();
        return;
    }
    
    //check if avatar within range of field
    if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                               y:local_player.current_location.y, 
                                               radius:app.session.parameter_set.interaction_range},
                                               field_rect))
    {
        app.subject_field_click(field.id);              
        return;
    }

    //move to field
    app.test_mode_move();    
},

/**
 * test mode manage field
 */
test_mode_manage_field: function test_mode_manage_field(){
    let local_player = app.session.world_state.session_players[app.session_player.id];
    const parameter_set_period = app.get_current_parameter_set_period();

    if(parameter_set_period.field_pr == "False")
    {
        app.test_mode_reset_info();
        return;
    }

    let field = null;
    //check if player has a field
    for(let i in app.session.world_state.fields)
    {
        let temp_field = app.session.world_state.fields[i];

        if(temp_field.owner == app.session_player.id)
        {
            field = temp_field;
            break;
        }
    }

    if(field == null)
    {
        app.test_mode_reset_info();
        return;
    }
    else
    {
        let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];

        app.test_mode_info.target_location = {x:field_ps.x, y:field_ps.y};
        app.test_mode_info.target = field; 
    }

    let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];
    let field_rect={x:field_ps.x-field_ps.width/2, y:field_ps.y-field_ps.height/2, width:field_ps.width, height:field_ps.height};

    //check if field manage modal is open
    if(app.field_manage_modal_open)
    {
        let player_list = app.get_manage_field_players_that_could_be_allowed(field.id)

        for(let i in player_list)
        {
            let player = player_list[i];
            app.send_grant_field_access(player.id);
            break;
        }

        app.field_manage_modal.hide();
        app.test_mode_reset_info();
        return;
    }

    //check if avatar within range of field
    if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
        y:local_player.current_location.y, 
        radius:app.session.parameter_set.interaction_range},
        field_rect))
    {
        app.subject_field_click(field.id);              
        return;
    }

    //move to field
    app.test_mode_move(); 

},

/**
 *  go to field that I have access to
 */
test_mode_go_to_field: function test_mode_go_to_field(){
    let field = null;
    let local_player = app.session.world_state.session_players[app.session_player.id];
    //check if player has a field
    for(let i in app.session.world_state.fields)
    {
        let temp_field = app.session.world_state.fields[i];

        if(temp_field.allowed_players.includes(app.session_player.id))
        {
            if(app.random_number(1, 2) == 1) 
            {
                field = temp_field;
                break;
            }
        }
    }

    if(field == null)
    {
        app.test_mode_reset_info();
        return;
    }
    else
    {
        let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];

        app.test_mode_info.target_location = {x:field_ps.x, y:field_ps.y};
        app.test_mode_info.target = field; 
    }

    let field_ps = app.session.parameter_set.parameter_set_fields[field.parameter_set_field];
    let field_rect={x:field_ps.x-field_ps.width/2, y:field_ps.y-field_ps.height/2, width:field_ps.width, height:field_ps.height};

    //check if avatar in field
    if(app.check_point_in_rectagle(local_player.current_location, field_rect))
    {
        app.test_mode_reset_info();
        return;
    }

    app.test_mode_move(); 
},

/**
 * grow seeds
 */
test_mode_grow_seeds: function test_mode_grow_seeds(){

    if(app.session.world_state.time_remaining>app.session.parameter_set.period_length)
    {
        app.test_mode_reset_info();
        return;
    }

    let local_player = app.session.world_state.session_players[app.session_player.id];

     //check if player has enough production time
    if(local_player.state == "open")
    {
         if(local_player.build_time_remaining == 0)
         {
             app.test_mode_reset_info();
             return;
         }
    }

    if(local_player.state != "open")
    {
       return;
    }

    app.build_seed_count = app.random_number(1, 5);

    document.getElementById("id_send_build_seeds").click();
},

/**
 * build discs
 */
test_mode_build_discs: function test_mode_build_discs(){

    if(app.session.world_state.time_remaining>app.session.parameter_set.period_length)
    {
        app.test_mode_reset_info();
        return;
    }

    let local_player = app.session.world_state.session_players[app.session_player.id];

    //check if player has enough production time
    if(local_player.state == "open")
    {
        if(local_player.build_time_remaining < app.session.parameter_set.disc_build_length)
        {
            app.test_mode_reset_info();
            return;
        }
    }

    if(local_player.state != "open")
    {
       return;
    }

    document.getElementById("id_send_build_disc").click();
},

/**
 * go to player
 */
test_mode_go_to_player: function test_mode_go_to_player(){

    if(app.session.world_state.time_remaining>app.session.parameter_set.period_length)
    {
        app.test_mode_reset_info();
        return;
    }

    let local_player = app.session.world_state.session_players[app.session_player.id];

    if(local_player.interaction > 0) return;
    if(local_player.state != "open") return;

    //find a player to go to
    if(app.test_mode_info.target == null)
    {
        let v = app.random_number(0, app.session.session_players_order.length-1);
        let target_player = app.session.world_state.session_players[app.session.session_players_order[v]];

        if(target_player.id == app.session_player.id) return;

        app.test_mode_info.target_location = {x:target_player.current_location.x + app.random_number(-100, 100),
                                              y:target_player.current_location.y + app.random_number(-100, 100)};
        app.test_mode_info.target = target_player;
    }

    //check if near any
    for(let i in app.session.world_state.session_players)
    {
        if(i == app.session_player.id) continue;

        let temp_player = app.session.world_state.session_players[i];
        let temp_circle = {x:local_player.current_location.x, 
                           y:local_player.current_location.y, 
                           radius:app.session.parameter_set.interaction_range}

        if(app.check_point_in_circle(temp_player.current_location, temp_circle))
        {
            app.subject_avatar_click(i);
            app.test_mode_info.task = "choose_interaction";
            return;
        }
    }

    app.test_mode_move();
},

/**
 * test mode choose interaction
 * */
test_mode_choose_interaction: function test_mode_choose_interaction()
{
    if(!app.interaction_start_modal_open)
    {
        app.test_mode_reset_info();
        return;
    }

    if(app.session.world_state.time_remaining>app.session.parameter_set.period_length)
    {
        app.test_mode_reset_info();
        app.interaction_start_modal.hide();
        return;
    }

    let v = app.random_number(1, 4);
    // v=4;
    switch (v){
        case 1:
            document.getElementById("id_start_send_seeds_button").click();
            app.test_mode_info.task = "send_seeds";
            break;
        case 2:
            if(app.get_current_parameter_set_period().seed_pr=='False')
            {
                document.getElementById("id_start_take_seeds_button").click();
                app.test_mode_info.task = "take_seeds";
            }
            break;
        case 3:
            if(app.get_current_parameter_set_period().disc_pr=='False')
            {
                document.getElementById("id_start_send_disc_button").click();
                app.test_mode_info.task = "send_discs";
            }
            else
            {
                document.getElementById("id_send_my_disc_button").click();
                app.test_mode_reset_info();
                app.interaction_start_modal.hide();
            }
            break;
        case 4:
            if(app.get_current_parameter_set_period().disc_pr=='False')
            {
                document.getElementById("id_start_take_disc_button").click();
                app.test_mode_info.task = "take_discs";
            }
            break;
    }
},

/**
 * test mode send seeds
 */
test_mode_send_seeds: function test_mode_send_seeds(){
    let local_player = app.session.world_state.session_players[app.session_player.id];

    //check if player can send seeds
    if(local_player.seeds == 0 ||
       !app.interaction_modal_open ||
       local_player.interaction > 0)
    {
        app.test_mode_reset_info();
        document.getElementById("id_cancel_interaction_button").click();
        return;
    }

    app.selected_player.interaction_amount = app.random_number(1, local_player.seeds);
    document.getElementById("id_submit_interaction_button").click();

    app.test_mode_reset_info();
},

/**
 * test mode take seeds
 */
test_mode_take_seeds: function test_mode_take_seeds(){
    let local_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];

    //check if player can send seeds
    if(target_player.seeds == 0 ||
        !app.interaction_modal_open ||
        local_player.cool_down > 0 ||
        target_player.cool_down > 0)
    {
        app.test_mode_reset_info();
        document.getElementById("id_cancel_interaction_button").click();
        return;
    }

    app.selected_player.interaction_amount = app.random_number(1, target_player.seeds);
    document.getElementById("id_submit_interaction_button").click();

    app.test_mode_reset_info();
},

/**
 * test mode send discs
 */
test_mode_send_discs: function test_mode_send_discs(){

    let local_player = app.session.world_state.session_players[app.session_player.id];

    //check if player can send discs
    if(Object.keys(app.selected_player.interaction_discs).length == 0 ||
       !app.interaction_modal_open ||
       local_player.interaction > 0)
    {
        app.test_mode_reset_info();
        app.interaction_start_modal.hide();
        document.getElementById("id_cancel_interaction_button").click();
        return;
    }

    let first = true;
    for(let i in app.selected_player.interaction_discs)
    {
        if(first)
        {
            app.selected_player.interaction_discs[i] = true;
            first = false;
        }
        else
        {
        if(random_number(1, 2) == 1)
            {
                app.selected_player.interaction_discs[i] = true;
            }
            else
            {
                app.selected_player.interaction_discs[i] = false;
            }
        }
    }

    document.getElementById("id_submit_interaction_button").click();
    app.test_mode_reset_info();
},

/**
 * test mode take discs
 */
test_mode_take_discs: function test_mode_take_discs(){
    let local_player = app.session.world_state.session_players[app.session_player.id];
    let target_player = app.session.world_state.session_players[app.selected_player.selected_player_id];

    //check if player can send seeds
    if(Object.keys(app.selected_player.interaction_discs).length == 0 ||
       !app.interaction_modal_open ||
       local_player.cool_down > 0 ||
       target_player.cool_down > 0 )
    {
        app.test_mode_reset_info();
        app.interaction_start_modal.hide();
        document.getElementById("id_cancel_interaction_button").click();
        return;
    }

    let first = true;
    for(let i in app.selected_player.interaction_discs)
    {
        if(first)
        {
            app.selected_player.interaction_discs[i] = true;
            first = false;
        }
        else
        {
            if(random_number(1, 2) == 1)
            {
                app.selected_player.interaction_discs[i] = true;
            }
            else
            {
                app.selected_player.interaction_discs[i] = false;
            }
        }
    }

    document.getElementById("id_submit_interaction_button").click();
    app.test_mode_reset_info();
},

/**
 * reset test mode info
 */
test_mode_reset_info: function test_mode_reset_info(){
    app.test_mode_info.target = null;
    app.test_mode_info.target_location = null;
    app.test_mode_info.task = null;
},

/**
 * test mode move to a location
 */
test_mode_move: function test_mode_move(){

    if(app.session.world_state.finished) return;

    if(app.test_mode_info.target_location == null) return;

    let obj = app.session.world_state.session_players[app.session_player.id];
   
    if(app.get_distance(app.test_mode_info.target_location,  obj.current_location)<1000)
    {
        //object is close move to it
        obj.target_location = app.test_mode_info.target_location;
    }
    else
    {
        //if far from target location, move to intermediate location
        obj.target_location = app.get_point_from_angle_distance(obj.current_location.x, 
                                                        obj.current_location.y,
                                                        app.test_mode_info.target_location.x,
                                                        app.test_mode_info.target_location.y,
                                                        app.random_number(300,1000))
    }

    app.target_location_update();
},
{%endif%}