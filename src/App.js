import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Bell, AlertTriangle, RefreshCw, CheckCircle, Terminal } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Textarea } from "./components/ui/textarea";
import { useRef } from "react";

// import React, { useState, useEffect } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Bell, AlertTriangle, RefreshCw, CheckCircle, Terminal } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';

// This component would be the frontend, and you'd need a small backend service to handle the CLI commands
const KubernetesDashboard = () => {
  // State variables
  const [devstackLabel, setDevstackLabel] = useState('');
  const [isLabelSet, setIsLabelSet] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPod, setSelectedPod] = useState('');
  const [logs, setLogs] = useState('');
  const [parseWithJq, setParseWithJq] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImageId, setNewImageId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [podOptions, setPodOptions] = useState([]);
  const [deploymentOptions, setDeploymentOptions] = useState([]);
  const [commandOutput, setCommandOutput] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [activeTab, setActiveTab] = useState("deployments"); // Add state for active tab

  // Function to execute a kubectl or helmfile command
  const executeCommand = async (command) => {
    setIsLoading(true);
    setLastCommand(command);
    setShowTerminal(true);
    
    try {
      // In a real implementation, this would make a fetch call to your backend
      // which would execute the command and return the result
      const response = await fetch('/api/execute-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      const data = await response.json();
      setCommandOutput(data.output);
      return data.output;
    } catch (error) {
      setCommandOutput(`Error executing command: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Parse kubectl output to get deployments
  // Parse kubectl output to get deployments
const parseDeployments = (output, label) => {
  try {
    // This is a simplified parser - adjust based on your kubectl output format
    const lines = output.trim().split('\n');
    if (lines.length <= 1) return [];
    
    const deployments = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/);
      if (parts.length >= 4) { // Updated to match the new format with 4 columns
        const namespace = parts[0];
        const name = parts[1];
        const ready = parts[2];
        const image = parts[3]; // Might need adjustment based on the actual output
        
        deployments.push({
          name,
          namespace,
          image,
          status: ready.startsWith('0') ? 'NotReady' : 'Running',
          pods: parseInt(ready.split('/')[1], 10)
        });
      }
    }
    return deployments;
  } catch (error) {
    console.error('Error parsing deployments:', error);
    return [];
  }
};
  // const parseDeployments = (output, label) => {
  //   try {
  //     // This is a simplified parser - adjust based on your kubectl output format
  //     const lines = output.trim().split('\n');
  //     if (lines.length <= 1) return [];
      
  //     const deployments = [];
  //     // Skip header line
  //     for (let i = 1; i < lines.length; i++) {
  //       const parts = lines[i].split(/\s+/);
  //       if (parts.length >= 3 && parts[0].includes(label)) {
  //         const namespace = parts[0].split('/')[0];
  //         const name = parts[0].split('/')[1];
  //         const ready = parts[1];
  //         const image = parts[2]; // Simplified - actual parsing may be more complex
          
  //         deployments.push({
  //           name,
  //           namespace,
  //           image,
  //           status: ready.startsWith('0') ? 'NotReady' : 'Running',
  //           pods: parseInt(ready.split('/')[1], 10)
  //         });
  //       }
  //     }
  //     return deployments;
  //   } catch (error) {
  //     console.error('Error parsing deployments:', error);
  //     return [];
  //   }
  // };

  // Parse kubectl output to get pods
  const parsePods = (output, label) => {
    try {
      const lines = output.trim().split('\n');
      if (lines.length <= 1) return [];
      
      const pods = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/);
        if (parts.length >= 3 && parts[0].includes(label)) {
          const namespace = parts[0].split('/')[0];
          const name = parts[0].split('/')[1];
          const status = parts[2];
          
          pods.push({
            name,
            namespace,
            status
          });
        }
      }
      return pods;
    } catch (error) {
      console.error('Error parsing pods:', error);
      return [];
    }
  };

  const [initialDeployments, setInitialDeployments] = useState([]);
  const initialDeploymentsRef = useRef([]); // Store initial deployments

  // Handle devstack label submission
  const handleLabelSubmit = async () => {
    if (devstackLabel.trim()) {
      setIsLabelSet(true);
      
      // Get all deployments across namespaces with the label
      const command = `kubectl get deployments --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,DEPLOYMENT:.metadata.name,READY:.status.readyReplicas/.status.replicas,IMAGE:.spec.template.spec.containers[0].image" | awk -v label="${devstackLabel}" '$2 ~ label'`;
      const output = await executeCommand(command);
      
      if (output) {
        const parsedDeployments = parseDeployments(output, devstackLabel);
        setDeployments(parsedDeployments);
        initialDeploymentsRef.current = parsedDeployments; 
        // setInitialDeployments(parsedDeployments); // Store initial state
        // console.log("Initial Deployments:", parsedDeployments);
        console.log("Stored Initial Deployments:", initialDeploymentsRef.current);

        
        // Generate deployment options for the dropdown
        const deploymentOpts = parsedDeployments.map(d => ({
          value: `${d.namespace}/${d.name}`,
          label: `${d.name} (${d.namespace})`
        }));
        setDeploymentOptions(deploymentOpts);
        
        // Get pods to populate the logs dropdown
        const podsCommand = `kubectl get pods --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,STATUS:.status.phase" | grep ${devstackLabel}`;
        const podsOutput = await executeCommand(podsCommand);

        if (podsOutput) {
          const parsedPods = podsOutput
            .trim()
            .split("\n")
            .map(line => {
              const parts = line.split(/\s+/);
              if (parts.length >= 3) {
                return {
                  value: `${parts[0]}/${parts[1]}`, // Namespace/PodName
                  label: `${parts[1]} (${parts[0]})`
                };
              }
              return null;
            })
            .filter(Boolean);

          setPodOptions(parsedPods);
        }

        // const podsCommand = `kubectl get pods --all-namespaces -o custom-columns=POD:.metadata.namespace/.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase | grep ${devstackLabel}`;
        // const podsOutput = await executeCommand(podsCommand);
        
        // if (podsOutput) {
        //   const parsedPods = parsePods(podsOutput, devstackLabel);
        //   const podOpts = parsedPods.map(p => ({
        //     value: `${p.namespace}/${p.name}`,
        //     label: `${p.name} (${p.namespace})`
        //   }));
        //   setPodOptions(podOpts);
        // }
        
        // Check for problematic pods
        checkPodHealth();

      }
    }
  };

  // Check pod health and generate notifications
  const checkPodHealth = async () => {
    const command = `kubectl get pods --all-namespaces | grep -E '(${devstackLabel}).*?(CrashLoopBackOff|ImagePullBackOff|Error|Failed)'`;
    const output = await executeCommand(command);
    
    if (output && output.trim()) {
      const newNotifications = [];
      const lines = output.trim().split('\n');
      
      lines.forEach((line, index) => {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
          const namespace = parts[0];
          const podName = parts[1];
          const status = parts[2];

          const message = `Pod ${podName} in namespace ${namespace} is in ${status} state`;
          showBrowserNotification("Pod Issue Detected", message);
          
          newNotifications.push({
            id: Date.now() + index,
            message: message,
            severity: 'error',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    }
  };


const checkDeploymentHealth = async () => {
  console.log("Running Deployment Health Check...");

  const command = `kubectl get deployments --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,DEPLOYMENT:.metadata.name" | grep ${devstackLabel}`;
  const output = await executeCommand(command);

  if (output) {
    const currentDeployments = output
      .trim()
      .split("\n")
      .map(line => {
        const parts = line.split(/\s+/);
        return parts.length >= 2 ? { namespace: parts[0], name: parts[1] } : null;
      })
      .filter(Boolean);

    console.log("Current Deployments:", currentDeployments);
    console.log("Initial Deployments from Ref:", initialDeploymentsRef.current);

    // ✅ Corrected: Use ref instead of state
    const missingDeployments = initialDeploymentsRef.current.filter(
      d => !currentDeployments.some(cd => cd.namespace === d.namespace && cd.name === d.name)
    );

    console.log("Missing Deployments:", missingDeployments);

    // if (missingDeployments.length > 0) {
    //   const newNotifications = missingDeployments.map(d => ({
    //     id: Date.now(),
    //     message: `Deployment ${d.name} in namespace ${d.namespace} is missing!`,
    //     severity: "error",
    //     timestamp: new Date().toLocaleTimeString(),
    //   }));

    //   setNotifications(prev => [...newNotifications, ...prev]);
    // }
    if (missingDeployments.length > 0) {
      const newNotifications = missingDeployments.map(d => {
        showBrowserNotification("Deployment Missing", `Deployment ${d.name} in ${d.namespace} is missing!`);
        return {
          id: Date.now(),
          message: `Deployment ${d.name} in namespace ${d.namespace} is missing!`,
          severity: "error",
          timestamp: new Date().toLocaleTimeString(),
        };
      });
    
      setNotifications(prev => [...newNotifications, ...prev]);
    }


  }
};



  // Handle pod selection for logs
  const handlePodSelect = async (value) => {
    setSelectedPod(value);
    
    const [namespace, name] = value.split('/');
    let command = `kubectl logs -n ${namespace} ${name}`;
    
    if (parseWithJq) {
      // Use the jq parsing approach you mentioned
      command += ` | jq -R '. as $line | try (fromjson) catch $line'`;
    }
    
    const output = await executeCommand(command);
    if (output) {
      setLogs(output);
    }
  };

  // Handle deployment selection for image update
  const handleDeploymentSelect = async (value) => {
    setSelectedDeployment(value);
    const [namespace, name] = value.split('/');
    
    // Get current image of the deployment
    const command = `kubectl get deployment -n ${namespace} ${name} -o jsonpath='{.spec.template.spec.containers[0].image}'`;
    // const command = `kubectl get deployment -n ${namespace} ${name} -o json | jq -r '.spec.template.spec.containers[].name'`;
    const output = await executeCommand(command);
    
    if (output) {
      setCurrentImage(output.trim());
      setNewImageId('');
    }
  };

  // Handle image update
  const handleUpdateImage = async () => {
  if (!selectedDeployment || !newImageId.trim()) return;

  const [namespace, instanceName] = selectedDeployment.split('/');

  // Execute the updateImage script with the required parameters
  const command = `updateImage ${devstackLabel} ${namespace} ${newImageId}`;
  const output = await executeCommand(command);

  if (output) {
    const newNotification = {
      id: Date.now(),
      message: `Updated ${instanceName} image to ${newImageId}`,
      severity: 'success',
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotification, ...prev]);

    setCurrentImage(newImageId);

    // Refresh deployments list
    handleLabelSubmit();
  }
};

  // const handleUpdateImage = async () => {
  //   if (!selectedDeployment || !newImageId.trim()) return;
    
  //   const [namespace, name] = selectedDeployment.split('/');
    
  //   // Update the deployment image
  //   const command = `kubectl set image deployment/${name} -n ${namespace} ${name}=${newImageId}`;
  //   const output = await executeCommand(command);
    
  //   if (output) {
  //     // Add notification about the update
  //     const newNotification = {
  //       id: Date.now(),
  //       message: `Updated ${name} image to ${newImageId}`,
  //       severity: 'success',
  //       timestamp: new Date().toLocaleTimeString()
  //     };
  //     setNotifications(prev => [newNotification, ...prev]);
      
  //     setCurrentImage(newImageId);
      
  //     // Refresh deployments list
  //     handleLabelSubmit();
  //   }
  // };

  // Effect to periodically check pod health
  useEffect(() => {
    if (!isLabelSet) return;
    
    const interval = setInterval(() => {
      checkPodHealth();
      checkDeploymentHealth();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isLabelSet, devstackLabel]);

  useEffect(() => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission !== "granted") {
        console.warn("Browser notifications are disabled.");
      }
    });
  }
}, []);

  const showBrowserNotification = (title, message) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/favicon.ico", // You can replace this with your app's logo
    });
  }
};


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">KubePilot</h1>
          
          {isLabelSet && (
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-slate-700 text-green-400 border-green-400">
                Active Label: {devstackLabel}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsLabelSet(false)}
              >
                <RefreshCw className="h-4 w-4" />
                Change
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowTerminal(!showTerminal)}
              >
                <Terminal className="h-4 w-4" />
                {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Terminal output */}
      {showTerminal && (
        <div className="bg-black text-green-400 p-4 font-mono text-sm">
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>Last command:</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTerminal(false)}
              className="text-white hover:text-white"
            >
              Close
            </Button>
          </div>
          <div className="bg-slate-950 p-2 rounded mb-2">
            $ {lastCommand}
          </div>
          <div className="bg-slate-950 p-2 rounded max-h-40 overflow-auto">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing command...</span>
              </div>
            ) : (
              <pre>{commandOutput}</pre>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4">
        {!isLabelSet ? (
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle>Set Your Devstack Label</CardTitle>
              <CardDescription>
                Enter the label suffix used across your deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. alice"
                  value={devstackLabel}
                  onChange={(e) => setDevstackLabel(e.target.value)}
                />
                <Button 
                  onClick={handleLabelSubmit} 
                  disabled={!devstackLabel.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {/* Left sidebar */}
            <div className="col-span-1 bg-slate-100 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              
              {/* Fixed Tab controls - now they set the activeTab state */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-4">
                  <TabsTrigger value="deployments">Deployments</TabsTrigger>
                  <TabsTrigger value="logs">Pod Logs</TabsTrigger>
                  <TabsTrigger value="image-update">Update Image</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Notifications panel */}
              <div className="mt-8">
                <h3 className="flex items-center text-md font-medium mb-2">
                  <Bell className="h-4 w-4 mr-1" />
                  Notifications
                </h3>
                <div className="bg-white rounded border max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-slate-500 p-3">No notifications</p>
                  ) : (
                    <ul className="divide-y">
                      {notifications.map((notification) => (
                        <li key={notification.id} className="p-2 text-sm">
                          <div className="flex items-start space-x-2">
                            {notification.severity === 'error' && (
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.severity === 'warning' && (
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.severity === 'info' && (
                              <Bell className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.severity === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">{notification.message}</p>
                              <p className="text-xs text-slate-500">{notification.timestamp}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main content area - using the activeTab state instead of a separate Tabs component */}
            <div className="col-span-3">
              {activeTab === "deployments" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deployments</CardTitle>
                    <CardDescription>
                      All deployments with label suffix: <strong>{devstackLabel}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Loading deployments...</span>
                        </div>
                      </div>
                    ) : deployments.length === 0 ? (
                      <p className="text-center py-8 text-slate-500">
                        No deployments found with label suffix: {devstackLabel}
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="pb-2 font-medium">Name</th>
                              <th className="pb-2 font-medium">Namespace</th>
                              <th className="pb-2 font-medium">Image</th>
                              <th className="pb-2 font-medium">Status</th>
                              <th className="pb-2 font-medium">Pods</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deployments.map((deployment) => (
                              <tr key={`${deployment.namespace}/${deployment.name}`} className="border-b">
                                <td className="py-3">{deployment.name}</td>
                                <td className="py-3">{deployment.namespace}</td>
                                <td className="py-3 font-mono text-sm">{deployment.image}</td>
                                <td className="py-3">
                                  {deployment.status === 'Running' ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Running
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                      {deployment.status}
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3">{deployment.pods}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "logs" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pod Logs</CardTitle>
                    <CardDescription>
                      View logs for pods with label suffix: <strong>{devstackLabel}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="pod-select">Select Pod</Label>
                        <Select value={selectedPod} onValueChange={handlePodSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pod" />
                          </SelectTrigger>
                          <SelectContent>
                            {podOptions.map((pod) => (
                              <SelectItem key={pod.value} value={pod.value}>
                                {pod.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedPod && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="parse-jq" 
                              checked={parseWithJq} 
                              onCheckedChange={(checked) => {
                                setParseWithJq(checked);
                                // Re-fetch logs with the new parsing setting
                                if (selectedPod) {
                                  handlePodSelect(selectedPod);
                                }
                              }} 
                            />
                            <Label htmlFor="parse-jq">Parse with jq</Label>
                          </div>
                          
                          <div className="bg-slate-950 text-slate-100 rounded p-4 font-mono text-sm overflow-auto max-h-96">
                            {isLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                                  <span className="text-slate-400">Fetching logs...</span>
                                </div>
                              </div>
                            ) : (
                              <pre>{logs}</pre>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "image-update" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Deployment Image</CardTitle>
                    <CardDescription>
                      Change the image for deployments with label suffix: <strong>{devstackLabel}</strong> <br />

                      <br />


                      <strong>⚠️ This is in beta, for few deployments if there exists a prefix key before image-id like api_[image_id] then prefix needs to be added along with commit-id</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="deployment-select">Select Deployment</Label>
                        <Select value={selectedDeployment} onValueChange={handleDeploymentSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a deployment" />
                          </SelectTrigger>
                          <SelectContent>
                            {deploymentOptions.map((deployment) => (
                              <SelectItem key={deployment.value} value={deployment.value}>
                                {deployment.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedDeployment && (
                        <>
                          <div className="bg-slate-100 p-3 rounded">
                            <Label className="text-xs text-slate-500">Current Image</Label>
                            <div className="font-mono">{currentImage}</div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <Label htmlFor="new-image">New Image ID</Label>
                            <Input 
                              id="new-image"
                              placeholder="e.g. commit-id" 
                              value={newImageId}
                              onChange={(e) => setNewImageId(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            disabled={!newImageId.trim() || isLoading} 
                            onClick={handleUpdateImage}
                            className="w-full"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Deploy New Image'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KubernetesDashboard;