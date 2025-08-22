# EraseableChatApp
In-memory chat that never touches the disk.
## Features
- Chats are not touching the disk
- Passwords are accepted as time-based one time passwords (TOTPs)
- Any member can /drop the application
- File transfer is in-memory only

# Setup
1. Java
```
java --version
openjdk 23 2024-09-17
OpenJDK Runtime Environment (build 23+37-2369)
OpenJDK 64-Bit Server VM (build 23+37-2369, mixed mode, sharing)
```
2. Certs (only needed for prod version)

```
sudo certbot certonly --standalone -d placeholderdomaingoeshere.net -d www.placeholderdomaingoeshere.net

cd /etc/letsencrypt/live/placeholderdomaingoeshere.net

sudo openssl pkcs12 -export \
  -in fullchain.pem \
  -inkey privkey.pem \
  -out keystore.p12 \
  -name tomcat \
  -passout pass:a234sdfjyttgfh4sSS

```

## Production
```
cd ~/chatapp/chatapp/; pkill -f 'gradlew.*bootRun' ; nohup ./gradlew bootRun --args='--spring.profiles.active=dev' > /dev/null 2>&1 & sleep 2; ps aux | grep [g]radlew; sleep 15; cat codes.txt
```

## Development
```
cd ~/chatapp/chatapp/; pkill -f 'gradlew.*bootRun' ; nohup ./gradlew bootRun --args='--spring.profiles.active=prod' > /dev/null 2>&1 & sleep 2; ps aux | grep [g]radlew; sleep 15; cat codes.txt
```
