/**
 * setup field objects
 */
setup_pixi_fields: function setup_pixi_fields()
{
    for(const i in app.session.world_state.fields)
    {
        pixi_fields[i] = {};

        const field = app.session.world_state.fields[i];
        const parameter_set_field = app.session.parameter_set.parameter_set_fields[i];
        
        let field_container = new PIXI.Container();
        field_container.eventMode = 'passive';
        field_container.zIndex = 0;

        //outline
        let outline = new PIXI.Graphics();
        outline.lineStyle(10, 0x000000);
        // matrix = new PIXI.Matrix(field.scale,0,0,field.scale,0,0);
        // matrix.rotate(field.rotation);
        // outline.beginTextureFill({texture: app.pixi_textures[field.texture], matrix:matrix});
        // outline.tint = field.tint;
        outline.drawRect(0, 0, parameter_set_field.width, parameter_set_field.height);
        outline.eventMode = 'passive';
       
        //outline.endFill();
        field_container.addChild(outline);

        field_container.position.set(parameter_set_field.x - parameter_set_field.width/2,
                                     parameter_set_field.y - parameter_set_field.height/2);

        pixi_fields[i].field_container = field_container;
        pixi_fields[i].rect = {x:parameter_set_field.x, 
                               y:parameter_set_field.y, 
                               width:parameter_set_field.width, 
                               height:parameter_set_field.height};

        pixi_container_main.addChild(pixi_fields[i].field_container);
    }
},

/**
 * destory pixi field objects in world state
 */
destroy_pixi_fields: function destory_setup_pixi_fields()
{
    if(!app.session) return;

    for(const i in app.session.world_state.fields){

        let pixi_objects = pixi_fields[i];

        if(pixi_objects)
        {
            pixi_objects.field_container.destroy();
        }
    }
},

/**
 * send field claim
 */
send_field_claim: function send_field_claim()
{

    let field_id = app.selected_field.field.id;
    let field = app.session.world_state.fields[field_id];

    app.working = true;
        
    app.send_message("field_claim", 
                    {"field_id" : field_id,},
                    "group"); 
},

/**
 * take field_claim
 */
take_field_claim: function take_field_claim(message_data)
{
    var source_player_id = message_data.source_player_id;

    if(message_data.status == "success")
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_modal.hide();
        }
    }
    else
    {
        if(app.is_subject && source_player_id == app.session_player.id)
        {
            app.field_error = message_data.error_message[0].message;
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
 * subject field click
 */
subject_field_click: function subject_field_click(target_field_id)
{

    app.selected_field.field = app.session.world_state.fields[target_field_id];

    app.clear_main_form_errors();

    app.field_modal.show();
    app.working = false;
    app.field_modal_open = true;
    app.field_error = null;
},