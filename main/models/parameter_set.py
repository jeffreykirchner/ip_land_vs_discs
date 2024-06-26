'''
parameter set
'''
import logging
import json

from decimal import Decimal

from django.db import models
from django.db.utils import IntegrityError
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist

from main import globals

from main.models import InstructionSet

import main

class ParameterSet(models.Model):
    '''
    parameter set
    '''    
   
    period_count = models.IntegerField(verbose_name='Number of periods', default=20)                          #number of periods in the experiment
    period_length = models.IntegerField(verbose_name='Period Length, Production', default=60           )      #period length in seconds
    break_frequency = models.IntegerField(verbose_name='Break Frequency', default=7)                          #frequency of breaks
    break_length = models.IntegerField(verbose_name='Break Length', default=100)                              #length of breaks in seconds
    interaction_only_length = models.IntegerField(verbose_name='Interaction Only Length', default=30)         #length of interaction only period in seconds

    private_chat = models.BooleanField(default=True, verbose_name='Private Chat')                             #if true subjects can privately chat one on one
    show_instructions = models.BooleanField(default=True, verbose_name='Show Instructions')                   #if true show instructions

    survey_required = models.BooleanField(default=False, verbose_name="Survey Required")                      #if true show the survey below
    survey_link = models.CharField(max_length = 1000, default = '', verbose_name = 'Survey Link', blank=True, null=True)

    prolific_mode = models.BooleanField(default=False, verbose_name="Prolific Mode")                          #put study into prolific mode
    prolific_completion_link = models.CharField(max_length = 1000, default = '', verbose_name = 'Forward to Prolific after sesison', blank=True, null=True) #at the completion of the study forward subjects to link

    world_width = models.IntegerField(verbose_name='Width of world in pixels', default=10000)                 #world width in pixels
    world_height = models.IntegerField(verbose_name='Height of world in pixels', default=10000)               #world height in pixels

    interaction_length = models.IntegerField(verbose_name='Interaction Length', default=10)                   #interaction length in seconds
    cool_down_length = models.IntegerField(verbose_name='Cool Down Length', default=10)                       #cool down length in seconds
    interaction_range = models.IntegerField(verbose_name='Interaction Range', default=300)                    #interaction range in pixels

    build_time = models.IntegerField(verbose_name='Build Time', default=35)                                   #build time in seconds
    seed_build_length = models.DecimalField(verbose_name='Seed Build Length', decimal_places=1, max_digits=3, default=0.5)   #seed build length in seconds
    field_build_length = models.IntegerField(verbose_name='Field Build Length', default=12)                   #field build length in seconds
    disc_build_length = models.IntegerField(verbose_name='Disc Build Length', default=12)                     #disc build length in seconds 
    enable_discs = models.BooleanField(verbose_name='Enable Discs', default=True, )                           #enable discs 

    seed_multipliers = models.TextField(verbose_name='Seed Multipliers', default="3.5", blank=True)            #seed multipliers
    disc_value = models.IntegerField(verbose_name='Disc Value', default=10)                                   #disc value

    avatar_scale = models.DecimalField(verbose_name='Avatar Scale', decimal_places=2, max_digits=3, default=0.5) #avatar scale
    avatar_bound_box_percent = models.DecimalField(verbose_name='Avatar Bound Box Percent', decimal_places=2, max_digits=3, default=0.75) #avatar bound box percent for interaction
    avatar_move_speed = models.DecimalField(verbose_name='Move Speed', decimal_places=1, max_digits=3, default=5.6)            #move speed
    avatar_animation_speed = models.DecimalField(verbose_name='Animation Speed', decimal_places=2, max_digits=3, default=0.67)  #animation speed

    reconnection_limit = models.IntegerField(verbose_name='Age Warning', default=25)       #age cut that issues a warning for invalid age range

    test_mode = models.BooleanField(default=False, verbose_name='Test Mode')                                #if true subject screens will do random auto testing

    json_for_session = models.JSONField(encoder=DjangoJSONEncoder, null=True, blank=True)                   #json model of parameter set 

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        verbose_name = 'Parameter Set'
        verbose_name_plural = 'Parameter Sets'
    
    def from_dict(self, new_ps):
        '''
        load values from dict
        '''
        logger = logging.getLogger(__name__) 

        message = "Parameters loaded successfully."
        status = "success"

        try:
            self.period_count = new_ps.get("period_count")
            self.period_length = new_ps.get("period_length")
            self.break_frequency = new_ps.get("break_frequency", 7)
            self.break_length = new_ps.get("break_length", 100)
            self.interaction_only_length = new_ps.get("interaction_only_length", 30)

            self.private_chat = False

            self.show_instructions = True if new_ps.get("show_instructions") == "True" else False

            self.survey_required = True if new_ps.get("survey_required") == "True" else False
            self.survey_link = new_ps.get("survey_link")

            self.prolific_mode = True if new_ps.get("prolific_mode") == "True" else False
            self.prolific_completion_link = new_ps.get("prolific_completion_link", None)

            self.world_width = new_ps.get("world_width", 1000)
            self.world_height = new_ps.get("world_height", 1000)

            self.interaction_length = new_ps.get("interaction_length", 10)
            self.cool_down_length = new_ps.get("cool_down_length", 10)
            self.interaction_range = new_ps.get("interaction_range", 300)

            self.build_time = new_ps.get("build_time", 35)
            self.seed_build_length = new_ps.get("seed_build_length", 1)
            self.field_build_length = new_ps.get("field_build_length", 12)
            self.disc_build_length = new_ps.get("disc_build_length", 12)
            self.enable_discs = new_ps.get("enable_discs", True)

            self.seed_multipliers = new_ps.get("seed_multipliers", "3.5")
            self.disc_value = new_ps.get("disc_value", 10)

            self.avatar_scale = new_ps.get("avatar_scale", 1)
            self.avatar_bound_box_percent = new_ps.get("avatar_bound_box_percent", 0.75)
            self.avatar_move_speed = new_ps.get("avatar_move_speed", 5.0)
            self.avatar_animation_speed = new_ps.get("avatar_animation_speed", 1.0)

            self.reconnection_limit = new_ps.get("reconnection_limit", None)

            self.save()

            #parameter set groups
            self.parameter_set_groups.all().delete()
            new_parameter_set_groups = new_ps.get("parameter_set_groups")
            new_parameter_set_groups_map = {}

            for i in new_parameter_set_groups:
                p = main.models.ParameterSetGroup.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_groups[i])
                new_parameter_set_groups_map[i] = p.id

            #parameter set players
            self.parameter_set_players.all().delete()

            new_parameter_set_players = new_ps.get("parameter_set_players")

            for i in new_parameter_set_players:
                p = main.models.ParameterSetPlayer.objects.create(parameter_set=self)
                v = new_parameter_set_players[i]
                p.from_dict(new_parameter_set_players[i])

                if v.get("parameter_set_group", None) != None:
                    p.parameter_set_group_id=new_parameter_set_groups_map[str(v["parameter_set_group"])]

                if v.get("instruction_set", None) != None:
                    p.instruction_set = InstructionSet.objects.filter(label=v.get("instruction_set_label")).first()
                
                p.save()

            self.update_player_count()

            #parameter set barriers
            self.parameter_set_barriers_a.all().delete()
            new_parameter_set_barriers = new_ps.get("parameter_set_barriers")

            for i in new_parameter_set_barriers:
                p = main.models.ParameterSetBarrier.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_barriers[i])

                groups = []
                for g in new_parameter_set_barriers[i]["parameter_set_groups"]:
                    groups.append(new_parameter_set_groups_map[str(g)])

                p.parameter_set_groups.set(groups)

            #parameter set walls
            self.parameter_set_walls.all().delete()
            new_parameter_set_walls = new_ps.get("parameter_set_walls")

            for i in new_parameter_set_walls:
                p = main.models.ParameterSetWall.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_walls[i])

            #parameter set notices
            self.parameter_set_notices.all().delete()
            new_parameter_set_notices = new_ps.get("parameter_set_notices")

            for i in new_parameter_set_notices:
                p = main.models.ParameterSetNotice.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_notices[i])

            #parameter set periods
            self.parameter_set_periods.all().delete()
            new_parameter_set_periods = new_ps.get("parameter_set_periods")

            for i in new_parameter_set_periods:
                p = main.models.ParameterSetPeriod.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_periods[i])

            #parameter set grounds
            self.parameter_set_grounds.all().delete()
            new_parameter_set_grounds = new_ps.get("parameter_set_grounds")

            for i in new_parameter_set_grounds:
                p = main.models.ParameterSetGround.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_grounds[i])
            
            #parameter set fields
            self.parameter_set_fields.all().delete()
            new_parameter_set_fields = new_ps.get("parameter_set_fields")

            for i in new_parameter_set_fields:
                p = main.models.ParameterSetField.objects.create(parameter_set=self)
                p.from_dict(new_parameter_set_fields[i])

            self.json_for_session = None
            self.save()
            
        except IntegrityError as exp:
            message = f"Failed to load parameter set: {exp}"
            status = "fail"
            logger.warning(message)

        return {"status" : status, "message" :  message}

    def setup(self):
        '''
        default setup
        '''    
        self.json_for_session = None

        self.save()

        for i in self.parameter_set_players.all():
            i.setup()

    def add_player(self):
        '''
        add a parameterset player
        '''

        player = main.models.ParameterSetPlayer()
        player.parameter_set = self
        player.player_number = self.parameter_set_players.count() + 1
        player.id_label = player.player_number
        player.save()

        self.update_json_fk(update_players=True)
    
    def remove_player(self, parameterset_player_id):
        '''
        remove specified parameterset player
        '''
        
        try:
            player = self.parameter_set_players.get(id=parameterset_player_id)
            player.delete()

        except ObjectDoesNotExist:
            logger = logging.getLogger(__name__) 
            logger.warning(f"parameter set remove_player, not found ID: {parameterset_player_id}")

        self.update_player_count()
        self.update_json_fk(update_players=True)
    
    def update_player_count(self):
        '''
        update the number of parameterset players
        '''
        for count, i in enumerate(self.parameter_set_players.all()):
            i.player_number = count + 1
            i.update_json_local()
            i.save()
    
    def update_json_local(self):
        '''
        update json model
        '''
        self.json_for_session["id"] = self.id
                
        self.json_for_session["period_count"] = self.period_count
        self.json_for_session["period_length"] = self.period_length
        self.json_for_session["break_frequency"] = self.break_frequency
        self.json_for_session["break_length"] = self.break_length
        self.json_for_session["interaction_only_length"] = self.interaction_only_length

        self.json_for_session["private_chat"] = "False"
        self.json_for_session["show_instructions"] = "True" if self.show_instructions else "False"

        self.json_for_session["survey_required"] = "True" if self.survey_required else "False"
        self.json_for_session["survey_link"] = self.survey_link

        self.json_for_session["prolific_mode"] = "True" if self.prolific_mode else "False"
        self.json_for_session["prolific_completion_link"] = self.prolific_completion_link

        self.json_for_session["world_width"] = self.world_width
        self.json_for_session["world_height"] = self.world_height

        self.json_for_session["interaction_length"] = self.interaction_length
        self.json_for_session["cool_down_length"] = self.cool_down_length
        self.json_for_session["interaction_range"] = self.interaction_range

        self.json_for_session["build_time"] = self.build_time
        self.json_for_session["seed_build_length"] = self.seed_build_length
        self.json_for_session["field_build_length"] = self.field_build_length
        self.json_for_session["disc_build_length"] = self.disc_build_length
        self.json_for_session["enable_discs"] = "True" if self.enable_discs else "False"

        self.json_for_session["seed_multipliers"] = self.seed_multipliers
        self.json_for_session["disc_value"] = self.disc_value
        
        self.json_for_session["avatar_scale"] = self.avatar_scale
        self.json_for_session["avatar_bound_box_percent"] = self.avatar_bound_box_percent
        self.json_for_session["avatar_move_speed"] = self.avatar_move_speed
        self.json_for_session["avatar_animation_speed"] = self.avatar_animation_speed

        self.json_for_session["reconnection_limit"] = self.reconnection_limit

        self.json_for_session["test_mode"] = "True" if self.test_mode else "False"

        self.save()
    
    def update_json_fk(self, update_players=False, 
                             update_notices=False, 
                             update_walls=False,
                             update_barriers=False,
                             update_grounds=False,
                             update_fields=False,
                             update_groups=False,
                             update_periods=False):
        '''
        update json model
        '''
        if update_players:
            self.json_for_session["parameter_set_players_order"] = list(self.parameter_set_players.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_players"] = {p.id : p.json() for p in self.parameter_set_players.all()}

        if update_walls:
            self.json_for_session["parameter_set_walls_order"] = list(self.parameter_set_walls.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_walls"] = {str(p.id) : p.json() for p in self.parameter_set_walls.all()}

        if update_barriers:
            self.json_for_session["parameter_set_barriers_order"] = list(self.parameter_set_barriers_a.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_barriers"] = {str(p.id) : p.json() for p in self.parameter_set_barriers_a.all()}
        
        if update_grounds:
            self.json_for_session["parameter_set_grounds_order"] = list(self.parameter_set_grounds.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_grounds"] = {str(p.id) : p.json() for p in self.parameter_set_grounds.all()}

        if update_fields:
            self.json_for_session["parameter_set_fields_order"] = list(self.parameter_set_fields.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_fields"] = {str(p.id) : p.json() for p in self.parameter_set_fields.all()}

        if update_notices:
            self.json_for_session["parameter_set_notices_order"] = list(self.parameter_set_notices.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_notices"] = {str(p.id) : p.json() for p in self.parameter_set_notices.all()}    

        if update_groups:
            self.json_for_session["parameter_set_groups_order"] = list(self.parameter_set_groups.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_groups"] = {str(p.id) : p.json() for p in self.parameter_set_groups.all()}

        if update_periods:
            self.json_for_session["parameter_set_periods_order"] = list(self.parameter_set_periods.all().values_list('id', flat=True))
            self.json_for_session["parameter_set_periods"] = {str(p.id) : p.json() for p in self.parameter_set_periods.all()}

        self.save()

    def json(self, update_required=False):
        '''
        return json object of model, return cached version if unchanged
        '''
        if not self.json_for_session or \
           update_required:
            self.json_for_session = {}
            self.update_json_local()
            self.update_json_fk(update_players=True, 
                                update_notices=True,
                                update_walls=True,
                                update_barriers=True,
                                update_grounds=True,
                                update_fields=True,
                                update_groups=True,
                                update_periods=True)

        return self.json_for_session
    
    def get_json_for_subject(self):
        '''
        return json object for subject, return cached version if unchanged
        '''
        
        if not self.json_for_session:
            return None

        v = self.json_for_session
        
        return v
        

