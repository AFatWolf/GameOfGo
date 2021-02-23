from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import MinLengthValidator
import string, random
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings

BOARD_SIZE = 19

def generate_game_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_letters, k=length))
        if Game.objects.filter(code = code).count() == 0:
            break
    return code

def generate_chat_channel_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_letters, k=length))
        if Chatline.objects.filter(chat_channel_code=code).count() == 0:
            break
    return code


# Create your models here.
# class Player(models.Model):
#     game_id = models.ForeignKey('Game', on_delete = models.SET_NULL, blank = True, null = True)
#     is_playing = models.BooleanField(null= False, default = False)
#     is_spectating = models.BooleanField(null= False, default = False)
#     chat_id = models.ForeignKey('Chatline', on_delete = models.SET_NULL, blank = True, null = True)
#     avatar_url = models.CharField(max_length=255, default="")
#     elo = models.IntegerField(null=False, default = 1000)

# Create your models here.

class MyAccountManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError("Username is required")

        user = self.model(
            username = username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password):
        user = self.create_user(
            username = username,
            password = password
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Account(AbstractBaseUser):
    username = models.CharField(max_length=32, validators=[MinLengthValidator(4)], unique = True)
    name = models.CharField(max_length=32, default="Vladimir")
    date_joined = models.DateTimeField(verbose_name='date joined', auto_now_add=True)
    last_login = models.DateTimeField(verbose_name='last login', auto_now=True)
    is_admin = models.BooleanField(default = False)
    is_active = models.BooleanField(default = True)
    is_staff = models.BooleanField(default = False)
    is_superuser = models.BooleanField(default = False)
    elo = models.IntegerField(default=0)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELD = ['username']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return True
    
    objects = MyAccountManager()

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)

class Player(models.Model):
    # user_id = models.ForeignKey(Account, on_delete = models.CASCADE)
    game_id = models.ForeignKey('Game', on_delete = models.SET_NULL, blank = True, null = True)
    is_playing = models.BooleanField(null= False, default = False)
    is_spectating = models.BooleanField(null= False, default = False)
    chat_id = models.ForeignKey('Chatline', on_delete = models.SET_NULL, blank = True, null = True)
    avatar_url = models.CharField(max_length=255, default="")
    elo = models.IntegerField(null=False, default = 1000)

class Game(models.Model):
    # whose is white
    white_is_host = models.BooleanField(default=True, null=False)
    playing_color = models.CharField(default="white", max_length=32, null=False)
    name = models.CharField(default="New Game", max_length=50, null=False)
    board_state = models.CharField(default="", max_length=BOARD_SIZE**2)
    ko = models.IntegerField(default=-1)
    code = models.CharField(default=generate_game_code, unique=True, max_length=6)
    chat_channel_code = models.CharField(default=generate_chat_channel_code, unique=True, max_length=6)
    host = models.CharField(max_length=10, unique=True)
    passes = models.IntegerField(default=0)
    other = models.CharField(max_length=32, default="")
    start = models.BooleanField(default=False)
    can_spectate = models.BooleanField(default=False, null=False)
    board_size = models.IntegerField(null=False, default=19)
    #player_turn = models.IntergerField(null=False, defalut = 0)
    time_start = models.DateTimeField(auto_now_add = True)
    # time_end = models.DateTimeField(auto_now_add = True)

class Chatline(models.Model):
    # game_id = models.ForeignKey(Game, on_delete = models.CASCADE)
    chat_channel_code = models.CharField(max_length=255, default="")
    sender = models.CharField(max_length=32)
    # sayer = models.ForeignKey(Player, on_delete = models.SET_NULL, blank = True, null = True)
    line = models.CharField(max_length=255, default="")
    time = models.DateTimeField(auto_now_add = True)