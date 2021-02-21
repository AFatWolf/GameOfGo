release: python manage.py migrate
web: gunicorn -c config/gunicorn.conf.py --pythonpath go go.wsgi:application --log-file -