# Generated by Django 4.2.8 on 2023-12-05 21:47

from django.conf import settings
import django.core.serializers.json
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import tinymce.models
import uuid


class Migration(migrations.Migration):

    replaces = [('main', '0001_initial'), ('main', '0002_session_current_experiment_phase'), ('main', '0003_parameterset_private_chat'), ('main', '0004_alter_parametersetplayer_options_and_more'), ('main', '0005_alter_parametersetplayer_options'), ('main', '0006_sessionplayer_name_submitted'), ('main', '0007_parameterset_survey_link_and_more'), ('main', '0008_sessionplayer_survey_complete'), ('main', '0009_alter_session_current_experiment_phase'), ('main', '0010_alter_sessionplayer_name_and_more'), ('main', '0011_parameterset_json_for_session'), ('main', '0012_parametersetplayer_player_number'), ('main', '0013_alter_parametersetplayer_options_and_more'), ('main', '0014_parameterset_json_for_subject_update_required_and_more'), ('main', '0015_parameterset_json_for_subject_and_more'), ('main', '0016_remove_parametersetplayer_json_for_subject_and_more'), ('main', '0017_remove_parameterset_json_for_subject_and_more'), ('main', '0018_parameterset_post_forward_link_and_more'), ('main', '0019_remove_parameterset_post_forward_link_and_more'), ('main', '0020_parameterset_reconnection_limit'), ('main', '0021_parametersetplayer_hex_color_and_more'), ('main', '0022_session_world_state'), ('main', '0023_parameterset_tokens_per_period_and_more'), ('main', '0024_parameterset_cool_down_length_and_more'), ('main', '0025_sessionperiodevent'), ('main', '0026_sessionevent_delete_sessionperiodevent'), ('main', '0027_remove_sessionevent_session_period_and_more'), ('main', '0028_delete_sessionplayerchat'), ('main', '0029_remove_session_current_experiment_phase'), ('main', '0030_remove_session_finished'), ('main', '0031_remove_session_current_period'), ('main', '0032_remove_session_time_remaining'), ('main', '0033_session_controlling_channel'), ('main', '0034_parameterset_interaction_range'), ('main', '0035_sessionevent_session_player'), ('main', '0036_alter_sessionevent_options_and_more'), ('main', '0037_parameterset_avatar_animation_speed_and_more'), ('main', '0038_parameterset_break_frequency_and_more'), ('main', '0039_sessionperiod_consumption_completed'), ('main', '0040_remove_sessionperiod_consumption_completed'), ('main', '0041_parametersetnotice'), ('main', '0042_parametersetwall'), ('main', '0043_parametersetgroup_and_more'), ('main', '0044_parametersetbarrier'), ('main', '0045_parametersetground'), ('main', '0046_alter_parameterset_instruction_set_and_more'), ('main', '0047_helpdocssubject_and_more'), ('main', '0048_parametersetbarrier_parameter_set_players')]

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='HelpDocs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='', max_length=300, verbose_name='Title')),
                ('text', tinymce.models.HTMLField(default='', max_length=100000, verbose_name='Help Doc Text')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Help Doc',
                'verbose_name_plural': 'Help Docs',
                'ordering': ['title'],
            },
        ),
        migrations.CreateModel(
            name='Instruction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text_html', tinymce.models.HTMLField(default='Text here', verbose_name='Page HTML Text')),
                ('page_number', models.IntegerField(default=1, verbose_name='Page Number')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Instruction Page',
                'verbose_name_plural': 'Instruction Pages',
                'ordering': ['page_number'],
            },
        ),
        migrations.CreateModel(
            name='InstructionSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(default='Name Here', max_length=100, verbose_name='Label')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Instruction Set',
                'verbose_name_plural': 'Instruction Sets',
                'ordering': ['label'],
            },
        ),
        migrations.CreateModel(
            name='Parameters',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contact_email', models.CharField(default='JohnSmith@abc.edu', max_length=1000)),
                ('experiment_time_zone', models.CharField(default='US/Pacific', max_length=1000)),
                ('site_url', models.CharField(default='http://localhost:8000', max_length=200)),
                ('invitation_text', tinymce.models.HTMLField(default='', verbose_name='Invitation Text')),
                ('invitation_subject', models.CharField(default='', max_length=200, verbose_name='Invitation Subject')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Parameters',
                'verbose_name_plural': 'Parameters',
            },
        ),
        migrations.CreateModel(
            name='ParameterSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('period_count', models.IntegerField(default=20, verbose_name='Number of periods')),
                ('period_length', models.IntegerField(default=60, verbose_name='Period Length, Production')),
                ('show_instructions', models.BooleanField(default=True, verbose_name='Show Instructions')),
                ('test_mode', models.BooleanField(default=False, verbose_name='Test Mode')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('instruction_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_sets', to='main.instructionset')),
            ],
            options={
                'verbose_name': 'Parameter Set',
                'verbose_name_plural': 'Parameter Sets',
            },
        ),
        migrations.CreateModel(
            name='ParameterSetPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_players', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Player',
                'verbose_name_plural': 'Parameter Set Players',
            },
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='*** New Session ***', max_length=300)),
                ('start_date', models.DateField(default=django.utils.timezone.now)),
                ('channel_key', models.UUIDField(default=uuid.uuid4, editable=False, verbose_name='Channel Key')),
                ('session_key', models.UUIDField(default=uuid.uuid4, editable=False, verbose_name='Session Key')),
                ('started', models.BooleanField(default=False)),
                ('current_period', models.IntegerField(default=0)),
                ('time_remaining', models.IntegerField(default=0)),
                ('timer_running', models.BooleanField(default=False)),
                ('finished', models.BooleanField(default=False)),
                ('shared', models.BooleanField(default=False)),
                ('locked', models.BooleanField(default=False)),
                ('invitation_text', tinymce.models.HTMLField(default='', verbose_name='Invitation Text')),
                ('invitation_subject', tinymce.models.HTMLField(default='', verbose_name='Invitation Subject')),
                ('soft_delete', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('collaborators', models.ManyToManyField(related_name='sessions_b', to=settings.AUTH_USER_MODEL)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sessions_a', to=settings.AUTH_USER_MODEL)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Session',
                'verbose_name_plural': 'Sessions',
                'ordering': ['-start_date'],
            },
        ),
        migrations.CreateModel(
            name='SessionPeriod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('period_number', models.IntegerField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_periods', to='main.session')),
            ],
            options={
                'verbose_name': 'Session Period',
                'verbose_name_plural': 'Session Periods',
                'ordering': ['period_number'],
            },
        ),
        migrations.CreateModel(
            name='SessionPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_number', models.IntegerField(default=0, verbose_name='Player number')),
                ('player_key', models.UUIDField(default=uuid.uuid4, editable=False, verbose_name='Player Key')),
                ('connecting', models.BooleanField(default=False, verbose_name='Consumer is connecting')),
                ('connected_count', models.IntegerField(default=0, verbose_name='Number of consumer connections')),
                ('name', models.CharField(default='', max_length=100, verbose_name='Full Name')),
                ('student_id', models.CharField(default='', max_length=100, verbose_name='Student ID')),
                ('email', models.EmailField(blank=True, max_length=100, null=True, verbose_name='Email Address')),
                ('earnings', models.IntegerField(default=0, verbose_name='Earnings in cents')),
                ('current_instruction', models.IntegerField(default=0, verbose_name='Current Instruction')),
                ('current_instruction_complete', models.IntegerField(default=0, verbose_name='Current Instruction Complete')),
                ('instructions_finished', models.BooleanField(default=False, verbose_name='Instructions Finished')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set_player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_players_paramterset', to='main.parametersetplayer')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_players', to='main.session')),
            ],
            options={
                'verbose_name': 'Session Player',
                'verbose_name_plural': 'Session Players',
                'ordering': ['player_number'],
            },
        ),
        migrations.CreateModel(
            name='SessionPlayerPeriod',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('session_period', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_player_periods_a', to='main.sessionperiod')),
                ('session_player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_player_periods_b', to='main.sessionplayer')),
                ('earnings', models.IntegerField(default=0, verbose_name='Period Earnings')),
            ],
            options={
                'verbose_name': 'Session Player Period',
                'verbose_name_plural': 'Session Player Periods',
                'ordering': ['session_player__session', 'session_player', 'session_period__period_number'],
            },
        ),
        migrations.CreateModel(
            name='SessionPlayerChat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(default='Chat here', max_length=1000, verbose_name='Chat Text')),
                ('chat_type', models.CharField(choices=[('All', 'All'), ('Individual', 'Individual')], max_length=100, verbose_name='Chat Type')),
                ('time_remaining', models.IntegerField(default=0, verbose_name='Good one amount')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('session_period', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_player_chats_a', to='main.sessionperiod')),
                ('session_player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='session_player_chats_b', to='main.sessionplayer')),
                ('session_player_recipients', models.ManyToManyField(related_name='session_player_chats_c', to='main.sessionplayer')),
            ],
            options={
                'verbose_name': 'Session Player Chat',
                'verbose_name_plural': 'Session Player Chats',
                'ordering': ['timestamp'],
            },
        ),
        migrations.AddConstraint(
            model_name='instructionset',
            constraint=models.UniqueConstraint(fields=('label',), name='unique_instruction_set'),
        ),
        migrations.AddField(
            model_name='instruction',
            name='instruction_set',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='instructions', to='main.instructionset'),
        ),
        migrations.AddConstraint(
            model_name='helpdocs',
            constraint=models.UniqueConstraint(fields=('title',), name='unique_help_doc'),
        ),
        migrations.AddConstraint(
            model_name='sessionplayerperiod',
            constraint=models.UniqueConstraint(fields=('session_player', 'session_period'), name='unique_session_player_period'),
        ),
        migrations.AddConstraint(
            model_name='sessionplayerchat',
            constraint=models.CheckConstraint(check=models.Q(('text', ''), _negated=True), name='text_not_empty'),
        ),
        migrations.AddConstraint(
            model_name='sessionplayer',
            constraint=models.UniqueConstraint(condition=models.Q(('email', ''), _negated=True), fields=('session', 'email'), name='unique_email_session_player'),
        ),
        migrations.AddConstraint(
            model_name='sessionperiod',
            constraint=models.UniqueConstraint(fields=('session', 'period_number'), name='unique_SD'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='private_chat',
            field=models.BooleanField(default=True, verbose_name='Private Chat'),
        ),
        migrations.AlterModelOptions(
            name='parametersetplayer',
            options={'ordering': ['id'], 'verbose_name': 'Parameter Set Player', 'verbose_name_plural': 'Parameter Set Players'},
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='id_label',
            field=models.CharField(default='1', max_length=2, verbose_name='ID Label'),
        ),
        migrations.AlterModelOptions(
            name='parametersetplayer',
            options={'ordering': ['id_label'], 'verbose_name': 'Parameter Set Player', 'verbose_name_plural': 'Parameter Set Players'},
        ),
        migrations.AddField(
            model_name='sessionplayer',
            name='name_submitted',
            field=models.BooleanField(default=False, verbose_name='Name submitted'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='survey_link',
            field=models.CharField(blank=True, default='', max_length=1000, null=True, verbose_name='Survey Link'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='survey_required',
            field=models.BooleanField(default=False, verbose_name='Survey Required'),
        ),
        migrations.AddField(
            model_name='sessionplayer',
            name='survey_complete',
            field=models.BooleanField(default=False, verbose_name='Survey Complete'),
        ),
        migrations.AlterField(
            model_name='sessionplayer',
            name='name',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='Full Name'),
        ),
        migrations.AlterField(
            model_name='sessionplayer',
            name='student_id',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='Student ID'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='json_for_session',
            field=models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True),
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='player_number',
            field=models.IntegerField(default=0, verbose_name='Player number'),
        ),
        migrations.AlterModelOptions(
            name='parametersetplayer',
            options={'ordering': ['player_number'], 'verbose_name': 'Parameter Set Player', 'verbose_name_plural': 'Parameter Set Players'},
        ),
        migrations.AddField(
            model_name='parameterset',
            name='prolific_mode',
            field=models.BooleanField(default=False, verbose_name='Prolific Mode'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='prolific_completion_link',
            field=models.CharField(blank=True, default='', max_length=1000, null=True, verbose_name='Forward to Prolific after sesison'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='reconnection_limit',
            field=models.IntegerField(default=25, verbose_name='Age Warning'),
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='hex_color',
            field=models.CharField(default='0x000000', max_length=8, verbose_name='Hex Color'),
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='start_x',
            field=models.IntegerField(default=50, verbose_name='Start Location X'),
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='start_y',
            field=models.IntegerField(default=50, verbose_name='Start Location Y'),
        ),
        migrations.AddField(
            model_name='session',
            name='world_state',
            field=models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True, verbose_name='Current Session State'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='tokens_per_period',
            field=models.IntegerField(default=100, verbose_name='Number of tokens each period'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='world_height',
            field=models.IntegerField(default=10000, verbose_name='Height of world in pixels'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='world_width',
            field=models.IntegerField(default=10000, verbose_name='Width of world in pixels'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='cool_down_length',
            field=models.IntegerField(default=10, verbose_name='Cool Down Length'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='interaction_length',
            field=models.IntegerField(default=10, verbose_name='Interaction Length'),
        ),
        migrations.CreateModel(
            name='SessionEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('period_number', models.IntegerField(default=1, verbose_name='Period Number')),
                ('time_remaining', models.IntegerField(default=0, verbose_name='Time Remaining')),
                ('type', models.CharField(default='', max_length=255, verbose_name='Event Type')),
                ('data', models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True, verbose_name='Event Data')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('session', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='session_events', to='main.session')),
                ('session_player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='session_events_b', to='main.sessionplayer')),
            ],
            options={
                'verbose_name': 'Session Event',
                'verbose_name_plural': 'Session Events',
                'ordering': ['period_number', '-time_remaining'],
            },
        ),
        migrations.DeleteModel(
            name='SessionPlayerChat',
        ),
        migrations.RemoveField(
            model_name='session',
            name='finished',
        ),
        migrations.RemoveField(
            model_name='session',
            name='current_period',
        ),
        migrations.RemoveField(
            model_name='session',
            name='time_remaining',
        ),
        migrations.AddField(
            model_name='session',
            name='controlling_channel',
            field=models.CharField(default='', max_length=300),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='interaction_range',
            field=models.IntegerField(default=300, verbose_name='Interaction Range'),
        ),
        migrations.RemoveField(
            model_name='session',
            name='timer_running',
        ),
        migrations.AddField(
            model_name='parameterset',
            name='avatar_animation_speed',
            field=models.DecimalField(decimal_places=2, default=1.0, max_digits=3, verbose_name='Animation Speed'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='avatar_bound_box_percent',
            field=models.DecimalField(decimal_places=2, default=0.75, max_digits=3, verbose_name='Avatar Bound Box Percent'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='avatar_move_speed',
            field=models.DecimalField(decimal_places=1, default=5.0, max_digits=3, verbose_name='Move Speed'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='avatar_scale',
            field=models.DecimalField(decimal_places=2, default=1, max_digits=3, verbose_name='Avatar Scale'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='break_frequency',
            field=models.IntegerField(default=7, verbose_name='Break Frequency'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='break_length',
            field=models.IntegerField(default=100, verbose_name='Break Length'),
        ),
        migrations.CreateModel(
            name='ParameterSetNotice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(blank=True, default='Info Here', max_length=200, null=True, verbose_name='Info')),
                ('start_period', models.IntegerField(default=1, verbose_name='Starting Period')),
                ('start_time', models.IntegerField(default=30, verbose_name='Starting Time')),
                ('end_period', models.IntegerField(default=1, verbose_name='Width')),
                ('end_time', models.IntegerField(default=0, verbose_name='Height')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_notices', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Notice',
                'verbose_name_plural': 'Parameter Set Notices',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='ParameterSetWall',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('info', models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info')),
                ('start_x', models.IntegerField(default=50, verbose_name='Location X')),
                ('start_y', models.IntegerField(default=50, verbose_name='Location Y')),
                ('width', models.IntegerField(default=50, verbose_name='Width')),
                ('height', models.IntegerField(default=50, verbose_name='Height')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_walls', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Wall',
                'verbose_name_plural': 'Parameter Set Walls',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='ParameterSetGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, default='Name Here', max_length=255, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_groups', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Group',
                'verbose_name_plural': 'Parameter Set Groups',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='parametersetplayer',
            name='parameter_set_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='parameter_set_players_b', to='main.parametersetgroup'),
        ),
        migrations.CreateModel(
            name='ParameterSetBarrier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('info', models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info')),
                ('start_x', models.IntegerField(default=50, verbose_name='Location X')),
                ('start_y', models.IntegerField(default=50, verbose_name='Location Y')),
                ('width', models.IntegerField(default=50, verbose_name='Width')),
                ('height', models.IntegerField(default=50, verbose_name='Height')),
                ('text', models.CharField(default='Closed until period N', max_length=100, verbose_name='Text')),
                ('rotation', models.IntegerField(default=0, verbose_name='Rotation')),
                ('period_on', models.IntegerField(default=1, verbose_name='Period On')),
                ('period_off', models.IntegerField(default=14, verbose_name='Period Off')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_barriers_a', to='main.parameterset')),
                ('parameter_set_groups', models.ManyToManyField(related_name='parameter_set_barriers_b', to='main.parametersetgroup')),
            ],
            options={
                'verbose_name': 'Parameter Set Barrier',
                'verbose_name_plural': 'Parameter Set Barriers',
                'ordering': ['id'],
            },
        ),
        migrations.AlterField(
            model_name='parameterset',
            name='instruction_set',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='parameter_sets', to='main.instructionset'),
        ),
        migrations.CreateModel(
            name='ParameterSetGround',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('info', models.CharField(blank=True, default='Info Here', max_length=100, null=True, verbose_name='Info')),
                ('x', models.IntegerField(default=50, verbose_name='Location X')),
                ('y', models.IntegerField(default=50, verbose_name='Location Y')),
                ('width', models.IntegerField(default=50, verbose_name='Width')),
                ('height', models.IntegerField(default=50, verbose_name='Height')),
                ('tint', models.CharField(default='0xFFFFFF', max_length=8, verbose_name='Tint (Hex Color)')),
                ('texture', models.CharField(default='Name Here', verbose_name='Texture Name')),
                ('rotation', models.DecimalField(decimal_places=2, default=0, max_digits=3)),
                ('scale', models.DecimalField(decimal_places=2, default=1, max_digits=3)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('parameter_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parameter_set_grounds', to='main.parameterset')),
            ],
            options={
                'verbose_name': 'Parameter Set Ground Element',
                'verbose_name_plural': 'Parameter Set Ground Elements',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='HelpDocsSubject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='', max_length=300, verbose_name='Title')),
                ('text', tinymce.models.HTMLField(default='', max_length=100000, verbose_name='Help Doc Text')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('instruction_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='help_docs_subject', to='main.instructionset')),
            ],
            options={
                'verbose_name': 'Help Doc Subject',
                'verbose_name_plural': 'Help Docs Subject',
                'ordering': ['title'],
            },
        ),
        migrations.AddConstraint(
            model_name='helpdocssubject',
            constraint=models.UniqueConstraint(fields=('instruction_set', 'title'), name='unique_help_doc_subject'),
        ),
        migrations.AddField(
            model_name='parametersetbarrier',
            name='parameter_set_players',
            field=models.ManyToManyField(related_name='parameter_set_barriers_c', to='main.parametersetplayer'),
        ),
    ]
