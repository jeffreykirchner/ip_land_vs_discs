# Generated by Django 4.2.8 on 2023-12-15 22:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0057_parameterset_disc_value_parameterset_seed_multipiers'),
    ]

    operations = [
        migrations.RenameField(
            model_name='parameterset',
            old_name='seed_multipiers',
            new_name='seed_multipliers',
        ),
    ]
