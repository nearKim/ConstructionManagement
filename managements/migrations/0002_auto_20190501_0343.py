# Generated by Django 2.1.7 on 2019-05-01 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('managements', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='productivity',
            field=models.FloatField(blank=True, null=True, verbose_name='생산성'),
        ),
    ]
