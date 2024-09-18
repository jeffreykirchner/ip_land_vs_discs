from main.models import Session
from main.models import SessionPeriod
from main.models import SessionEvent

print("Enter session ids, comma separated")
session_ids = input().split(',')


#check that plowed fields completed
for i in range(len(session_ids)):
    session = Session.objects.get(id=session_ids[i])

    
    for session_period in session.session_periods.all():
        field_claims = {}

        session_events = session.session_events.filter(period_number=session_period.period_number) \
                                               .filter(type="field_claim")

        for session_event in session_events:
            if field_claims.get(session_event.session_player.id, None) is None:
                field_claims[session_event.session_player.id] = 1
            else:
                field_claims[session_event.session_player.id] += 1
    
        # print(f"Field Claims: {field_claims}")

        #check that all field_claims equal 2
        for i in field_claims:
            if field_claims[i] != 2:
                print(f"Player {i} has failed to plow in session {session.title}, period {session_period.period_number}")

    