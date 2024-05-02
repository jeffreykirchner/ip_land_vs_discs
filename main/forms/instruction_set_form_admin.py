'''
instruction form admin screen
'''
from django import forms
from main.models import InstructionSet
from tinymce.widgets import TinyMCE

class InstructionSetFormAdmin(forms.ModelForm):
    '''
    instruction set form admin screen
    '''

    label = forms.CharField(label='Instruction Set Name',
                            widget=forms.TextInput(attrs={"width":"300px"}))
    
    action_page_move = forms.IntegerField(label='Required Action: Move', initial=1)
    action_page_disc = forms.IntegerField(label='Required Action: Disc', initial=2)
    action_page_seed = forms.IntegerField(label='Required Action: Seed', initial=3)
    action_page_field = forms.IntegerField(label='Required Action: Field', initial=4)
    action_page_interaction = forms.IntegerField(label='Required Action: Interaction', initial=5)
    action_page_chat = forms.IntegerField(label='Required Action: Chat', initial=6)

    class Meta:
        model=InstructionSet
        fields = ('label',)