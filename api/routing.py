# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/game/(?P<code>\w+)/$", consumers.GoConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<chat_channel_code>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/lobby/$", consumers.LobbyConsumer.as_asgi()),
    re_path(r"ws/wait/(?P<code>\w+)/$", consumers.WaitConsumer.as_asgi()),
]