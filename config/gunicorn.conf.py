def when_ready(server):
    open('/tmp/app-initialized', 'w').close()

bind = '0.0.0.0:8000'
# worker_class = 'gevent'  # not necessary
# timeout = 90  # not necessary