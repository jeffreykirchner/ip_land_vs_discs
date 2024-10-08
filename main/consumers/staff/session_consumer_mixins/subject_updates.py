
import logging
import math

from decimal import Decimal

from django.utils.html import strip_tags

from main.models import SessionPlayer
from main.models import Session
from main.models import SessionEvent

from datetime import datetime, timedelta

from main.globals import ExperimentPhase
from main.globals import round_half_away_from_zero

import main

class SubjectUpdatesMixin():
    '''
    subject updates mixin for staff session consumer
    '''

    async def chat(self, event):
        '''
        take chat from client
        '''    
        if self.controlling_channel != self.channel_name:
            return    
       
        logger = logging.getLogger(__name__) 
        # logger.info(f"take chat: Session ")
        
        status = "success"
        error_message = ""
        player_id = None

        if status == "success":
            try:
                player_id = self.session_players_local[event["player_key"]]["id"]
                event_data = event["message_text"]
                current_location = event_data["current_location"]
            except:
                logger.info(f"chat: invalid data, {event['message_text']}")
                status = "fail"
                error_message = "Invalid data."
        
        if status == "success":
            if not self.world_state_local["started"] or \
            self.world_state_local["finished"] or \
            self.world_state_local["current_experiment_phase"] != ExperimentPhase.RUN:
                logger.info(f"take chat: failed, session not started, finished, or not in run phase")
                status = "fail"
                error_message = "Session not started."
        
        result = {"status": status, "error_message": error_message}
        result["sender_id"] = player_id

        if status == "success":
            session_player = self.world_state_local["session_players"][str(player_id)]
            session_player["current_location"] = current_location
            
            result["text"] = strip_tags(event_data["text"])
            result["nearby_players"] = []

            #format text for chat bubbles
            # wrapper = TextWrapper(width=13, max_lines=6)
            # result['text'] = wrapper.fill(text=result['text'])

            #find nearby players
            session_players = self.world_state_local["session_players"]
            for i in session_players:
                if i != str(result["sender_id"]):
                    source_pt = [session_players[str(result["sender_id"])]["current_location"]["x"], session_players[str(result["sender_id"])]["current_location"]["y"]]
                    target_pt = [session_players[i]["current_location"]["x"], session_players[i]["current_location"]["y"]]
                    
                    if math.dist(source_pt, target_pt) <= 1000:
                        result["nearby_players"].append(i)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_chat(self, event):
        '''
        send chat to clients, if clients can view it
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_connection_status(self, event):
        '''
        handle connection status update from group member
        '''
        logger = logging.getLogger(__name__) 
        event_data = event["data"]

        #update not from a client
        if event_data["value"] == "fail":
            if not self.session_id:
                self.session_id = event["session_id"]

            logger.info(f"update_connection_status: event data {event}, channel name {self.channel_name}, group name {self.room_group_name}")

            if "session" in self.room_group_name:
                #connection from staff screen
                if event["connect_or_disconnect"] == "connect":
                    # session = await Session.objects.aget(id=self.session_id)
                    self.controlling_channel = event["sender_channel_name"]

                    if self.channel_name == self.controlling_channel:
                        logger.info(f"update_connection_status: controller {self.channel_name}, session id {self.session_id}")
                        await Session.objects.filter(id=self.session_id).aupdate(controlling_channel=self.controlling_channel) 
                        await self.send_message(message_to_self=None, message_to_group={"controlling_channel" : self.controlling_channel},
                                                message_type="set_controlling_channel", send_to_client=False, send_to_group=True)
                else:
                    #disconnect from staff screen
                    pass                   
            return
        
        subject_id = event_data["result"]["id"]

        session_player = await SessionPlayer.objects.aget(id=subject_id)
        event_data["result"]["name"] = session_player.name
        event_data["result"]["student_id"] = session_player.student_id
        event_data["result"]["current_instruction"] = session_player.current_instruction
        event_data["result"]["survey_complete"] = session_player.survey_complete
        event_data["result"]["instructions_finished"] = session_player.instructions_finished

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_set_controlling_channel(self, event):
        '''
        only for subject screens
        '''
        pass

    async def update_name(self, event):
        '''
        send update name notice to staff screens
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_next_instruction(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_finish_instructions(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_survey_complete(self, event):
        '''
        send survey complete update
        '''
        event_data = event["data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def target_location_update(self, event):
        '''
        update target location from subject screen
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        # logger = logging.getLogger(__name__) 
        # logger.info(f"target_location_update: world state controller {self.controlling_channel} channel name {self.channel_name}")
        
        logger = logging.getLogger(__name__)
        
        event_data =  event["message_text"]

        try:
            target_location = event_data["target_location"]    
            current_location = event_data["current_location"]
        except KeyError:
            logger.info(f"target_location_update: invalid location, {event['message_text']}")
            return
            # result = {"value" : "fail", "result" : {"message" : "Invalid location."}}
        
        player_id = self.session_players_local[event["player_key"]]["id"]
        session_player = self.world_state_local["session_players"][str(player_id)]

        if session_player["frozen"] or session_player["tractor_beam_target"]:
            return

        session_player["target_location"] = target_location
        session_player["current_location"] = current_location

        last_update = datetime.strptime(self.world_state_local["last_update"], "%Y-%m-%d %H:%M:%S.%f")
        dt_now = datetime.now()

        if dt_now - last_update > timedelta(seconds=1):
            # logger.info("updating world state")
            self.world_state_local["last_update"] = str(dt_now)
            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            target_locations = {}
            current_locations = {}
            for i in self.world_state_local["session_players"]:
                target_locations[i] = self.world_state_local["session_players"][i]["target_location"]
                current_locations[i] = self.world_state_local["session_players"][i]["current_location"]
            
            data = {"target_locations" : target_locations, "current_locations" : current_locations}

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=data))
        
        result = {"value" : "success", 
                  "target_location" : target_location, 
                  "current_location" : current_location,
                  "session_player_id" : player_id}
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_target_location_update(self, event):
        '''
        update target location from subject screen
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def tractor_beam(self, event):
        '''
        subject activates tractor beam
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__) 
        
        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            target_player_id = event["message_text"]["target_player_id"]
        except:
            logger.error(f"tractor_beam: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"tractor_beam", "message": "Invalid data, try again."})
        
        #check if on break
        if self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:
            status = "fail"
            error_message.append({"id":"field_claim", "message": "You cannot interact during the break."})

        if status == "success":
            source_player = self.world_state_local['session_players'][str(player_id)]
            target_player = self.world_state_local['session_players'][str(target_player_id)]

        # check if players are frozen
        if status == "success":
            if source_player['frozen'] or target_player['frozen']:
                # logger.info(f"tractor_beam: players frozen, {event['message_text']}")
                status = "fail"
                error_message.append({"id":"tractor_beam", "message": "The avatar is not available for an interaction."})

        #check if either player has tractor beam enabled
        if status == "success":
            if source_player['tractor_beam_target'] or target_player['tractor_beam_target']:
                # logger.info(f"tractor_beam: already in an interaction, {event['message_text']}")
                status = "fail"
                error_message.append({"id":"tractor_beam", "message": "The avatar is not available for an interaction."})
        
        #check if player is already interacting or cooling down.
        if status == "success":
            if source_player['interaction'] > 0 or source_player['cool_down'] > 0:
                # logger.info(f"tractor_beam: cooling down, {event['message_text']}")
                status = "fail"
                error_message.append({"id":"tractor_beam", "message": "The avatar is not available for an interaction."})
        
        result = {"status" : status, 
                  "error_message" : error_message, 
                  "source_player_id" : player_id}
        
        if status == "success":
            source_player['frozen'] = True
            target_player['frozen'] = True

            source_player["state"] = "tractor_beam_source"
            source_player["state_payload"] = {}
            
            target_player["state"] = "tractor_beam_target"
            target_player["state_payload"] = {}

            source_player['tractor_beam_target'] = target_player_id
            source_player['interaction'] = self.parameter_set_local['interaction_length']

            target_player['interaction'] = self.parameter_set_local['interaction_length']

            result["player_id"] = player_id
            result["target_player_id"] = target_player_id

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_tractor_beam(self, event):
        '''
        subject activates tractor beam update
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def interaction(self, event):
        '''
        subject sends an interaction
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        
        error_message = []
        status = "success"
        
        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            source_player = self.world_state_local['session_players'][str(player_id)]

            target_player_id = event["message_text"]["target_player_id"]
            interaction_type =  event["message_text"]["interaction_type"]
            interaction_amount =  event["message_text"]["interaction_amount"]
            interaction_discs =  event["message_text"]["interaction_discs"]

        except:
            logger.error(f"interaction: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"interaction", "message": "Invalid data, try again."})

        parameter_set_period = await self.get_current_parameter_set_period()
        session = await Session.objects.aget(id=self.session_id)
        current_period = await session.aget_current_session_period()

        if not str(interaction_amount).isnumeric():
            status = "fail"
            error_message = "Invalid entry."

        #check if on break
        if self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:
            status = "fail"
            error_message = "No interactions on break."

        if status == "success":
            if (interaction_type=='take_seeds' or interaction_type == 'take_disc') and \
                source_player['interaction'] == 0:
                status = "fail"
                error_message = "No interaction in progress."
        
        if status == "success":
            if interaction_type=='take_seeds' and parameter_set_period["seed_pr"] == "True":
                status = "fail"
                error_message = "Invalid entry."
        
        result = {"source_player_id": player_id}

        if status != "fail":

            target_player_id_s = str(target_player_id)
            player_id_s = str(player_id)

            source_player = self.world_state_local['session_players'][player_id_s]
            target_player = self.world_state_local['session_players'][target_player_id_s]

            session = await Session.objects.aget(id=self.session_id)

            if interaction_type == 'take_seeds':
                #take from target
                if target_player["seeds"] < interaction_amount:
                    status = "fail"
                    error_message = "They do not have enough seeds."
                elif interaction_amount <= 0:
                    status = "fail"
                    error_message = "Invalid entry."
                else:
                    target_player["seeds"] -= interaction_amount
                    source_player["seeds"] += interaction_amount

                    result["target_player_change"] = f"-{interaction_amount}"
                    result["source_player_change"] = f"+{interaction_amount}"       

                    current_period.summary_data[target_player_id_s]["seeds_they_took_total"] += interaction_amount    
                    current_period.summary_data[player_id_s]["seeds_i_took_total"] += interaction_amount

                    current_period.summary_data[player_id_s]["interactions"][target_player_id_s]["seeds_i_took"] += interaction_amount
                    current_period.summary_data[target_player_id_s]["interactions"][player_id_s]["seeds_they_took"] += interaction_amount

            elif interaction_type == 'send_seeds':
                #give to target
                if source_player["seeds"] < interaction_amount:
                    status = "fail"
                    error_message = "You do not have enough seeds."
                elif interaction_amount <= 0:
                    status = "fail"
                    error_message = "Invalid entry."
                else:
                    source_player["seeds"] -= interaction_amount
                    target_player["seeds"] += interaction_amount

                    result["source_player_change"] = f"-{interaction_amount}"
                    result["target_player_change"] = f"+{interaction_amount}"

                    current_period.summary_data[player_id_s]["seeds_i_sent_total"] += interaction_amount
                    current_period.summary_data[target_player_id_s]["seeds_they_sent_total"] += interaction_amount
                    
                    current_period.summary_data[player_id_s]["interactions"][target_player_id_s]["seeds_i_sent"] += interaction_amount
                    current_period.summary_data[target_player_id_s]["interactions"][player_id_s]["seeds_they_sent"] += interaction_amount

            elif interaction_type == 'take_disc':
                disc_found = False

                for i in interaction_discs:
                    if interaction_discs[i] and target_player["disc_inventory"][i]:
                        source_player["disc_inventory"][i] = True
                        disc_found = True
                        current_period.summary_data[player_id_s]["interactions"][target_player_id_s]["discs_i_took"][i] = True
                        current_period.summary_data[target_player_id_s]["interactions"][player_id_s]["discs_they_took"][i] = True
                
                if not disc_found:
                    status = "fail"
                    error_message = "No discs selected."
                
                if status == "success":
                    current_period.summary_data[target_player_id_s]["discs_they_took_total"] += len(interaction_discs)
                    current_period.summary_data[player_id_s]["discs_i_took_total"] += len(interaction_discs)

            elif interaction_type == 'send_disc':
                disc_found = False

                for i in interaction_discs:
                    if interaction_discs[i] and source_player["disc_inventory"][i]:
                        target_player["disc_inventory"][i] = True
                        disc_found = True
                        current_period.summary_data[player_id_s]["interactions"][target_player_id_s]["discs_i_sent"][i] = True
                        current_period.summary_data[target_player_id_s]["interactions"][player_id_s]["discs_they_sent"][i] = True
                
                if not disc_found:
                    status = "fail"
                    error_message = "No discs selected."

                if status == "success":
                    current_period.summary_data[player_id_s]["discs_i_sent_total"] += len(interaction_discs)
                    current_period.summary_data[target_player_id_s]["discs_they_sent_total"] += len(interaction_discs)
            
            if interaction_type == 'take_seeds' or interaction_type=='take_disc':
                source_player["state"] = "open"
                source_player["state_payload"] = {}

                target_player["state"] = "open"
                target_player["state_payload"] = {}

            await current_period.asave()

        result["status"] = status
        result["error_message"] = error_message

        result["source_player_id"] = player_id
        result["target_player_id"] = target_player_id

        if status == "success":

            result["source_player_seeds"] = source_player["seeds"]
            result["target_player_seeds"] = target_player["seeds"]

            result["source_player_disc_inventory"] = source_player["disc_inventory"]
            result["target_player_disc_inventory"] = target_player["disc_inventory"]

            result["target_player_id"] = target_player_id
            result["interaction_type"] = interaction_type
            result["interaction_amount"] = interaction_amount
            result["interaction_discs"] = interaction_discs

            #clear status
            if interaction_type == 'take_seeds' or interaction_type == 'take_disc':
                source_player['interaction'] = 0
                target_player['interaction'] = 0

                source_player['frozen'] = False
                target_player['frozen'] = False

                source_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                target_player["cool_down"] = self.parameter_set_local["cool_down_length"]

                source_player['tractor_beam_target'] = None

            result["source_player_interaction"] = source_player["interaction"]
            result["target_player_interaction"] = target_player["interaction"]

            result["source_player_frozen"] = source_player["frozen"]
            result["target_player_frozen"] = target_player["frozen"]

            result["source_player_cool_down"] = source_player["cool_down"]
            result["target_player_cool_down"] = target_player["cool_down"]

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))
        
        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_interaction(self, event):
        '''
        subject send an interaction update
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def cancel_interaction(self, event):
        '''
        subject cancels interaction
        '''
        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        
        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            interaction_type =  event["message_text"]["interaction_type"]
            source_player = self.world_state_local['session_players'][str(player_id)]

            target_player_id = source_player['tractor_beam_target']
            target_player = self.world_state_local['session_players'][str(target_player_id)]
        except:
            logger.error(f"interaction: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"cancel_interaction", "message": "Invalid data, try again."})

        if source_player['interaction'] == 0:
            return
        
        if status == "success":
            source_player['interaction'] = 0
            target_player['interaction'] = 0

            source_player['frozen'] = False
            target_player['frozen'] = False

            source_player["state"] = "open"
            source_player["state_payload"] = {}

            target_player["state"] = "open"
            target_player["state_payload"] = {}

            source_player["cool_down"] = self.parameter_set_local["cool_down_length"]

            source_player['tractor_beam_target'] = None

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

        result = {"source_player_id" : player_id, 
                  "target_player_id" : target_player_id, 
                  "value" : status,
                  "error_message" : error_message,}

        if status == "success":
            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_cancel_interaction(self, event):
        '''
        subject cancels interaction update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def field_claim(self, event):
        '''
        subject claims a field
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            source_player = self.world_state_local['session_players'][str(player_id)]
            field_id = event["message_text"]["field_id"]
            field = self.world_state_local["fields"][str(field_id)]
            source = event["message_text"]["source"]
            current_location = event["message_text"]["current_location"]
        except:
            logger.error(f"field_claim: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"field_claim", "message": "Invalid data, try again."})

        player_id_s = str(player_id)
        session = await Session.objects.aget(id=self.session_id)
        current_period = await session.aget_current_session_period()

        #check if on break
        if self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:
            status = "fail"
            error_message.append({"id":"field_claim", "message": "You cannot plow a field during the break."})

        #check if field is already claimed
        if status == "success" and source == "client":
            if field["status"] != "available":
                status = "fail"
                error_message.append({"id":"field_claim", "message": "The Field was already plowed this period."})
        
        #check if player already claimed another field
        if status == "success" and source == "client":
            for i in self.world_state_local["fields"]:
                if self.world_state_local["fields"][i]["owner"] == player_id:
                    status = "fail"
                    error_message.append({"id":"field_claim", "message": "You already plowed a field this period."})
                    break
        
        #check if player has enough proudction seconds remaining    
        if status == "success" and source == "client":
            if Decimal(source_player["build_time_remaining"]) < Decimal(self.parameter_set_local["field_build_length"]):
                status = "fail"
                error_message.append({"id":"field_claim", "message": "Not enough production time to plow a field."})

        #check if player is doing an action
        if source == "client" and source_player["state"] != "open":
            status = "fail"
            error_message.append({"id":"build_disc", "message": "Invalid Entry."})

        result = {"status" : status, 
                  "error_message" : error_message, 
                  "source_player_id" : player_id}
        
        result["field_id"] = field_id
        result["field"] = field
        
        if status == "success":
            session_player = self.world_state_local["session_players"][player_id_s]

            if source == "client":

                event["message_text"]["source"]="server"

                session_player["build_time_remaining"] = Decimal(session_player["build_time_remaining"]) - Decimal(self.parameter_set_local["field_build_length"])
                session_player["build_time_remaining"] = str(session_player["build_time_remaining"])

                session_player["state"] = "claiming_field"
                session_player["state_payload"] = event
                session_player["frozen"] = True
                session_player["interaction"] = self.parameter_set_local["field_build_length"]
                
                #claim field
                field["status"] = "building"
                field["owner"] = player_id
            else:
                current_paramter_set_period = await self.get_current_parameter_set_period()

                session_player["state"] = "open"
                session_player["state_payload"] = {}
                session_player["frozen"] = False
                session_player["interaction"] = 0

                field["status"] = "claimed"

                if current_paramter_set_period["field_pr"] == "True":
                    field["allowed_players"] = [player_id]
                else:
                    field["allowed_players"] = self.world_state_local["session_players_order"].copy()

                current_period.summary_data[player_id_s]["field_owner"] = self.parameter_set_local["parameter_set_fields"][str(field["parameter_set_field"])]["info"]
                await current_period.asave()

            result["build_time_remaining"] = session_player["build_time_remaining"]
            result["state"] = session_player["state"]
            result["frozen"] = session_player["frozen"]
            result["interaction"] = session_player["interaction"]
            result["current_location"] = current_location

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)

    async def update_field_claim(self, event):
        '''
        subject claims a field update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def grant_field_access(self, event):
        '''
        subject grants field access to another player
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            source_player = self.world_state_local['session_players'][str(player_id)]
            field_id = event["message_text"]["field_id"]
            field = self.world_state_local["fields"][str(field_id)]
            target_player_id = event["message_text"]["target_player_id"]
        except:
            logger.error(f"field_claim: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"field_claim", "message": "Invalid data, try again."})

        #check if field is owned by player
        if status == "success":
            if field["owner"] != player_id:
                status = "fail"
                error_message.append({"id":"field_claim", "message": "You do not own this field."})
        
        #check that field property rights are in effect
        if status == "success":
            current_paramter_set_period = await self.get_current_parameter_set_period()
            if current_paramter_set_period["field_pr"] == "False":
                status = "fail"
                error_message.append({"id":"field_claim", "message": "Invalid entry."})
        
        #check if target player already has access
        if status == "success":
            if target_player_id in field["allowed_players"]:
                status = "fail"
                error_message.append({"id":"field_claim", "message": "Player already has access."})

        result = {"status" : status, 
                  "error_message" : error_message, 
                  "source_player_id" : player_id}
        
        if status == "success":
            field["allowed_players"].append(target_player_id)

            result["field_id"] = field_id
            result["field"] = field
            result["target_player_id"] = target_player_id
            
            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
        
    async def update_grant_field_access(self, event):
        '''
        subject grants field access to another player update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def build_disc(self, event):
        '''
        subject builds a disc
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            source = event["message_text"]["source"]
            current_location = event["message_text"]["current_location"]
        except:
            logger.error(f"build_disc: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"build_disc", "message": "Invalid data, try again."})

        player_id_s = str(player_id)
        session_player = self.world_state_local["session_players"][player_id_s]

        session = await Session.objects.aget(id=self.session_id)
        current_period = await session.aget_current_session_period()
       
        #check if disc already built
        if session_player["disc_inventory"][player_id_s]:
            status = "fail"
            error_message.append({"id":"build_disc", "message": "You already have a disc."})

        #check if on break
        if self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:
            status = "fail"
            error_message.append({"id":"build_disc", "message": "No production during the break."})

        #check if player has enough proudction seconds remaining
        if Decimal(session_player["build_time_remaining"]) <  Decimal(self.parameter_set_local["disc_build_length"]):
            status = "fail"
            error_message.append({"id":"build_disc", "message": "Not enough production time remaining."})

        #check if player is doing an action
        if source == "client" and session_player["state"] != "open":
            status = "fail"
            error_message.append({"id":"build_disc", "message": "Invalid Entry."})

        result = {"status" : status, 
                  "error_message" : error_message, 
                  "source_player_id" : player_id}
        
        if status == "success":
            #build a disc
            if source == "server":
                current_period.summary_data[player_id_s]["disc_produced"] = True

                session_player["disc_inventory"][player_id_s] = True
                session_player["build_time_remaining"] = Decimal(session_player["build_time_remaining"]) - Decimal(self.parameter_set_local["disc_build_length"])
                session_player["build_time_remaining"] = str(session_player["build_time_remaining"])

                session_player["state"] = "open"
                session_player["state_payload"] = {}
                session_player["frozen"] = False
            else:
                event["message_text"]["source"]="server"
                session_player["state"] = "building_disc"
                session_player["state_payload"] = event
                session_player["frozen"] = True
                session_player["interaction"] = self.parameter_set_local["disc_build_length"]

            result["disc_inventory"] = self.world_state_local["session_players"][player_id_s]["disc_inventory"]
            result["build_time_remaining"] = session_player["build_time_remaining"]
            result["state"] = session_player["state"]
            result["frozen"] = session_player["frozen"]
            result["interaction"] = session_player["interaction"]
            result["current_location"] = current_location

            await current_period.asave()
            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_build_disc(self, event):
        '''
        subject builds a disc update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def build_seeds(self, event):
        '''
        subject builds seeds
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)

        error_message = []
        status = "success"

        try:
            player_id = self.session_players_local[event["player_key"]]["id"]
            build_seed_count = event["message_text"]["build_seed_count"]
            source = event["message_text"]["source"]
            current_location = event["message_text"]["current_location"]
        except:
            logger.error(f"build_seeds: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "Invalid data, try again."})

        player_id_s = str(player_id)
        session_player = self.world_state_local["session_players"][player_id_s]

        session = await Session.objects.aget(id=self.session_id)
        current_period = await session.aget_current_session_period()

        if not str(build_seed_count).isnumeric():
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "Invalid entry."})
        
        if build_seed_count <= 0:
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "Invalid entry."})

        #check if on break
        if self.world_state_local["time_remaining"] > self.parameter_set_local["period_length"]:
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "No production during the break."})

        #check if player has enough proudction seconds remaining
        if Decimal(session_player["build_time_remaining"]) < build_seed_count * Decimal(self.parameter_set_local["seed_build_length"]):
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "Not enough production time remaining."})

        #check if player is available
        if source == "client" and session_player["state"] != "open":
            status = "fail"
            error_message.append({"id":"build_seeds", "message": "Invalid action."})

        result = {"status" : status, 
                  "error_message" : error_message, 
                  "source_player_id" : player_id}
        
        if status == "success":
            #build seeds

            if source == "server":
                session_player["seeds"] += build_seed_count
                session_player["build_time_remaining"] = Decimal(session_player["build_time_remaining"] ) - (build_seed_count * Decimal(self.parameter_set_local["seed_build_length"]))
                session_player["build_time_remaining"] = str(session_player["build_time_remaining"])

                session_player["state"] = "open"
                session_player["state_payload"] = {}
                session_player["frozen"] = False

                current_period.summary_data[player_id_s]["seeds_produced"] += build_seed_count
                await current_period.asave()
            else:
                event["message_text"]["source"]="server"
                session_player["state"] = "building_seeds"
                session_player["state_payload"] = event
                session_player["frozen"] = True
                session_player["interaction"] = math.floor(round_half_away_from_zero(build_seed_count * Decimal(self.parameter_set_local["seed_build_length"]),1))

            result["seeds"] = session_player["seeds"]
            result["build_time_remaining"] = session_player["build_time_remaining"]
            result["build_seed_count"] = build_seed_count
            result["state"] = session_player["state"]
            result["frozen"] = session_player["frozen"]
            result["interaction"] = session_player["interaction"]
            result["current_location"] = current_location

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=self.world_state_local["current_period"],
                                                    time_remaining=self.world_state_local["time_remaining"],
                                                    data=result))

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, send_to_group=True)
    
    async def update_build_seeds(self, event):
        '''
        subject builds seeds update
        '''
        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def present_players(self, event):
        '''
        subjects that are present on a field
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        # logger.info(f"present_players: data, {event['message_text']}")

        error_message = []
        status = "success"

        try:
            session_player_id = self.session_players_local[event["player_key"]]["id"]
            session_player = self.world_state_local["session_players"][str(session_player_id)]
            parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]
            field_id = event["message_text"]["field_id"]
            field =  self.world_state_local["fields"][str(field_id)]
            parameter_set_field = self.parameter_set_local["parameter_set_fields"][str(field["parameter_set_field"])]
            present_players = event["message_text"]["present_players"]
        except:
            logger.error(f"present_players: invalid data, {event['message_text']}")
            status = "fail"
            error_message.append({"id":"present_players", "message": "Invalid data, try again."})
        
        if status == "success":
            #store entries
            field_entries = []
            for i in present_players:
                if i not in field["present_players"]:
                    field_entries.append(i)

            #store exits
            field_exits = []
            for i in field["present_players"]:
                if i not in present_players:
                    field_exits.append(i)

            field["present_players"] = present_players

            #data setup
            data = {"field": field, "field_label":parameter_set_field["info"]}
            data["field_owner_label"] = parameter_set_player["id_label"]
            data["present_player_labels"] = []
            data["allowed_player_labels"] = []

            for j in field["present_players"]:
                p = self.world_state_local["session_players"][str(j)]
                psp = self.parameter_set_local["parameter_set_players"][str(p["parameter_set_player_id"])]
                data["present_player_labels"].append(psp["id_label"])

            for j in field["allowed_players"]:
                p = self.world_state_local["session_players"][str(j)]
                psp = self.parameter_set_local["parameter_set_players"][str(p["parameter_set_player_id"])]
                data["allowed_player_labels"].append(psp["id_label"])

            #record entries
            for i in field_entries:
                self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                        session_player_id=i,
                                                        type="field_enter",
                                                        period_number=self.world_state_local["current_period"],
                                                        time_remaining=self.world_state_local["time_remaining"],
                                                        data=data))
            #record exits
            for i in field_exits:
                self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                        session_player_id=i,
                                                        type="field_exit",
                                                        period_number=self.world_state_local["current_period"],
                                                        time_remaining=self.world_state_local["time_remaining"],
                                                        data=data))
    
    #helpers
    async def get_current_parameter_set_period(self):
        '''
        get current paramter set period
        '''
        session_period_id = self.world_state_local["session_periods_order"][self.world_state_local["current_period"]-1]
        parameter_set_period_id = self.world_state_local["session_periods"][str(session_period_id)]["parameter_set_period"]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]

        return parameter_set_period
                                      
    

                                
        

