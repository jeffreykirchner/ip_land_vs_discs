# Generated by Django 4.2.9 on 2024-01-18 21:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0060_sessionperiod_summary_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parameterset',
            name='seed_build_length',
            field=models.DecimalField(decimal_places=1, default=0.5, max_digits=3, verbose_name='Seed Build Length'),
        ),
    ]
