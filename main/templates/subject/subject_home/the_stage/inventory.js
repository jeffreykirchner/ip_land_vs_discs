/**
 * setup mini map on subject screen 
 * */
setup_inventory: function setup_inventory()
{
    if(pixi_inventory.container) pixi_inventory.container.destroy();

    if(!app.session) return;
    if(!app.session.started) return;
    if(app.pixi_mode!="subject") return;

    pixi_inventory.container = new PIXI.Container();
    pixi_inventory.container.eventMode = 'none';
    pixi_inventory.container.zIndex = 9998;

    //inventory background
    let invetory_bg = new PIXI.Graphics();
    
    invetory_bg.lineStyle(1, 0x000000);
    invetory_bg.beginFill('white');
    invetory_bg.drawRect(0, 0, 100, 100);
    invetory_bg.endFill();
    
    pixi_inventory.container.addChild(invetory_bg);

    //add to stage
    pixi_inventory.container.position.set(app.canvas_width - pixi_inventory.container.width-20, 20);
    pixi_app.stage.addChild(pixi_inventory.container);
},