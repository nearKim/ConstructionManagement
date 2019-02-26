# Generated by Django 2.1.7 on 2019-02-24 09:00

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('informations', '0001_initial'),
        ('managements', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='productivityinfo',
            name='work_package',
            field=models.ManyToManyField(related_name='productivities', to='managements.WorkPackage'),
        ),
        migrations.AddField(
            model_name='durationinfo',
            name='work_package',
            field=models.ManyToManyField(related_name='durations', to='managements.WorkPackage'),
        ),
    ]