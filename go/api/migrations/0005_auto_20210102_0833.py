# Generated by Django 3.1.4 on 2021-01-02 08:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_auto_20210101_1223'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='other',
            field=models.CharField(default='', max_length=32),
        ),
        migrations.AddField(
            model_name='game',
            name='start',
            field=models.BooleanField(default=False),
        ),
    ]
