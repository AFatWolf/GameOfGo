from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import MinLengthValidator
# from django.contrib.postgres.fields import ArrayField
# from .helper import *
import string, random
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings

BOARD_SIZE = 19

def generate_code():
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_letters, k=length))
        if Game.objects.filter(code = code).count() == 0:
            break
    return code



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

    USERNAME_FIELD = 'username'
    REQUIRED_FIELD = ['username']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return True
    
    objects = MyAccountManager()

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class Player(models.Model):
    # user_id = models.ForeignKey(Account, on_delete = models.CASCADE)
    game_id = models.ForeignKey('Game', on_delete = models.SET_NULL, blank = True, null = True)
    is_playing = models.BooleanField(null= False, default = False)
    is_spectating = models.BooleanField(null= False, default = False)
    chat_id = models.ForeignKey('Chatline', on_delete = models.SET_NULL, blank = True, null = True)
    avatar_url = models.CharField(max_length=255, default="")
    elo = models.IntegerField(null=False, default = 1000)

class Game(models.Model):
    # player1_id = models.ForeignKey(Player, related_name="P1", on_delete = models.SET_NULL, blank = True, null = True)
    # player2_id = models.ForeignKey(Player, related_name="P2", on_delete = models.SET_NULL, blank = True, null = True)
    board_state = models.CharField(default="", max_length=BOARD_SIZE**2)
    code = models.CharField(default=generate_code, unique=True, max_length=6)
    host = models.CharField(max_length=10, unique=True)
    can_spectate = models.BooleanField(default=False, null=False)
    board_size = models.IntegerField(null=False, default=19)
    #player_turn = models.IntergerField(null=False, defalut = 0)
    time_start = models.DateTimeField(auto_now_add = True)
    # time_end = models.DateTimeField(auto_now_add = True)

class Chatline(models.Model):
    game_id = models.ForeignKey(Game, on_delete = models.CASCADE)
    chat_id = models.CharField(max_length=255, default="")
    sayer = models.ForeignKey(Player, on_delete = models.SET_NULL, blank = True, null = True)
    line = models.CharField(max_length=255, default="")
    time = models.DateTimeField(auto_now_add = True)