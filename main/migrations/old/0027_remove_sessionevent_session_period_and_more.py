# Generated by Django 4.2.1 on 2023-05-26 18:45

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0026_sessionevent_delete_sessionperiodevent'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sessionevent',
            name='session_period',
        ),
        migrations.AddField(
            model_name='sessionevent',
            name='session',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='session_events', to='main.session'),
            preserve_default=False,
        ),
    ]
