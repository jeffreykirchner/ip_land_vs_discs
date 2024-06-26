'''
Parameterset edit form
'''

from django import forms

from main.models import ParameterSet

import  main

class ParameterSetForm(forms.ModelForm):
    '''
    Parameterset edit form
    '''
    period_count = forms.IntegerField(label='Number of Periods',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_count",
                                                                      "step":"1",
                                                                      "min":"1"}))

    period_length = forms.IntegerField(label='Period Length (seconds)',
                                       min_value=1,
                                       widget=forms.NumberInput(attrs={"v-model":"parameter_set.period_length",
                                                                       "step":"1",
                                                                       "min":"1"}))
    
    break_frequency = forms.IntegerField(label='Break Frequency (periods)',
                                         min_value=1,
                                         widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_frequency",
                                                                         "step":"1",
                                                                         "min":"1"}))
    
    break_length = forms.IntegerField(label='Break Length (seconds)',
                                      min_value=1,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.break_length",
                                                                      "step":"1",
                                                                      "min":"1"}))
    
    interaction_only_length = forms.IntegerField(label='Interaction Only Length (seconds)',
                                                    min_value=1,
                                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_only_length",
                                                                                    "step":"1",
                                                                                    "min":"1"}))

    show_instructions = forms.ChoiceField(label='Show Instructions',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.show_instructions",}))

    survey_required = forms.ChoiceField(label='Show Survey',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.survey_required",}))

    survey_link =  forms.CharField(label='Survey Link',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.survey_link",}))
    
    prolific_mode = forms.ChoiceField(label='Prolific Mode',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.prolific_mode",}))

    prolific_completion_link =  forms.CharField(label='After Session, Forward Subjects to URL',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.prolific_completion_link",}))
    
    reconnection_limit = forms.IntegerField(label='Re-connection Limit',
                                    min_value=1,
                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.reconnection_limit",
                                                                    "step":"1",
                                                                    "min":"1"}))
    
    interaction_length = forms.IntegerField(label='Interaction Length (seconds)',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_length",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    interaction_range = forms.IntegerField(label='Interaction Range (Pixels)',
                                            min_value=100,
                                            max_value=800,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.interaction_range",
                                                                            "step":"1",
                                                                            "max":"800",
                                                                            "min":"100"}))
    
    cool_down_length = forms.IntegerField(label='Cool Down Length (seconds)',
                                          min_value=0,
                                          widget=forms.NumberInput(attrs={"v-model":"parameter_set.cool_down_length",
                                                                          "step":"1",
                                                                          "min":"0"}))

    build_time = forms.IntegerField(label='Total Production Time (seconds)',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.build_time",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    seed_build_length = forms.DecimalField(label='Seed Build Length (seconds)',
                                        max_digits=3,
                                        decimal_places=2,
                                        min_value=0.1,
                                        widget=forms.NumberInput(attrs={"v-model":"parameter_set.seed_build_length",
                                                                        "step":"0.1",
                                                                        "min":"0.1"}))

    field_build_length = forms.IntegerField(label='Field Build Length (seconds)',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.field_build_length",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    disc_build_length = forms.IntegerField(label='Disc Build Length (seconds)',
                                           min_value=1,
                                           widget=forms.NumberInput(attrs={"v-model":"parameter_set.disc_build_length",
                                                                            "step":"1",
                                                                            "min":"1"}))
    
    enable_discs = forms.ChoiceField(label='Enable Discs',
                                     choices=((True, 'Yes'), (False,'No' )),
                                     widget=forms.Select(attrs={"v-model":"parameter_set.enable_discs",}))
    
    seed_multipliers = forms.CharField(label='Seed multipliers',
                                             required=False,
                                             widget=forms.Textarea(attrs={"v-model":"parameter_set.seed_multipliers",
                                                                          "rows":"5",}))
    
    disc_value = forms.IntegerField(label='Disc Value(¢)',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.disc_value",
                                                                            "step":"1",
                                                                            "min":"1"}))

    avatar_scale = forms.DecimalField(label='Avatar Scale',
                                      max_digits=3,
                                      decimal_places=2,
                                      min_value=0.01,
                                      widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_scale",
                                                                      "step":"0.01",
                                                                      "min":"0.01"})) 
    
    avatar_bound_box_percent = forms.DecimalField(label='Avatar Bounding Box Percent',
                                                    max_digits=3,
                                                    decimal_places=2,
                                                    min_value=0.01,
                                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_bound_box_percent",
                                                                                    "step":"0.01",
                                                                                    "min":"0.01"}))
    
    avatar_move_speed = forms.DecimalField(label='Avatar Move Speed (pixels per second)',
                                             max_digits=4,
                                             decimal_places=2,
                                             min_value=0.01,
                                             widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_move_speed",
                                                                            "step":"0.01",
                                                                            "min":"0.01"}))
    
    avatar_animation_speed = forms.DecimalField(label='Avatar Animation Speed',
                                                max_digits=3,
                                                decimal_places=2,
                                                min_value=0.01,
                                                widget=forms.NumberInput(attrs={"v-model":"parameter_set.avatar_animation_speed",
                                                                                "step":"0.01",
                                                                                "min":"0.01"}))

    world_width = forms.IntegerField(label='World Width (pixels)',
                                    min_value=1,
                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_width",
                                                                    "step":"1",
                                                                    "min":"1000"}))
    
    world_height = forms.IntegerField(label='World Height (pixels)',
                                    min_value=1,
                                    widget=forms.NumberInput(attrs={"v-model":"parameter_set.world_height",
                                                                    "step":"1",
                                                                    "min":"1000"}))
                                                                

    test_mode = forms.ChoiceField(label='Test Mode',
                                       choices=((True, 'Yes'), (False,'No' )),
                                       widget=forms.Select(attrs={"v-model":"parameter_set.test_mode",}))

    class Meta:
        model=ParameterSet
        fields =['period_count', 'period_length', 'break_frequency', 'break_length', 'interaction_only_length',
                 'show_instructions',
                 'survey_required', 'survey_link', 'prolific_mode', 'prolific_completion_link', 'reconnection_limit',
                 'interaction_length', 'interaction_range', 'cool_down_length', 'build_time', 'field_build_length', 'disc_build_length','seed_build_length',
                 'seed_multipliers', 'disc_value', 'enable_discs',
                 'avatar_scale', 'avatar_bound_box_percent', 'avatar_move_speed', 'avatar_animation_speed',
                 'world_width', 'world_height', 'test_mode']

    def clean_survey_link(self):
        
        try:
           survey_link = self.data.get('survey_link')
           survey_required = self.data.get('survey_required')

           if survey_required == 'True' and not "http" in survey_link:
               raise forms.ValidationError('Invalid link')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return survey_link
    
    def clean_prolific_completion_link(self):
        
        try:
           prolific_completion_link = self.data.get('prolific_completion_link')
           prolific_mode = self.data.get('prolific_mode')

           if prolific_mode == 'True' and not "http" in prolific_completion_link:
               raise forms.ValidationError('Enter Prolific completion URL')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return prolific_completion_link
