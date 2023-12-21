import logging
import asyncio
import math


from datetime import datetime
from decimal import Decimal

from asgiref.sync import sync_to_async

from django.db import transaction

from main.models import Session
from main.models import SessionEvent

from main.globals import ExperimentPhase
from main.globals import round_half_away_from_zero

class TimerMixin():
    '''
    timer mixin for staff session consumer
    '''

    async def start_timer(self, event):
        '''
        start or stop timer 
        '''
        logger = logging.getLogger(__name__)
        logger.info(f"start_timer {event}")

        if self.controlling_channel != self.channel_name:
            logger.warning(f"start_timer: not controlling channel")
            return

        if event["message_text"]["action"] == "start":            
            self.world_state_local["timer_running"] = True
        else:
            self.world_state_local["timer_running"] = False

        self.world_state_local["timer_history"].append({"time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f"),
                                                        "count": 0})
        
        await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)

        result = {"timer_running" : self.world_state_local["timer_running"]}
        await self.send_message(message_to_self=result, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
        # logger.info(f"start_timer complete {event}")

    async def continue_timer(self, event):
        '''
        continue to next second of the experiment
        '''

        if self.controlling_channel != self.channel_name:
            return
        
        logger = logging.getLogger(__name__)
        #logger.info(f"continue_timer: start")

        if not self.world_state_local["timer_running"]:
            logger.info(f"continue_timer timer off")
            await self.send_message(message_to_self=True, message_to_group=None,
                                    message_type="stop_timer_pulse", send_to_client=True, send_to_group=False)
            return

        stop_timer = False
        send_update = True
        period_is_over = False

        result = {"earnings":{}}

        #check session over
        if self.world_state_local["current_period"] > self.parameter_set_local["period_count"] or \
            (self.world_state_local["current_period"] == self.parameter_set_local["period_count"] and
             self.world_state_local["time_remaining"] <= 1):

            self.world_state_local["current_period"] = self.parameter_set_local["period_count"]
            self.world_state_local["time_remaining"] = 0
            self.world_state_local["timer_running"] = False
            
            self.world_state_local["current_experiment_phase"] = ExperimentPhase.NAMES
            stop_timer = True

            period_is_over = True

            #store final period earnings    
            last_period_id = self.world_state_local["session_periods_order"][self.world_state_local["current_period"] - 1]
            last_period_id_s = str(last_period_id)
            last_period = self.world_state_local["session_periods"][last_period_id_s]

            last_period["consumption_completed"] = True
            
            for i in self.world_state_local["session_players"]:
                self.world_state_local["session_players"][i]["earnings"] += self.world_state_local["session_players"][i]["seeds"]

                result["earnings"][i] = {}
                result["earnings"][i]["total_earnings"] = self.world_state_local["session_players"][i]["earnings"]
                result["earnings"][i]["period_earnings"] = self.world_state_local["session_players"][i]["seeds"]
           
        if self.world_state_local["current_experiment_phase"] != ExperimentPhase.NAMES:

            ts = datetime.now() - datetime.strptime(self.world_state_local["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

            #check if a full second has passed
            if self.world_state_local["timer_history"][-1]["count"] == math.floor(ts.seconds):
                send_update = False

            if send_update:
                ts = datetime.now() - datetime.strptime(self.world_state_local["timer_history"][-1]["time"],"%Y-%m-%dT%H:%M:%S.%f")

                self.world_state_local["timer_history"][-1]["count"] = math.floor(ts.seconds)

                total_time = 0  #total time elapsed
                for i in self.world_state_local["timer_history"]:
                    total_time += i["count"]

                #find current period
                current_period = 1
                temp_time = 0          #total of period lengths through current period.
                for i in range(1, self.parameter_set_local["period_count"]+1):
                    temp_time += self.parameter_set_local["period_length"]

                    #add break times
                    if i % self.parameter_set_local["break_frequency"] == 0:
                        temp_time += self.parameter_set_local["break_length"]
                    
                    if temp_time > total_time:
                        break
                    else:
                        current_period += 1

                #time remaining in period
                time_remaining = temp_time - total_time

                # if current_period == 2 and time_remaining ==10:
                #     '''test code'''
                #     pass

                self.world_state_local["time_remaining"] = time_remaining
                self.world_state_local["current_period"] = current_period
                
                if current_period > 1:
                    last_period_id = self.world_state_local["session_periods_order"][current_period - 2]
                    last_period_id_s = str(last_period_id)
                    last_period = self.world_state_local["session_periods"][last_period_id_s]

                    period_is_over = not last_period["consumption_completed"]

                #check if period over
                if period_is_over:

                    # current_period_id = str(self.world_state_local["session_periods_order"][self.world_state_local["current_period"]-1])

                    last_period["consumption_completed"] = True
                    
                    for i in self.world_state_local["session_players"]:
                        session_player = self.world_state_local["session_players"][i]
                        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]

                        session_player["cool_down"] = 0
                        session_player["interaction"] = 0
                        session_player["frozen"] = False
                        session_player["tractor_beam_target"] = None
                        session_player["state"] = "open"
                        session_player["state_payload"] = {}

                        period_earnings = Decimal(self.world_state_local["session_players"][i]["seeds"])
                        period_earnings *= await self.get_seed_multiplier(i)
                        session_player["earnings"] = str(Decimal(session_player["earnings"]) + period_earnings)
                        session_player["earnings"] = round_half_away_from_zero(session_player["earnings"], 1)

                        result["earnings"][i] = {}
                        result["earnings"][i]["total_earnings"] = session_player["earnings"]
                        result["earnings"][i]["period_earnings"] = round_half_away_from_zero(period_earnings, 1)

                        session_player["seeds"] = 0
                        session_player["build_time_remaining"] = self.parameter_set_local["build_time"] 

                        #reset locations
                        session_player["current_location"] = {"x": parameter_set_player["start_x"],
                                                              "y": parameter_set_player["start_y"]}
                        
                        session_player["target_location"] = {"x": parameter_set_player["start_x"]+1,
                                                             "y": parameter_set_player["start_y"]+1}

                    for i in self.world_state_local["fields"]:
                        field = self.world_state_local["fields"][i]
                        field["owner"] = None
                        field["status"] = "available"       
                        field["allowed_players"] = []      
                        field["present_players"] = []

        if send_update:
            #session status
            result["value"] = "success"
            result["stop_timer"] = stop_timer
            result["time_remaining"] = self.world_state_local["time_remaining"]
            result["current_period"] = self.world_state_local["current_period"]
            result["timer_running"] = self.world_state_local["timer_running"]
            result["started"] = self.world_state_local["started"]
            result["finished"] = self.world_state_local["finished"]
            result["current_experiment_phase"] = self.world_state_local["current_experiment_phase"]
            result["period_is_over"] = period_is_over

            #locations
            result["current_locations"] = {}
            result["target_locations"] = {}
            for i in self.world_state_local["session_players"]:
                result["current_locations"][i] = self.world_state_local["session_players"][i]["current_location"]
                result["target_locations"][i] = self.world_state_local["session_players"][i]["target_location"]

            #fields
            result["fields"] = {}
            result["fields"] = self.world_state_local["fields"]

            session_player_status = {}

            #decrement waiting and interaction time
            for p in self.world_state_local["session_players"]:
                session_player = self.world_state_local["session_players"][p]

                session_player["seed_multiplier"] = await self.get_seed_multiplier(p)

                if session_player["cool_down"] > 0:
                    session_player["cool_down"] -= 1

                if session_player["interaction"] > 0:
                    session_player["interaction"] -= 1

                    if session_player["interaction"] == 0:
                        if session_player["state"] != "building_seeds" and \
                           session_player["state"] != "claiming_field" and \
                           session_player["state"] != "tractor_beam_target":
                            session_player["cool_down"] = self.parameter_set_local["cool_down_length"]
                        
                        if session_player["state"] == "tractor_beam_target" or \
                           session_player["state"] == "tractor_beam_source":
                           
                           session_player["state"] = "open"
                
                if session_player["interaction"] == 0:
                    session_player["frozen"] = False
                    session_player["tractor_beam_target"] = None

                session_player_status[p] = {"interaction": session_player["interaction"], 
                                            "frozen": session_player["frozen"], 
                                            "cool_down": session_player["cool_down"],
                                            "state": session_player["state"],
                                            "seeds": session_player["seeds"],
                                            "seed_multiplier": float(session_player["seed_multiplier"]),
                                            "build_time_remaining": session_player["build_time_remaining"],
                                            "tractor_beam_target" : session_player["tractor_beam_target"]}              

                #look for state changes.
                if session_player["state"] != "open" and session_player["interaction"] == 0:
                    if session_player["state"] == "building_seeds":
                        await self.build_seeds(session_player["state_payload"])
                    elif session_player["state"] == "claiming_field":
                        await self.field_claim(session_player["state_payload"])

            result["session_player_status"] = session_player_status

            await SessionEvent.objects.acreate(session_id=self.session_id, 
                                               type="time",
                                               period_number=self.world_state_local["current_period"],
                                               time_remaining=self.world_state_local["time_remaining"],
                                               data=result)

            if stop_timer:
                self.world_state_local["timer_running"] = False

            await Session.objects.filter(id=self.session_id).aupdate(world_state=self.world_state_local)
            
            await self.send_message(message_to_self=False, message_to_group=result,
                                    message_type="time", send_to_client=False, send_to_group=True)

    async def update_time(self, event):
        '''
        update time phase
        '''

        event_data = event["group_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    #async helpers
    async def get_seed_multiplier(self, player_id):
        '''
        get seed multiplier
        '''
        logger = logging.getLogger(__name__)
        # logger.info(f"get_seed_multiplier {player_id}")

        player_id_s = str(player_id)

        parameter_set_multipliers = self.parameter_set_local["seed_multipliers"].split("\n")

        multiplier = 1
        for i in self.world_state_local["fields"]:
            field = self.world_state_local["fields"][i]

            if player_id_s in field["present_players"]:
                present_player_count = len(field["present_players"])
                multiplier = Decimal(parameter_set_multipliers[present_player_count-1])

                break
            
        return multiplier   