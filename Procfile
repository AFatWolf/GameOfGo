release: python manage.py migrate
web: daphne -b 0.0.0.0 -p 8001 go.asgi:application
worker: python manage.py runworker
