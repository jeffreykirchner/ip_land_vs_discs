/**
 * setup night
 */
setup_pixi_night: function setup_pixi_night()
{
    pixi_night.container = new PIXI.Container();
    pixi_night.container.eventMode = 'none';

    //night background
    let pixi_night_bg = new PIXI.Graphics();
    
    pixi_night_bg.width =  pixi_app.screen.width;
    pixi_night_bg.height =  pixi_app.screen.height;
    pixi_night_bg.lineStyle(1, 0x000000);
    pixi_night_bg.beginFill('black');
    pixi_night_bg.drawRect(0, 0, pixi_app.screen.width, pixi_app.screen.height);
    pixi_night_bg.endFill();

    pixi_night.container.addChild(pixi_night_bg);

    pixi_night.container.alpha = 0.5;
    pixi_app.stage.addChild(pixi_night.container);
},

/**
 * update night overlay
 */
update_pixi_night: function update_pixi_night()
{
    if(!pixi_night.container) return;

    // if(app.session.world_state.time_remaining == 10)
    // {
    //     app.add_notice("The period is about to end", 
    //                    app.session.world_state.current_period, 
    //                    app.session.parameter_set.night_length)
    // }

    //update night overlay
    if (app.session.world_state.time_remaining <= 5)
    {
        pixi_night.container.visible = true;      
    }
    else if(app.session.world_state.time_remaining <= 10)
    {
        let alpha_offset = 10 - app.session.world_state.time_remaining;

        pixi_night.container.alpha = alpha_offset * 0.1;
        pixi_night.container.visible = true;
    }
    else
    {
        pixi_night.container.visible = false;
    }
},