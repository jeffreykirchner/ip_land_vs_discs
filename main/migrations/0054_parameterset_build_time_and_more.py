# Generated by Django 4.2.8 on 2023-12-07 21:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0053_parameterset_disc_build_length_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameterset',
            name='build_time',
            field=models.IntegerField(default=35, verbose_name='Build Time'),
        ),
        migrations.AddField(
            model_name='parameterset',
            name='seed_build_length',
            field=models.IntegerField(default=1, verbose_name='Seed Build Length'),
        ),
    ]
