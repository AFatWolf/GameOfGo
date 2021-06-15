web: daphne -b 0.0.0.0 -p 8001 -e ssl:443:privateKey=key.pem:certKey=crt.pem go.asgi:application
worker: python manage.py runworker
