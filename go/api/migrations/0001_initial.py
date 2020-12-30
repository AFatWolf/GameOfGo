# Generated by Django 3.1.4 on 2020-12-30 11:39

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Chatline',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_channel_code', models.CharField(default=api.models.generate_chat_channel_code, max_length=6, unique=True)),
                ('line', models.TextField(max_length=255)),
                ('time', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='New Game', max_length=50)),
                ('board_state', models.CharField(default='', max_length=361)),
                ('code', models.CharField(default=api.models.generate_game_code, max_length=6, unique=True)),
                ('chat_channel_code', models.CharField(default=api.models.generate_chat_channel_code, max_length=6, unique=True)),
                ('host', models.CharField(max_length=10, unique=True)),
                ('can_spectate', models.BooleanField(default=False)),
                ('board_size', models.IntegerField(default=19)),
                ('time_start', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
