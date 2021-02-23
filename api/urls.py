from .views import *
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
import rest_framework

urlpatterns = [
    path('games', GameView.as_view()),
    path('get-game', GetGame.as_view()),
    path('create-game', CreateGameView.as_view()),
    path('join-game', JoinGame.as_view()),
    path('update-game', UpdateGame.as_view()),
    path('signup', SignupView.as_view()),
    path('is-logged-in', IsLoggedIn.as_view()),
    path('leave-game', LeaveGame.as_view()),
    path('users/', UserList.as_view()),
    path('users/<int:pk>/', UserDetail.as_view()),
    path('details', UserDetailsView.as_view()),
]