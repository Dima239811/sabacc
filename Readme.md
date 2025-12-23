# Sabacc game

## Запуск игры 

Перед работой с докером в Idea с помощью команды ctrl+shift+R заменяем ip 45.89.66.57 на свой

Необходимо собрать фронт следующими командами:

`cd frontend `

`rmdir /s /q dist`

`npm run build`

Если команду npm не распознает необходимо установить npm командой:

`npm i`

После чего поднимаем все контейнеры:

`docker compose --env-file .env up --build --force-recreate`

После чего публикуем контейнеры на свой docker hub и заливаем на сервер.
