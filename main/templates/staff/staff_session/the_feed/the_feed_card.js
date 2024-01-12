/**
 * process incoming message for the feed
 */
process_the_feed: function process_the_feed(message_type, message_data)
{
    if(message_data.status != "success") return;
    
    html_text = "";
    let sender_label = "";
    let receiver_label = "";
    let field = null;
    let target_player_label=null;

    switch(message_type) {                
        
        case "update_chat":

            sender_label = app.get_parameter_set_player_from_player_id(message_data.sender_id).id_label;
            receiver_label = "";

            for(i in message_data.nearby_players) {
                if(receiver_label != "") receiver_label += ", ";
                receiver_label += "<b>" + app.get_parameter_set_player_from_player_id(message_data.nearby_players[i]).id_label + "</b>";
            }

            html_text = "<b>" + sender_label + "</b> @ " + receiver_label + ": " +  message_data.text;

            if(app.session.parameter_set.chat_mode == "Limited")
            {
                html_text += " (<i>" + message_data.text_limited + "</i>)";
            }

            break;
        case "update_field_claim":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            field = app.session.parameter_set.parameter_set_fields[message_data.field_id];

            if(message_data.field.status == "building")
            {
                html_text = "<b>" + sender_label + "</b> is claiming field <b>" + field.info + "</b>."
            }
            else if(message_data.field.status == "claimed")
            {
                html_text = "<b>" + sender_label + "</b> has claimed field <b>" + field.info + "</b>."
            }
            break;
        case "update_grant_field_access":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            target_player_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;

            field = app.session.parameter_set.parameter_set_fields[message_data.field_id];

            html_text = "<b>" + sender_label + "</b> granted <b>" + target_player_label + "</b> access to field <b>" + field.info + "</b>."
            break;
        case "update_build_disc":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;

            if(message_data.state == "building_disc")
            {
                html_text = "<b>" + sender_label + "</b> is building disc. ";
            }
            else
            {
                html_text = "<b>" + sender_label + "</b> has built disc. ";
            }
            html_text += " <img src='/static/"+  "disc_1.png' width='20'>";
            break;
        case "update_build_seeds":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;

            if(message_data.state == "building_seeds")
            {
                html_text = "<b>" + sender_label + "</b> is growing " + message_data.build_seed_count + " seed(s). ";
            }
            else
            {
                html_text = "<b>" + sender_label + "</b> grew "  + message_data.build_seed_count + " seed(s). ";
            }
            html_text += " <img src='/static/"+  "seed_1.png' height='20'>";
            break;
        case "update_interaction":
            sender_label = app.get_parameter_set_player_from_player_id(message_data.source_player_id).id_label;
            receiver_label = app.get_parameter_set_player_from_player_id(message_data.target_player_id).id_label;

            if(message_data.interaction_type == "send_seeds")
            {
                html_text = "<b>" + sender_label + "</b> sent " + parseInt(message_data.target_player_change) + " seed(s) to <b>" + receiver_label + "</b>. ";
                html_text += " <img src='/static/"+  "seed_1.png' height='20'>";
            }
            else if(message_data.interaction_type == "take_seeds")
            {
                html_text = "<b>" + sender_label + "</b> took " + parseInt(message_data.source_player_change) + " seed(s) from <b>" + receiver_label + "</b>. ";
                html_text += " <img src='/static/"+  "seed_1.png' height='20'>";
            }
            else if(message_data.interaction_type == "send_disc")
            {
               let disc_list = ""; 
               for(i in message_data.interaction_discs)
               {
                    let disc_label = app.get_parameter_set_player_from_player_id(i).id_label;
                    if(disc_list != "")
                    {
                        disc_list += ", ";
                    } 
                    disc_list += "<b>" + disc_label + "</b>";
               }
               html_text = "<b>" + sender_label + "</b> sent " + disc_list + " disc(s) to <b>" + receiver_label + "</b>. ";
               html_text += " <img src='/static/"+  "disc_1.png' width='20'>";
            }
            else if(message_data.interaction_type == "take_disc")
            {
                let disc_list = ""; 
                for(i in message_data.interaction_discs)
                {
                     let disc_label = app.get_parameter_set_player_from_player_id(i).id_label;
                     if(disc_list != "")
                     {
                         disc_list += ", ";
                     } 
                     disc_list += "<b>" + disc_label + "</b>";
                }
                html_text = "<b>" + sender_label + "</b> took " + disc_list + " disc(s) from <b>" + receiver_label + "</b>. ";
                html_text += " <img src='/static/"+  "disc_1.png' width='20'>";
            }

            break;
    }

    if(html_text != "") {
        if(app.the_feed.length > 100) app.the_feed.pop();
        app.the_feed.unshift(html_text);
    }

},