'''
parameterset field edit form
'''

from django import forms
from django.db.models.query import RawQuerySet

from main.models import ParameterSetField

class ParameterSetFieldForm(forms.ModelForm):
    '''
    parameterset field edit form
    '''

    info = forms.CharField(label='Info',
                           required=False,
                           widget=forms.TextInput(attrs={"v-model":"current_parameter_set_field.info",}))
    
    x = forms.IntegerField(label='X Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.x",
                                                                 "step":"1",
                                                                 "min":"0"}))

    y = forms.IntegerField(label='Y Location',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.y",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    width = forms.IntegerField(label='Width',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.width",
                                                                 "step":"1",
                                                                 "min":"0"}))

    height = forms.IntegerField(label='Height',
                                 min_value=0,
                                 widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_field.height",
                                                                 "step":"1",
                                                                 "min":"0"}))
    
    class Meta:
        model=ParameterSetField
        fields =['info', 'x', 'y', 'width', 'height',]
    
