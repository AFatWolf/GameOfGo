from django.shortcuts import render
from django.conf import settings
from rest_framework import serializers, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Game, Account
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
                data['is_host'] = self.request.session.session_key == game[0].host
                data['chat_log'] = [{'sender': 'thanh', 'message': query.line} for query in Chatline.objects.filter(chat_channel_code=game[0].chat_channel_code)]
                print(data['chat_log'])
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
                data = GameSerializer(games[0]).data
                data['is_host'] = self.request.session.session_key == games[0].host
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
            board_state = "." * (board_size**2)
            host = self.request.session.session_key
            queryset = Game.objects.filter(host=host)
            if queryset.exists():
                game = queryset[0]
                game.can_spectate = can_spectate
                # game.board_size = board_size
                game.save(update_fields=['can_spectate'])
                return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
            else:
                game = Game(host=host, can_spectate=can_spectate, board_size=board_size, board_state=board_state)
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
