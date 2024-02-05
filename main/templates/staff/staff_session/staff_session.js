
{% load static %}

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

{%include "subject/subject_home/the_stage/pixi_globals.js"%}

//vue app
var app = Vue.createApp({
    delimiters: ["[[", "]]"],

    data() {return {chat_socket : "",
                    reconnecting : true,
                    working : false,
                    is_subject : false,
                    first_load_done : false,          //true after software is loaded for the first time
                    help_text : "Loading ...",
                    session_id : {{session.id}},
                    session_key : "{{session.session_key}}",
                    session : null,
                    session_events : null,
                    timer_pulse : null,
                    the_feed : [],

                    staff_edit_name_etc_form_ids: {{staff_edit_name_etc_form_ids|safe}},

                    move_to_next_phase_text : 'Start Next Experiment Phase',

                    chat_list_to_display : [],                  //list of chats to display on screen

                    data_downloading : false,                   //show spinner when data downloading
                    earnings_copied : false,                    //if true show earnings copied   

                    staff_edit_name_etc_form : {name : "", student_id : "", email : "", id : -1},
                    send_message_modal_form : {subject : "", text : ""},

                    email_result : "",                          //result of sending invitation emails
                    email_default_subject : "{{parameters.invitation_subject}}",
                    email_default_text : `{{parameters.invitation_text|safe}}`,

                    email_list_error : "",

                    csv_email_list : "",           //csv email list

                    last_world_state_update : null,

                    //modals
                    edit_subject_modal : null,
                    edit_session_modal : null,
                    send_message_modal : null,
                    upload_email_modal : null,

                    //pixi
                    canvas_width  : null,
                    canvas_height : null,
                    move_speed : 5,
                    animation_speed : 0.5,
                    scroll_speed : 10,
                    pixi_mode : "staff",
                    pixi_scale : 1,
                    pixi_scale_range_control : 1,
                    stage_width : 10000,
                    stage_height : 10000,
                    scroll_direction : {x:0, y:0},
                    current_location : {x:0, y:0},
                    follow_subject : -1,
                    draw_bounding_boxes: false,

                    //replay
                    session_events : null,
                    session_ticks : null,
                    replay_mode : "paused",
                    replay_timeout : null,
                    replay_time_remaining : 0,
                    replay_current_period : 0,
                }},
    methods: {

        /** fire when websocket connects to server
        */
        handle_socket_connected: function handle_socket_connected(){            
            app.send_get_session();
        },

        /** fire trys to connect to server
         * return true if re-connect should be allowed else false
        */
        handle_socket_connection_try: function handle_socket_connection_try(){         
            app.session.world_state.timer_running = false;
            if(app.timer_pulse != null) clearTimeout(app.timer_pulse);   
            return true;
        },

        /** take websocket message from server
        *    @param data {json} incoming data from server, contains message and message type
        */
        take_message: function take_message(data) {

            {%if DEBUG or session.parameter_set.test_mode%}
            console.log(data);
            {%endif%}

            let message_type = data.message.message_type;
            let message_data = data.message.message_data;

            switch(message_type) {                
                case "get_session":
                    app.take_get_session(message_data);
                    break;
                case "update_session":
                    app.take_update_session(message_data);
                    break;
                case "start_experiment":
                    app.take_start_experiment(message_data);
                    break;
                case "update_start_experiment":
                    app.take_update_start_experiment(message_data);
                    break;
                case "next_phase":
                    app.take_next_phase(message_data);
                    break; 
                case "update_next_phase":
                    app.take_update_next_phase(message_data);
                    break; 
                case "update_reset_experiment":
                    app.take_reset_experiment(message_data);
                    break;
                case "update_chat":
                    app.take_update_chat(message_data);
                    break;
                case "update_time":
                    app.take_update_time(message_data);
                    break;
                case "start_timer":
                    app.take_start_timer(message_data);
                    break;   
                case "stop_timer_pulse":
                    app.take_stop_timer_pulse(message_data);
                case "update_connection_status":
                    app.take_update_connection_status(message_data);
                    break;   
                case "reset_connections":
                    app.take_reset_connections(message_data);
                    break; 
                case "update_reset_connections":
                    app.take_update_reset_connections(message_data);
                    break; 
                case "update_name":
                    app.take_update_name(message_data);
                    break;         
                case "download_summary_data":
                    app.take_download_summary_data(message_data);
                    break;
                case "download_action_data":
                    app.take_download_action_data(message_data);
                    break;
                case "download_recruiter_data":
                    app.take_download_recruiter_data(message_data);
                    break;
                case "download_payment_data":
                    app.take_download_payment_data(message_data);
                    break;
                case "update_next_instruction":
                    app.take_next_instruction(message_data);
                    break;
                case "update_finish_instructions":
                    app.take_finished_instructions(message_data);
                    break;
                case "help_doc":
                    app.take_load_help_doc(message_data);
                    break;
                case "end_early":
                    app.take_end_early(message_data);
                    break;
                case "update_subject":
                    app.take_update_subject(message_data);
                    break;
                case "send_invitations":
                    app.take_send_invitations(message_data);
                    break;
                case "email_list":
                    app.take_update_email_list(message_data);
                    break;
                case "update_anonymize_data":
                    app.take_anonymize_data(message_data);
                    break;
                case "update_survey_complete":
                    app.take_update_survey_complete(message_data);
                    break;
                case "update_refresh_screens":
                    app.take_refresh_screens(message_data);
                    break;
                case "update_target_location_update":
                    app.take_target_location_update(message_data);
                    break;
                case "update_collect_token":
                    app.take_update_collect_token(message_data);
                    break;
                case "update_tractor_beam":
                    app.take_tractor_beam(message_data);
                    break;
                case "update_interaction":
                    app.take_interaction(message_data);
                    break;
                case "update_cancel_interaction":
                    app.take_cancel_interaction(message_data);
                    break;   
                case "load_session_events":
                    app.take_load_session_events(message_data);
                    break; 
                case "update_rescue_subject":
                    app.take_rescue_subject(message_data);
                    break;
                case "update_field_claim":
                    app.take_field_claim(message_data);
                    break;
                case "update_build_disc":
                    app.take_build_disc(message_data);
                    break;
                case "update_build_seeds":
                    app.take_build_seeds(message_data);
                    break;
                case "update_grant_field_access":
                    app.take_grant_field_access(message_data);
                    break;
            }

            app.first_load_done = true;
            app.working = false;
            app.process_the_feed(message_type, message_data);
        },

        /** send websocket message to server
        *    @param message_type {string} type of message sent to server
        *    @param message_text {json} body of message being sent to server
        */
        send_message: function send_message(message_type, message_text, message_target="self")
        {          
            app.chat_socket.send(JSON.stringify({
                    'message_type': message_type,
                    'message_text': message_text,
                    'message_target': message_target,
                }));
        },

        /**
         * do after session has loaded
         */
        do_first_load: function do_first_load()
        {
            app.edit_subject_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('edit_subject_modal'), {keyboard: false});
            app.edit_session_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('edit_session_modal'), {keyboard: false});;           
            app.send_message_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('send_message_modal'), {keyboard: false});           
            app.upload_email_modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('upload_email_modal'), {keyboard: false});

            document.getElementById('edit_subject_modal').addEventListener('hidden.bs.modal', app.hide_edit_subject);
            document.getElementById('edit_session_modal').addEventListener('hidden.bs.modal', app.hide_edit_session);
            document.getElementById('send_message_modal').addEventListener('hidden.bs.modal', app.hide_send_invitations);
            document.getElementById('upload_email_modal').addEventListener('hidden.bs.modal', app.hide_send_email_list);

            tinyMCE.init({
                target: document.getElementById('id_invitation_subject'),
                height : "400",
                theme: "silver",
                plugins: "directionality,paste,searchreplace,code",
                directionality: "{{ directionality }}",
            });
    
            // Prevent Bootstrap dialog from blocking focusin
            document.addEventListener('focusin', (e) => {
                if (e.target.closest(".tox-tinymce-aux, .moxman-window, .tam-assetmanager-root") !== null) {
                    e.stopImmediatePropagation();
                }
                });
            
            app.setup_pixi();

        },

         /**
         * after reconnection, load again
         */
        do_reload: function do_reload()
        {
            app.setup_pixi_subjects();
            app.setup_pixi_fields();
        },

        /** send winsock request to get session info
        */
        send_get_session: function send_get_session(){
            app.send_message("get_session",{"session_key" : app.session_key});
        },

        /** take create new session
        *    @param message_data {json} session day in json format
        */
        take_get_session: function take_get_session(message_data){
            
            app.destroy_pixi_objects();


            app.session = message_data;

            app.session.world_state =  app.session.world_state;

            if(app.session.started)
            {
                
            }
            else
            {
                
            }

            if(!app.first_load_done)
            {
                Vue.nextTick(() => {
                    app.do_first_load();
                });
            }
            else
            {
                Vue.nextTick(() => {
                    app.do_reload();                    
                });
            }
            
            app.update_phase_button_text();
            let v = {};
            v.timer_running = app.session.world_state.timer_running;
            app.take_start_timer(v); 
        },

        /**update text of move on button based on current state
         */
        update_phase_button_text: function update_phase_button_text(){
            if(app.session.world_state.finished && app.session.world_state.current_experiment_phase == "Done")
            {
                app.move_to_next_phase_text = '** Session complete **';
            }
            else if( app.session.world_state.current_experiment_phase == "Names")
            {
                app.move_to_next_phase_text = 'Complete Session <i class="fas fa-flag-checkered"></i>';
            }
            else if( app.session.world_state.current_experiment_phase == "Run")
            {
                app.move_to_next_phase_text = 'Running ...';
            }
            else if(app.session.started && !app.session.world_state.finished)
            {
                if(app.session.world_state.current_experiment_phase == "Selection" && app.session.parameter_set.show_instructions == "True")
                {
                    app.move_to_next_phase_text = 'Show Instrutions <i class="fas fa-map"></i>';
                }
                else
                {
                    app.move_to_next_phase_text = 'Continue Session <i class="far fa-play-circle"></i>';
                }
            }
        },

        /** take updated data from goods being moved by another player
        *    @param message_data {json} session day in json format
        */
        take_update_chat: function take_update_chat(message_data){
            
            if(message_data.status == "success")
            {
                let text = message_data.text;
                
                app.session.world_state.session_players[message_data.sender_id].show_chat = true;    
                app.session.world_state.session_players[message_data.sender_id].chat_time = Date.now();
                pixi_avatars[message_data.sender_id].chat.bubble_text.text = text;
            }
            else
            {
               
            }
        },

        /**
         * update time and start status
         */
        take_update_time: function take_update_time(message_data){
           
            let status = message_data.value;

            if(status == "fail") return;

            // app.session.started = result.started;
            app.session.world_state.current_period = message_data.current_period;
            app.session.world_state.time_remaining = message_data.time_remaining;
            app.session.world_state.timer_running = message_data.timer_running;
            app.session.world_state.started = message_data.started;
            app.session.world_state.finished = message_data.finished;
           
            // app.session.finished = result.finished;
            app.session.world_state.current_experiment_phase = message_data.current_experiment_phase;

            app.update_phase_button_text();

            app.session.world_state.fields = message_data.fields;  
            app.update_field_multiplier_tables();

            //update player earnings and inventory if period has changed
            if(message_data.period_is_over)
            {
                //update fields
                app.update_fields();
                app.take_update_earnings(message_data.earnings);  
            }

            //update player status
            for(p in message_data.session_player_status)
            {
                session_player = message_data.session_player_status[p];
                session_player_local = app.session.world_state.session_players[p];

                session_player_local.interaction = session_player.interaction;
                session_player_local.frozen = session_player.frozen;
                session_player_local.cool_down = session_player.cool_down;
                session_player_local.state = session_player.state;

                if(message_data.period_is_over)
                {
                    session_player_local.seeds = session_player.seeds;
                    session_player_local.disc_inventory = session_player.disc_inventory;
                    session_player_local.state = session_player.state;
                    session_player_local.build_time_remaining = session_player.build_time_remaining;

                    app.update_disc_wedges(p);
                }
               
                session_player_local.seed_multiplier = session_player.seed_multiplier;                
                session_player_local.tractor_beam_target = session_player.tractor_beam_target;

                // pixi_avatars[p].inventory_label.text = session_player_local.seeds;
            }

            app.update_player_inventory();     

            //update player location
            for(p in message_data.current_locations)
            {
                let server_location = message_data.current_locations[p];
                let server_target_location = message_data.target_locations[p];

                if(message_data.period_is_over)
                {
                        //reset locations
                        app.session.world_state.session_players[p].current_location = server_location;
                        app.session.world_state.session_players[p].target_location = server_target_location;
                }
                else if(app.get_distance(server_location, app.session.world_state.session_players[p].current_location) > 1000)
                {
                    app.session.world_state.session_players[p].current_location = server_location;
                }
            }

            //update barriers
            app.update_barriers();
        },
       
        //do nothing on when enter pressed for post
        onSubmit(){
            //do nothing
        },
        
        {%include "staff/staff_session/control/control_card.js"%}
        {%include "staff/staff_session/session/session_card.js"%}
        {%include "staff/staff_session/subjects/subjects_card.js"%}
        {%include "staff/staff_session/summary/summary_card.js"%}
        {%include "staff/staff_session/data/data_card.js"%}
        {%include "staff/staff_session/interface/interface_card.js"%}
        {%include "staff/staff_session/replay/replay_card.js"%}
        {%include "staff/staff_session/the_feed/the_feed_card.js"%}
        {%include "subject/subject_home/the_stage/staff.js"%}
        {%include "subject/subject_home/the_stage/includes.js"%}

        {%include "js/help_doc.js"%}
    
        /** clear form error messages
        */
        clear_main_form_errors: function clear_main_form_errors(){
            
            for(let item in app.session)
            {
                e = document.getElementById("id_errors_" + item);
                if(e) e.remove();
            }

            s = app.staff_edit_name_etc_form_ids;
            for(let i in s)
            {
                e = document.getElementById("id_errors_" + s[i]);
                if(e) e.remove();
            }
        },

        /** display form error messages
        */
        display_errors: function display_errors(errors){
            for(let e in errors)
                {
                    let str='<span id=id_errors_'+ e +' class="text-danger">';
                    
                    for(let i in errors[e])
                    {
                        str +=errors[e][i] + '<br>';
                    }

                    str+='</span>';

                    document.getElementById("div_id_" + e).insertAdjacentHTML('beforeend', str);
                    document.getElementById("div_id_" + e).scrollIntoView(); 
                }
        }, 
    },

    mounted(){

    },

}).mount('#app');

{%include "js/web_sockets.js"%}

  