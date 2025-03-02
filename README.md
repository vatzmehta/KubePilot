# KubePilot
KubePilot helps you track deployed images, monitor deployment health, update images, and visualize logs.
Main intention is to use this for your local/staging setup where alerting is not there.

# Features
1. Track deployed images
2. Monitor deployment health
3. Update images
4. Visualize logs
5. In-browser notifications
6. Json Parsed Logs via CLI

# Screenshots
Refer to [screenshots/screenshots.md](screenshots/screenshots.md)

# How to run

## Prerequisites
1. node
2. npm
3. kubectl
4. Make sure to set your $DEVSTACK_LABEL in environment variables. 

## Steps
1. Clone the repository
2. Move Scripts to any place which is in your PATH. (in this case, path is /usr/local/bin ⚠️ sudo access required️)
```
cp scripts/* /usr/local/bin
```
3. Check if scripts are accessible
```
which updateImage
which podLogs
```
4. Run 
```
npx shadcn@latest add button card dialog
npm install lucide-react
```
3. Start backend server
```
cd backend
node server.js
```
4. Start the Frontend Development Server
```
cd KubePilot
npm start
```

5. Access the Application (Check the port in terminal once, default 3000)
```
    Open your browser and navigate to: http://localhost:3000
```


## CLI Logs Steps

1. Run the below command to get logs via a single command
```
podLogs <namespace>
```
2. Run the below command to get JSON parsed logs
```
podLogs <namespace> true
```

Example:
```
podLogs api 
```

