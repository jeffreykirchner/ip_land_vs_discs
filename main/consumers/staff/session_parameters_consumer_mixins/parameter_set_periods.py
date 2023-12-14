import logging

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

class ParameterSetPeriodsMixin():
    '''
    parameter set plaeyer mixin
    '''

    async def update_parameter_set_period(self, event):
        '''
        update a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def copy_period_down(self, event):
        '''
        copy period down
        '''

        message_data = {}
        message_data["status"] = await take_copy_period_down(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

@sync_to_async
def take_update_parameter_set_period(data):
    '''
    update parameterset period
    '''   
    logger = logging.getLogger(__name__) 
    logger.info(f"Update parameterset period: {data}")

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]
    form_data = data["form_data"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_period parameterset_period, not found ID: {parameterset_period_id}")
        return
    
    form_data_dict = form_data
   
    logger.info(f'form_data_dict : {form_data_dict}')

    form = ParameterSetPeriodForm(form_data_dict, instance=parameter_set_period)
    form.fields["help_doc"].queryset = session.parameter_set.instruction_set.help_docs_subject.all()

    if form.is_valid():         
        form.save()              
        parameter_set_period.parameter_set.update_json_fk(update_periods=True)

        return {"value" : "success"}                      
                                
    logger.info("Invalid parameterset period form")
    return {"value" : "fail", "errors" : dict(form.errors.items())}

@sync_to_async
def take_copy_period_down(data):
    '''
    copy period down
    '''

    logger = logging.getLogger(__name__)
    session_id = data["session_id"]
    parameterset_period_id = data["period_id"]

    try:        
        session = Session.objects.get(id=session_id)
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_period parameterset_period, not found ID: {parameterset_period_id}")
        return

    parameter_set_periods = session.parameter_set.parameter_set_periods.filter(id__gt=parameterset_period_id)

    parameter_set_period_json = parameter_set_period.json()


    for period in parameter_set_periods:
        period.from_dict(parameter_set_period_json)

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value" : "success"}      


    
