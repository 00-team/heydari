import multiprocessing

chdir = '/heydari/'
# workers = multiprocessing.cpu_count() * 2 + 1
threads = multiprocessing.cpu_count() * 2 + 1
wsgi_app = 'main:app'
proc_name = 'heydari gun'
worker_class = 'uvicorn.workers.UvicornWorker'
venv = '/heydari/.env/bin/activate'
bind = 'unix:///usr/share/nginx/sockets/heydari.sock'
loglevel = 'info'
accesslog = '/var/log/heydari/access.log'
acceslogformat = '%(h)s %(l)s %(u)s %(t)s %(r)s %(s)s %(b)s %(f)s %(a)s'
errorlog = '/var/log/heydari/error.log'
