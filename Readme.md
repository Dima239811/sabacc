# Автор: Дима

# docker/dima commit version 1
## Контейнер и образы подымаются, чтобы была игра доступна извне надо использовать serveo.net:
ssh -R 80:localhost:3000 serveo.net

## Если устройство, которое будет выступать в качестве сервера, разрешает запросы извне или у

# Не рабоатет
### Если использовать serveo вылетает ошибка Mixed Content: The page at 'https://5398c5327ab3edbcb994c9ece67c8280.serveo.net/' was loaded over HTTPS, but requested an insecure resource 'http://95.79.216.156/v1/users/create/anonymous'. This request has been blocked; the content must be served over HTTPS.
### Сервео докидывает в юрл "s", возможно если без него все работает

#
## фронт работает полностью


## потом докинуть какой-то бесплтаный домен
## в .env писать обязательно путь VITE_API_URL=http://95.79.216.156:8080 чтобы другие пользователи с сети могли попасть



## поднятие всех контейнеров
docker compose --env-file .env up --build --force-recreate