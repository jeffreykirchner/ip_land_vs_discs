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

update_player_inventory: function update_player_inventory()
{

    let period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

    for(const i in app.session.session_players_order)
    {
        const player_id = app.session.session_players_order[i];
        pixi_avatars[player_id].inventory_label = app.session.world_state.session_players[player_id].seeds;
    }
},

/**
 * take update from server about interactions
 */
// take_interaction: function take_interaction(message_data)
// {
//     if(message_data.value == "fail")
//     {
        
//     }
//     else
//     {
//         let current_period_id = app.session.session_periods_order[app.session.world_state.current_period-1];

//         let source_player_id = message_data.source_player_id;
//         let target_player_id = message_data.target_player_id;

//         let source_player = app.session.world_state.session_players[source_player_id];
//         let target_player = app.session.world_state.session_players[target_player_id];

//         let period = message_data.period;

//         //update status
//         source_player.tractor_beam_target = null;

//         source_player.frozen = false
//         target_player.frozen = false
    
//         source_player.interaction = 0;
//         target_player.interaction = 0;

//         source_player.cool_down = app.session.parameter_set.cool_down_length;
//         target_player.cool_down = app.session.parameter_set.cool_down_length;

//         //update inventory
//         source_player.seeds = message_data.source_player_inventory;
//         target_player.seeds = message_data.target_player_inventory;
        
//         // pixi_avatars[source_player_id].inventory_label.text = source_player.seeds;
//         // pixi_avatars[target_player_id].inventory_label.text = target_player.seeds;

//         app.update_player_inventory();

//         //add transfer beam
//         if(message_data.direction == "give")
//         {
//             app.add_transfer_beam(source_player.current_location, 
//                                  target_player.current_location,
//                                  app.pixi_textures.sprite_sheet_2.textures["cherry_small.png"],
//                                  message_data.source_player_change,
//                                  message_data.target_player_change);
//         }
//         else
//         {
//             app.add_transfer_beam(target_player.current_location, 
//                                   source_player.current_location,
//                                   app.pixi_textures.sprite_sheet_2.textures["cherry_small.png"],
//                                   message_data.target_player_change,
//                                   message_data.source_player_change);
//         }

//     }
// },

take_cancel_interaction: function take_cancel_interaction(message_data)
{
    let source_player_id = message_data.source_player_id;
    let target_player_id = message_data.target_player_id;

    app.session.world_state.session_players[source_player_id].tractor_beam_target = null;

    app.session.world_state.session_players[source_player_id].frozen = false
    app.session.world_state.session_players[target_player_id].frozen = false

    app.session.world_state.session_players[source_player_id].interaction = 0;
    app.session.world_state.session_players[target_player_id].interaction = 0;
}, 

