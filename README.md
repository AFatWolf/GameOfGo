# Group-project-2020

## Introduction
Simply put, a multiplayer game of go.

## How to install
Change directory to project:
```
cd go
```
Import `django`, `channel` and `redis-channel`.
```
pip install django channel redis-channel`
```
Imigrate:
```
python manage.py makemigrations
python manage.py migrate
```

## How to run
First, run `redis` server by:
```
sudo service redis-server start
```
Then, start to run server:
```
python manage.py runserver
```

## How to develop frontend more
If your want to develop frontend more, change directory to `go/frontend`. Then, install dependencies:
```
npm install
```
Start from `App.js`, to build file, run:
```
npm run build
```
To develope files, run:
```
npm run dev
```
