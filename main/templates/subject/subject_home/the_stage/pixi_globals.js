let pixi_app = null;
let pixi_container_main = null;              //main container
let pixi_setup_complete = false;             //setup complete flag

let pixi_text_emitter = {};                  //text pop-ups
let pixi_text_emitter_key = 0;

let pixi_transfer_beams = {};                //transfer beams
let pixi_transfer_beams_key = 0;

let pixi_fps_label = null;                     //fps label

let pixi_avatars = {};                         //avatars
let pixi_walls = {};                           //walls
let pixi_barriers = {};                        //barriers
let pixi_grounds = {};                         //grounds
let pixi_fields = {};                          //fields
let pixi_night = {};                           //night

let wall_search = {counter:0, current_location:{x:-1,y:-1}, target_location:{x:-1,y:-1}};   //wall search for avatar pathfinding
let wall_search_objects = [];