'''
parameterset period 
'''

from django.db import models
from django.core.serializers.json import DjangoJSONEncoder

from main.models import ParameterSet
from main.models import HelpDocsSubject

import main

class ParameterSetPeriod(models.Model):
    '''
    parameter set period
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_periods")
    help_doc = models.ForeignKey(HelpDocsSubject, on_delete=models.CASCADE, related_name="parameter_set_notices", blank=True, null=True)

    field_pr =  models.BooleanField(default=True, verbose_name='Field Property Rights')
    seed_pr =  models.BooleanField(default=True, verbose_name='Seed Property Rights')
    disc_pr =  models.BooleanField(default=True, verbose_name='Disc Property Rights')  

    timestamp = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.info)

    class Meta:
        verbose_name = 'Parameter Set Period'
        verbose_name_plural = 'Parameter Set Periods'
        ordering = ['id']

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset player
        '''
        self.field_pr = new_ps.get("field_pr", True)
        self.seed_pr = new_ps.get("seed_pr", True)
        self.disc_pr = new_ps.get("disc_pr", True)

        help_doc_id = new_ps.get("help_doc", None)
        if help_doc_id:
            help_doc = main.models.HelpDocsSubject.objects.filter(id=help_doc_id).first()
            self.help_doc = help_doc
        else:
            self.help_doc = None

        self.save()
        
        message = "Parameters loaded successfully."

        return message
    
    def setup(self):
        '''
        default setup
        '''    
        self.save()
    
    def update_json_local(self):
        '''
        update parameter set json
        '''
        self.parameter_set.json_for_session["parameter_set_periods"][self.id] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''
        
        return{

            "id" : self.id,
            "field_pr" : self.field_pr,
            "seed_pr" : self.seed_pr,
            "disc_pr" : self.disc_pr,
            "help_doc" : self.help_doc.id if self.help_doc else None,
            "help_doc_title" : self.help_doc.title if self.help_doc else None,
        }
    
    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()


