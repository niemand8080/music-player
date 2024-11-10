# Music Player

Play your music...

## Backend

To use the HTTPS localhost dev server you need to create a cert.pem and key.pem file in your backend folder. 
You can do that with the following command `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes`. Run the command inside the backend folder