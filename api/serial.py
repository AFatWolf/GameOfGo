from rest_framework import serializers
from .models import Game,Player,Account

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = (
            'id', 'board_size', 'code', 'chat_channel_code', 
            'host', 'can_spectate', 'time_start', 'board_state',
            'white_is_host', 'playing_color', 'name', 'other',
        )

class CreateGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = (
            'board_size', 'can_spectate', 'name',
        )

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = (
            'id', 'game_id', 'is_playing', 'is_spectating', 'chat_id', 'avatar_url',
            'elo',
        )

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    class Meta:
        model = Account
        fields = ['username', 'name', 'password', 'password2']
        extra_kwargs={
            'password': {'write_only': True}
        }
    
    def save(self):
        account = Account(
            username = self.validated_data['username']
        )
        name = self.validated_data['name']
        password = self.validated_data['password']
        password2 = self.validated_data['password2']
    
        if password != password2:
            raise serializers.ValidationError({'password': 'Passwords must match'})
        account.set_password(password)

        if name != "":
            account.name = name

        account.save()
        return account

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['username', 'last_login', 'elo']
