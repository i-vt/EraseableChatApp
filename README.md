# EraseableChatApp
In-memory chat that never touches the disk.

# Setup
1. Java
```
java --version
openjdk 23 2024-09-17
OpenJDK Runtime Environment (build 23+37-2369)
OpenJDK 64-Bit Server VM (build 23+37-2369, mixed mode, sharing)
```
2. Certs
```
sudo certbot certonly --standalone -d advertisementcdn.site -d www.advertisementcdn.site
```

## Production
```
cd ~/chatapp/chatapp/; pkill -f 'gradlew.*bootRun' ; nohup ./gradlew bootRun --args='--spring.profiles.active=dev' > /dev/null 2>&1 & sleep 2; ps aux | grep [g]radlew; sleep 15; cat codes.txt
```

## Development
```
cd ~/chatapp/chatapp/; pkill -f 'gradlew.*bootRun' ; nohup ./gradlew bootRun --args='--spring.profiles.active=prod' > /dev/null 2>&1 & sleep 2; ps aux | grep [g]radlew; sleep 15; cat codes.txt
```
