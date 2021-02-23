from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.
class Player(models.Model):
    game_id = models.ForeignKey('Game', on_delete = models.SET_NULL, blank = True, null = True)
    is_playing = models.BooleanField(null= False, default = False)
    is_spectating = models.BooleanField(null= False, default = False)
    chat_id = models.ForeignKey('Chatline', on_delete = models.SET_NULL, blank = True, null = True)
    avatar_url = models.CharField(max_length=255, default="")
    elo = models.IntegerField(null=False, default = 1000)

class Game(models.Model):
    player1_id = models.ForeignKey(Player, related_name="P1", on_delete = models.SET_NULL, blank = True, null = True)
    player2_id = models.ForeignKey(Player, related_name="P2", on_delete = models.SET_NULL, blank = True, null = True)
    board_state = ArrayField(
        ArrayField(
            models.IntegerField(null=False, default=0),
            size=19,
        ),
        size=19,
    )
    #player_turn = models.IntergerField(null=False, defalut = 0)
    time_start = models.DateTimeField(auto_now_add = True)
    time_end = models.DateTimeField(auto_now_add = True)

class Chatline(models.Model):
    game_id = models.ForeignKey(Game, on_delete = models.CASCADE)
    chat_id = models.CharField(max_length=255, default="")
    sayer = models.ForeignKey(Player, on_delete = models.SET_NULL, blank = True, null = True)
    line = models.CharField(max_length=255, default="")
    time = models.DateTimeField(auto_now_add = True)