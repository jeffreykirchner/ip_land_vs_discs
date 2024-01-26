{%if session.parameter_set.test_mode%}

do_test_mode: function do_test_mode(){
    {%if DEBUG%}
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
    
   
    if(app.session_player.current_instruction == app.session_player.current_instruction_complete)
    {

        if(app.session_player.current_instruction == app.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }else
    {
        //take action if needed to complete page
        switch (app.session_player.current_instruction)
        {
            case 1:
                break;
            case 2:
                
                break;
            case 3:
                
                break;
            case 4:
                
                break;
            case 5:
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
                    
                break;
            case "build_disk":
                        
                break;
        }
    }
        
},

find_test_mode_task: function find_test_mode_task()
{
    switch (app.random_number(1, 4)){
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

    let local_player = app.session.world_state.session_players[app.session_player.id];

    //check if player has enough production time
    if(local_player.build_time_remaining < app.session.parameter_set.field_build_length)
    {
        app.test_mode_reset_info();
        return;
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

test_mode_manage_field: function test_mode_manage_field(){
    let local_player = app.session.world_state.session_players[app.session_player.id];
    const parameter_set_period = app.get_current_parameter_set_period();

    if(parameter_set_period.field_pr == "False") return

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