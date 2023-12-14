'''
parameterset period edit form
'''

from django import forms

from main.models import ParameterSetPeriod
from main.models import HelpDocsSubject

class ParameterSetPeriodForm(forms.ModelForm):
    '''
    parameterset period edit form
    '''

    field_pr = forms.ChoiceField(label='Field Property Rights',
                                 choices=((True, 'Yes'), (False,'No' )),
                                 widget=forms.Select(attrs={"v-model":"current_parameter_set_period.field_pr",}))
    
    seed_pr = forms.ChoiceField(label='Seed Property Rights',
                                    choices=((True, 'Yes'), (False,'No' )),
                                    widget=forms.Select(attrs={"v-model":"current_parameter_set_period.seed_pr",}))
    
    disc_pr = forms.ChoiceField(label='Disc Property Rights',
                                    choices=((True, 'Yes'), (False,'No' )),
                                    widget=forms.Select(attrs={"v-model":"current_parameter_set_period.disc_pr",})) 
    
    help_doc = forms.ModelChoiceField(label='Optional Help Doc Pop-Up',
                                             required=False,
                                             queryset=HelpDocsSubject.objects.none(),
                                             widget=forms.Select(attrs={"v-model":"current_parameter_set_period.help_doc",}))
    
    class Meta:
        model=ParameterSetPeriod
        fields =[ 'field_pr', 'seed_pr', 'disc_pr', 'help_doc']
    
