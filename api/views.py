from django.shortcuts import render
from django.conf import settings
from rest_framework import serializers, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import *
from .serial import GameSerializer, CreateGameSerializer, LoginSerializer, SignupSerializer
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token

# Create your views here.

# Connect to our Redis instance
# conn = redis.StrictRedis(host=settings.REDIS_HOST,
#                         port=settings.REDIS_PORT, db=0)

class GameView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

# get game using game_code
class GetGame(APIView):
    serializer_class = GameSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            game = Game.objects.filter(code=code)
            if len(game) > 0:
                data = GameSerializer(game[0]).data
                data['is_host'] = self.request.user.username == game[0].host
                data['white_is_host'] = game[0].white_is_host
                data['host'] = game[0].host
                data['other'] = game[0].other
                data['playing_color'] = game[0].playing_color
                data['chat_log'] = [{'sender': query.sender, 'message': query.line} for query in Chatline.objects.filter(chat_channel_code=game[0].chat_channel_code)]
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

# udpate game after a move
# move to consumer
class UpdateGame(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        board_state = request.data.get('board_state')
        code = request.data.get('code')
        if code != None:
            games = Game.objects.filter(code=code)
            if len(games) > 0:
                game = games[0]
                game.board_state = board_state
                game.save(update_fields=["board_state"])
                data = GameSerializer(games[0]).data
                data['is_host'] = self.request.session.session_key == games[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class JoinGame(APIView):
    serializer_class = GameSerializer
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            games = Game.objects.filter(code=code)
            if len(games) > 0:
                if games[0].start == True:
                    return Response({'Bad Request': 'Room is occupied.'}, status=status.HTTP_400_BAD_REQUEST)
                game = games[0]
                game.other = self.request.user.username
                game.start = True
                game.save()
                data = GameSerializer(game).data
                data['is_host'] = self.request.session.session_key == game.host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class CreateGameView(APIView):
    serializer_class = CreateGameSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            board_size = serializer.data.get('board_size')
            board_state = "."*(board_size*board_size)
            can_spectate = serializer.data.get('can_spectate')
            name = serializer.data.get('name')
            host = self.request.user.username
            print(host)
            white_is_host = True
            queryset = Game.objects.filter(host=host)
            if queryset.exists():
                game = queryset[0]
                game.can_spectate = can_spectate
                # game.board_size = board_size
                game.save(update_fields=['can_spectate'])
                return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
            else:
                game = Game(host=host, white_is_host=white_is_host, can_spectate=can_spectate, 
                        board_size=board_size, board_state=board_state, name=name)
                game.save()
                return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
# @api_view(['POST'])
# def registration_view(request):
#     #queryset = Account.objects.all() # For DEBUG
#     if request.method == 'POST':
#         serializer = SignupSerializer(data=request.data)
#         data={}
#         print(request.data)
#         if serializer.is_valid():
#             account = serializer.save()
#             data['response'] = "Successfully registered a new account."
#             data['username'] = account.username
#             data['name'] = account.name
#             token = Token.objects.get(user=account).key
#             data['token'] = token
#         else:
#             data = serializer.errors
#         return Response(data)

class SignupView(generics.CreateAPIView):
    #queryset = Account.objects.all() # For DEBUG
    serializer_class = SignupSerializer

    def post(self, request, format=None):
        serializer = SignupSerializer(data=request.data)
        data={}
        if serializer.is_valid():
            account = serializer.save()
            data['response'] = "Successfully registered a new account."
            data['username'] = account.username
            data['name'] = account.name
            token = Token.objects.get(user=account).key
            data['token'] = token
        else:
            data = serializer.errors
        return Response(data)

class IsLoggedIn(APIView):
    def post(self, request, format=None):
        if request.user.is_authenticated:
            gameHost = Game.objects.filter(host=request.user.username)
            gamePlay = Game.objects.filter(other=request.user.username)
            if len(gameHost) != 0:
                code = gameHost[0].code
            elif len(gamePlay) != 0:
                code = gamePlay[0].code
            else:
                code = ""
            username = self.request.user.username
            return Response({'is_logged_in': True, 'username': username, 'code': code}, status=status.HTTP_200_OK)
        else:
            return Response({'is_logged_in': False}, status=status.HTTP_200_OK)

class LeaveGame(APIView):
    def post(self, request, format=None):
        username = self.request.user.username
        gameHost = Game.objects.filter(host=username)
        gamePlay = Game.objects.filter(other=username)
        if len(gameHost) > 0:
            game = gameHost[0]
            game.host = ""
            # game.delete()
            return Response({"message": "Delete game successfully."}, status=status.HTTP_200_OK)
        elif len(gamePlay):
            game = gamePlay[0]
            game.other = ""
            # game.start = False
            # game.delete()
            return Response({"message":"Leave game successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"Bad request": "You are not in any room."}, status=status.HTTP_400_BAD_REQUEST)

class UserList(generics.ListAPIView):
    queryset = Account.objects.all()
    serializer_class = LoginSerializer

class UserDetail(generics.RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = LoginSerializer

class LoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        data={}

        # user = SessionAuthentication.authenticate(request)
        # if user != None:
        #     data['user'] = user
        #     return Response(data)
        # else:
        #     pass
        
        if serializer.is_valid():
            user = BasicAuthentication(request)
            print(user)
            if user == None:
                data['response'] = 'User not found'
                return Response(data, status=status.HTTP_404_NOT_FOUND)
            else:
                data['username'] = user.username
                return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'Not Found': 'Bs'}, status=status.HTTP_404_NOT_FOUND)

class UserDetailsView(generics.RetrieveUpdateAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.

    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk, email

    Returns UserModel fields.
    """
    serializer_class = LoginSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user
