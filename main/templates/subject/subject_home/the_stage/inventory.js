/**
 * setup disc inventory on subject screen
 * */
setup_disc_inventory: function setup_disc_inventory()
{
    if(pixi_inventory.disc_container)
    {
        pixi_app.stage.removeChild(pixi_inventory.disc_container);
        pixi_inventory.disc_container.destroy({children:true, baseTexture:true});
    }

    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;
    if(app.session.parameter_set.enable_discs=='False') return;

    //disc inventory
    pixi_inventory.disc_container = new PIXI.Container();
    pixi_inventory.disc_container.eventMode = 'none';
    pixi_inventory.disc_container.zIndex = 9998;
    pixi_inventory.sortableChildren = true;

    //text
    let text_disc_style = {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 'black',
        align: 'center',
    };

    let text_disc_value_style = {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 'black',
        align: 'center',
    };

    let session_player = app.session.world_state.session_players[app.session_player.id];
    let start_x = 0;
    let z_index = 100;
    let disc_total_value = 0;
    for(i in session_player.disc_inventory)
    {
        let disc_graphic = PIXI.Sprite.from(app.pixi_textures["disc_tex"]);
        let parameter_set_player = app.get_parameter_set_player_from_player_id(i);

        disc_graphic.scale.set(0.5);
        disc_graphic.position.set(start_x, 0);
        disc_graphic.zIndex = z_index;
        if(session_player.disc_inventory[i])
        {
            disc_graphic.tint = parameter_set_player.hex_color;
            disc_total_value += app.session.parameter_set.disc_value;
        }
        disc_graphic.alpha = 0.75;

        disc_label = new PIXI.Text(parameter_set_player.id_label, text_disc_style);
        disc_label.anchor.set(0.5);
        disc_label.position.set(start_x + disc_graphic.width/2, disc_graphic.height + 10);
        disc_label.zIndex = z_index;

        pixi_inventory.disc_container.addChild(disc_graphic);
        pixi_inventory.disc_container.addChild(disc_label);
        
        start_x += disc_graphic.width + 10;
        z_index++;
    }

    let disc_total_value_label = new PIXI.Text("= " + disc_total_value + "¢", text_disc_value_style);
    disc_total_value_label.anchor.set(0.5);
    disc_total_value_label.position.set(start_x + disc_total_value_label.width/2, disc_total_value_label.height/2);
    disc_total_value_label.zIndex = z_index;
    pixi_inventory.disc_container.addChild(disc_total_value_label);

    let disc_value_label = new PIXI.Text("("+ app.session.parameter_set.disc_value + "¢ a disc)", text_disc_style);
    disc_value_label.anchor.set(0.5);
    disc_value_label.position.set(disc_total_value_label.x, disc_total_value_label.height + 10);
    disc_value_label.zIndex = z_index;
    pixi_inventory.disc_container.addChild(disc_value_label);

    //inventory background
    let invetory_bg = new PIXI.Graphics();
    
    invetory_bg.lineStyle(1, 0x000000);
    invetory_bg.beginFill('white');
    invetory_bg.drawRect(-10, -10, pixi_inventory.disc_container.width+20, pixi_inventory.disc_container.height+20);
    invetory_bg.endFill();
    invetory_bg.zIndex = 1;

    pixi_inventory.disc_container.addChildAt(invetory_bg,0);
    
    //add to stage
    pixi_inventory.disc_container.position.set(app.canvas_width - pixi_inventory.disc_container.width-10, 30);
    pixi_app.stage.addChild(pixi_inventory.disc_container);
},

/**
 * setup seed inventory on subject screen
 */
setup_seed_inventory: function setup_seed_inventory()
{
    if(pixi_inventory.seed_container){
        pixi_app.stage.removeChild(pixi_inventory.seed_container);
        pixi_inventory.seed_container.destroy({children:true, baseTexture:true});
    }

    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;
    if(!("seed_tex" in app.pixi_textures)) return;

    //disc inventory
    pixi_inventory.seed_container = new PIXI.Container();
    pixi_inventory.seed_container.eventMode = 'none';
    pixi_inventory.seed_container.zIndex = 9998;
    pixi_inventory.sortableChildren = true;

    //text
    let text_seed_style = {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 'black',
        align: 'center',
    };

    let text_seed_value_style = {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 'black',
        align: 'center',
    };

    let session_player = app.session.world_state.session_players[app.session_player.id];

    let seed_graphic = PIXI.Sprite.from(app.pixi_textures["seed_tex"]);
    let parameter_set_player = app.get_parameter_set_player_from_player_id(app.session_player.id);

    seed_graphic.scale.set(0.5);
    seed_graphic.position.set(0, 0);
    seed_graphic.zIndex = 100;

    pixi_inventory.seed_container.addChild(seed_graphic);

    let seed_multiplier = session_player.seed_multiplier;
    let total_seed_value = session_player.seeds * seed_multiplier;

    let seed_multiplier_s = parseFloat(seed_multiplier).toFixed(1);
    let total_seed_value_s = parseFloat(total_seed_value).toFixed(1);

    let seed_value_label = new PIXI.Text(session_player.seeds + " x " + seed_multiplier_s + " = " + total_seed_value_s + "¢",
                                         text_seed_value_style);

    seed_value_label.position.set(seed_graphic.x + seed_graphic.width + 5, 
                                  seed_graphic.y + seed_graphic.height/2 - seed_value_label.height/2);
    seed_value_label.zIndex = 100;
    pixi_inventory.seed_container.addChild(seed_value_label);

    let seed_value_label_2 = new PIXI.Text("(seeds x multiplier = ¢)", text_seed_style);
    seed_value_label_2.position.set(pixi_inventory.seed_container.width/2 - seed_value_label_2.width/2,
                                    pixi_inventory.seed_container.height);
    seed_value_label_2.zIndex = 100;
    pixi_inventory.seed_container.addChild(seed_value_label_2);

    //inventory background
    let invetory_bg = new PIXI.Graphics();
    
    invetory_bg.lineStyle(1, 0x000000);
    invetory_bg.beginFill('white');
    invetory_bg.drawRect(-10, -10, pixi_inventory.seed_container.width+20, pixi_inventory.seed_container.height+20);
    invetory_bg.endFill();
    invetory_bg.zIndex = 1;

    pixi_inventory.seed_container.addChildAt(invetory_bg,0);
    
    //add to stage
    let y = 30;
    if(app.session.parameter_set.enable_discs=='True')
    {
        y = pixi_inventory.disc_container.y + pixi_inventory.disc_container.height + 5;
    }
    pixi_inventory.seed_container.position.set(app.canvas_width - pixi_inventory.seed_container.width-10, y);
    pixi_app.stage.addChild(pixi_inventory.seed_container);
},