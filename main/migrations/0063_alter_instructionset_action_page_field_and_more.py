# Generated by Django 4.2.8 on 2024-01-30 00:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0062_alter_sessionevent_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_field',
            field=models.IntegerField(default=4, verbose_name='Required Action: Field'),
        ),
        migrations.AlterField(
            model_name='instructionset',
            name='action_page_interaction',
            field=models.IntegerField(default=5, verbose_name='Required Action: Interaction'),
        ),
    ]
