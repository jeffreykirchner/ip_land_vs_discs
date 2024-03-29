'''
instruction set
'''

#import logging

from django.db import models

import main

class InstructionSet(models.Model):
    '''
    instruction set model
    '''

    label = models.CharField(max_length = 100, default="Name Here", verbose_name="Label")                 #label text

    action_page_move = models.IntegerField(verbose_name='Required Action: Move', default=1)
    action_page_disc = models.IntegerField(verbose_name='Required Action: Disc', default=2)
    action_page_seed = models.IntegerField(verbose_name='Required Action: Seed', default=3)
    action_page_field = models.IntegerField(verbose_name='Required Action: Field', default=4)
    action_page_interaction = models.IntegerField(verbose_name='Required Action: Interaction', default=5)
    action_page_chat = models.IntegerField(verbose_name='Required Action: Chat', default=6)
        
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.label}"

    class Meta:
        
        verbose_name = 'Instruction Set'
        verbose_name_plural = 'Instruction Sets'
        ordering = ['label']
        constraints = [
            models.UniqueConstraint(fields=['label', ], name='unique_instruction_set'),
        ]

    def copy_pages(self, i_set):
        '''
        copy instruction pages
        '''
        
        #session player periods
        instructions = []

        for i in i_set.all():
            instructions.append(main.models.Instruction(instruction_set=self, text_html=i.text_html, page_number=i.page_number))
        
        main.models.Instruction.objects.bulk_create(instructions)
    
    def copy_help_docs_subject(self, i_set):
        
        help_docs_subject = []

        for i in i_set.all():
            help_docs_subject.append(main.models.HelpDocsSubject(instruction_set=self, title=i.title, text=i.text))

        main.models.HelpDocsSubject.objects.bulk_create(help_docs_subject)
        
    #return json object of class
    def json(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "label" : self.label,

            "action_page_move" : self.action_page_move,
            "action_page_disc" : self.action_page_disc,
            "action_page_seed" : self.action_page_seed,
            "action_page_field" : self.action_page_field,
            "action_page_interaction" : self.action_page_interaction,
            "action_page_chat" : self.action_page_chat,
            
            "instruction_pages" : [i.json() for i in self.instructions.all()],
        }
    
    #return json object of class
    def json_min(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "label" : self.label,
        }
        