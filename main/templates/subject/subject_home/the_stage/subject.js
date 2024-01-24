/**
 * subject screen offset from the origin
 */
get_offset:function get_offset()
{
    let obj = app.session.world_state.session_players[app.session_player.id];

    return {x:obj.current_location.x * app.pixi_scale - pixi_app.screen.width/2,
            y:obj.current_location.y * app.pixi_scale - pixi_app.screen.height/2};
},

/**
 *pointer up on subject screen
 */
 subject_pointer_up: function subject_pointer_up(event)
{
    if(!app.session.world_state.hasOwnProperty('started')) return;
    let local_pos = event.data.getLocalPosition(event.currentTarget);
    let local_player = app.session.world_state.session_players[app.session_player.id];

    if(event.button == 0)
    {

        if(local_player.frozen)
        {
            let frozen_text = "No movement while interacting.";

            if(local_player.state == "building_seeds" || 
               local_player.state == "claiming_field" ||
               local_player.state == "building_disc")
            {
                frozen_text = "No movement while working.";
            }

            app.add_text_emitters(frozen_text, 
                            local_player.current_location.x, 
                            local_player.current_location.y,
                            local_player.current_location.x,
                            local_player.current_location.y-100,
                            0xFFFFFF,
                            28,
                            null);
            return;
        }
        
        local_player.target_location.x = local_pos.x;
        local_player.target_location.y = local_pos.y;

        app.target_location_update();
    }
    else if(event.button == 2)
    {
        if(local_player.frozen)
        {
            let frozen_text = "No actions while interacting.";

            if(local_player.state == "building_seeds" || 
               local_player.state == "claiming_field" ||
               local_player.state == "building_disc")
            {
                frozen_text = "No actions while working.";
            }

            app.add_text_emitters(frozen_text, 
                            local_player.current_location.x, 
                            local_player.current_location.y,
                            local_player.current_location.x,
                            local_player.current_location.y-100,
                            0xFFFFFF,
                            28,
                            null);
            return;
        }

        // if(local_player.cool_down > 0)
        // {
        //     app.add_text_emitters("No actions cooling down.", 
        //                     local_player.current_location.x, 
        //                     local_player.current_location.y,
        //                     local_player.current_location.x,
        //                     local_player.current_location.y-100,
        //                     0xFFFFFF,
        //                     28,
        //                     null);
        //     return;
        // }
        
        //avatars
        for(i in app.session.world_state.session_players)
        {
            let obj = app.session.world_state.session_players[i];

            if(app.get_distance(obj.current_location, local_pos) < 100 &&
               app.get_distance(obj.current_location, local_player.current_location) <= app.session.parameter_set.interaction_range+125)
            {

                if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
                    app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
                {
                    app.add_text_emitters("No interactions while on break.", 
                                            obj.current_location.x, 
                                            obj.current_location.y,
                                            obj.current_location.x,
                                            obj.current_location.y-100,
                                            0xFFFFFF,
                                            28,
                                            null);
                    return;
                }

                app.subject_avatar_click(i);              
                return;
            }
        }

        //fields
        for(i in app.session.world_state.fields)
        {
            let obj = app.session.parameter_set.parameter_set_fields[i];
            let rect={x:obj.x-obj.width/2, y:obj.y-obj.height/2, width:obj.width, height:obj.height};
            let pt={x:local_pos.x, y:local_pos.y};

            
            if(app.check_point_in_rectagle(pt, rect))
            {
                if(app.session.world_state.time_remaining > app.session.parameter_set.period_length &&
                    app.session.world_state.current_period % app.session.parameter_set.break_frequency == 0)
                {
                    app.add_text_emitters("No claims while on break.", 
                                            local_pos.x, 
                                            local_pos.y,
                                            local_pos.x,
                                            local_pos.y-100,
                                            0xFFFFFF,
                                            28,
                                            null);
                    return;
                }

                //check subject close enough for interaction
                if(app.check_for_circle_rect_intersection({x:local_player.current_location.x, 
                                                           y:local_player.current_location.y, 
                                                           radius:app.session.parameter_set.interaction_range},
                                                      rect))
                {
                    app.subject_field_click(i);              
                    return;
                }
            }

        }
    }
},

/**
 * update the amount of shift needed to center the player
 */
update_offsets_player: function update_offsets_player(delta)
{
    offset = app.get_offset();

    pixi_container_main.x = -offset.x;
    pixi_container_main.y = -offset.y;   
    
    obj = app.session.world_state.session_players[app.session_player.id];

    pixi_target.x = obj.target_location.x;
    pixi_target.y = obj.target_location.y;
},

/**
 * take rescue subject
 */
take_rescue_subject: function take_rescue_subject(message_data)
{
    let session_player = app.session.world_state.session_players[message_data.player_id];

    session_player.current_location = message_data.new_location; 
    session_player.target_location.x = message_data.new_location.x+1;
    session_player.target_location.y = message_data.new_location.y+1;

    if(message_data.player_id==app.session_player.id)
    {
       app.working = false;
    }
},

