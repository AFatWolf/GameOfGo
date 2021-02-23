import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer
from rest_framework.status import HTTP_202_ACCEPTED
from .models import *
from .go_board_helper.go import Position, BLACK, WHITE, IllegalMove
from .serial import GameSerializer

class GoConsumer(JsonWebsocketConsumer):
    # naive implementation
    def connect(self):
        self.code = self.scope['url_route']['kwargs']['code']
        self.game_group_name = 'game_%s' % self.code
        
        async_to_sync(self.channel_layer.group_add)(
            self.game_group_name,
            self.channel_name
        )
        self.accept()
    
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.game_group_name,
            self.channel_name
        )

    # Receive play move from player
    def receive(self, text_data):
        # Decode board state from JSON
        text_data_json = json.loads(text_data)
        games = Game.objects.filter(code=self.code)
        if len(games) > 0:
            game = games[0]
            # leave game results in end game
            if "signal" in text_data_json.keys(): 
                if text_data_json['signal'] == "pass":
                    game.passes += 1
                    if game.passes >= 2:
                        scores = Position(board=game.board_state, ko=-1).score()
                        game.delete()
                        async_to_sync(self.channel_layer.group_send)(
                            self.game_group_name,
                            {
                                'type': 'end_game',
                                'scores': scores
                            }
                        )
                    else:
                        if game.playing_color == "white":
                            game.playing_color = "black"
                        else:
                            game.playing_color = "white"
                        new_state = game.board_state
                        game.save(update_fields=['board_state', 'passes', 'playing_color'])
                        # Send the updated board state to both players
                        async_to_sync(self.channel_layer.group_send)(
                            self.game_group_name,
                            {
                                'type': 'play_move',
                                'board_state': new_state
                            }
                        )
                elif text_data_json["signal"] == "end_game":
                    username = self.scope["user"].username
                    if (username == game.host and game.white_is_host == True) or (username == game.other and game.white_is_host == False):
                        white = -1
                        black = 19 * 19
                    else:
                        white = 19 * 19
                        black = -1
                    scores = {'black': black, 'white': white}
                    game.delete()
                    async_to_sync(self.channel_layer.group_send)(
                        self.game_group_name,
                        {
                            'type': 'end_game',
                            'scores': scores
                        }
                    )
            else:
                # Change board state on db
                try:
                    position = Position(board=game.board_state, ko=game.ko).play_move(fc=text_data_json["ko"], color=text_data_json["color"])
                except IllegalMove as error:
                    self.send(text_data=json.dumps({'message': str(error)}))
                else:
                    game.board_state = position.get_board()
                    if game.playing_color == "white":
                        game.playing_color = "black"
                    else:
                        game.playing_color = "white"
                    game.ko = text_data_json["ko"]
                    game.passes = 0
                    new_state = game.board_state
                    game.save(update_fields=['board_state', 'ko', 'passes', 'playing_color'])
                    # Send the updated board state to both players
                    async_to_sync(self.channel_layer.group_send)(
                        self.game_group_name,
                        {
                            'type': 'play_move',
                            'board_state': new_state
                        }
                    )

    # Receive play move from game group
    def play_move(self, event):
        move = event['board_state']

        # Send message to WebSocket
        self.send(text_data=json.dumps({'board_state': event["board_state"]}))
        
    def end_game(self, event):
        scores = event['scores']
        self.send(text_data=json.dumps({'scores': scores, 'signal': 'end_game'}))
                  
class ChatConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.chat_channel_code = self.scope['url_route']['kwargs']['chat_channel_code']
        self.chat_group_name = 'chat_%s' % self.chat_channel_code

        async_to_sync(self.channel_layer.group_add)(
            self.chat_group_name,
            self.channel_name
        )

        self.accept()
    
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_group_name,
            self.channel_name
        )

    # Receive play move from player
    def receive(self, text_data):
        # Get message JSON
        text_data_json = json.loads(text_data)
        # Create new chatline entry
        message = text_data_json["message"]
        sender = self.scope["user"].username
        print("Sender %s" % sender)
        chat_line = Chatline(line=message, sender=sender, chat_channel_code=self.chat_channel_code)
        chat_line.save()
    
        # Send the updated board state to both players
        async_to_sync(self.channel_layer.group_send)(
            self.chat_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender
            }
        )

    # Receive play move from game group
    def chat_message(self, event):
        move = event['message']
        # Send message to WebSocket
        self.send(text_data=json.dumps({'sender': event['sender'], 'message': event["message"]}) )
        
class LobbyConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.chat_group_name = 'lobby'

        async_to_sync(self.channel_layer.group_add)(
            self.chat_group_name,
            self.channel_name
        )

        self.accept()
    
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_group_name,
            self.channel_name
        )

    # Receive request
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'signal' in text_data_json:
            if text_data_json["signal"] == "create-game":
                async_to_sync(self.channel_layer.group_send)(
                    self.chat_group_name,
                    {
                        'type': 'list_games',
                        'games': list(Game.objects.all().values('host', 'name', 'code'))
                    }
                )
    
    def list_games(self, event):
        games = event["games"] 
        print(games)
        self.send(text_data=json.dumps(games))
        
class WaitConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.wait_group_name = 'wait_%s' % self.scope['url_route']['kwargs']['code']

        async_to_sync(self.channel_layer.group_add)(
            self.wait_group_name,
            self.channel_name
        )

        self.accept()
    
    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.wait_group_name,
            self.channel_name
        )

    # Receive request
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if 'signal' in text_data_json:
            if text_data_json["signal"] == "start-game":
                async_to_sync(self.channel_layer.group_send)(
                    self.wait_group_name,
                    {
                        'type': 'start_game',
                        'signal': 'start-game'
                    }
                )
    
    def start_game(self, event):
        signal = event["signal"] 
        self.send(text_data=json.dumps({'signal': signal}))