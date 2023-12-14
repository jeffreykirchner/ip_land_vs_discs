/**show edit parameter set period
 */
show_edit_parameter_set_period: function show_edit_parameter_set_period(index){
    
    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_period = Object.assign({}, app.parameter_set.parameter_set_periods[index]);
    
    app.edit_parameterset_period_modal.toggle();
},

/** update parameterset period
*/
send_update_parameter_set_period: function send_update_parameter_set_period(){
    
    app.working = true;

    app.send_message("update_parameter_set_period", {"session_id" : app.session.id,
                                                    "parameterset_period_id" : app.current_parameter_set_period.id,
                                                    "form_data" : app.current_parameter_set_period});
},

/** remove the selected parameterset period
*/
send_copy_period_down: function send_copy_period_down(period_id){

    app.working = true;
    app.send_message("copy_period_down", {"session_id" : app.session.id,
                                          "period_id" : period_id,});                                         
},