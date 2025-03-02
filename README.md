# KubePilot
KubePilot helps you track deployed images, monitor deployment health, update images, and visualize logs.
Main intention is to use this for your local/staging setup where alerting is not there.

# Features
1. Track deployed images
2. Monitor deployment health
3. Update images
4. Visualize logs
5. In-browser notifications

# Screenshots
Refer to [screenshots/screenshots.md](screenshots/screenshots.md)

# How to run

## Prerequisites
1. node
2. npm
3. kubectl

## Steps
1. Clone the repository
2. Run 
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
