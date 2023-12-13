var pixi_app = null;
var pixi_container_main = null;              //main container

var pixi_text_emitter = {};                  //text pop-ups
var pixi_text_emitter_key = 0;

var pixi_transfer_beams = {};                //transfer beams
var pixi_transfer_beams_key = 0;

var pixi_fps_label = null;                     //fps label

var pixi_avatars = {};                         //avatars
var pixi_walls = {};                           //walls
var pixi_barriers = {};                        //barriers
var pixi_grounds = {};                         //grounds
var pixi_fields = {};                          //fields

var wall_search = {counter:0, current_location:{x:-1,y:-1}, target_location:{x:-1,y:-1}};   //wall search for avatar pathfinding
var wall_search_objects = [];