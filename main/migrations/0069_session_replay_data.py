# Generated by Django 4.2.11 on 2024-05-21 17:51

import django.core.serializers.json
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0068_remove_parameterset_instruction_set_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='replay_data',
            field=models.JSONField(blank=True, encoder=django.core.serializers.json.DjangoJSONEncoder, null=True, verbose_name='Replay Data'),
        ),
    ]
