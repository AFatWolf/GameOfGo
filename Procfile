release: python manage.py migrate
web: cd go;daphne -b 0.0.0.0 -p 8001 go.asgi:application
worker: python go/manage.py runworker
