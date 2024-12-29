const cds = require('@sap/cds');
//const axios = require('axios');
const cov2ap = require("@sap/cds-odata-v2-adapter-proxy");
cds.on("bootstrap", (app) => app.use(cov2ap()));
module.exports = cds.server;
const { Destinations, ErrorLogs, DeletedInstances} = cds.entities('my.bookshop');
// const { DeletedInstances} = cds.entities('my.bookshop');
//const { WorkflowInstances } = cds.entities('my.bookshop');

module.exports = cds.service.impl(async function () {

    //|====================================================================================================|
    //|               //Function Service Call                                                              |
    //|====================================================================================================|
    this.on('fetchTaskDefinitions', async (req) => {

        //const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("tenatsName" + tenantNames);

            let results = [];

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/task-definitions");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    //========================================================
    
    this.on('fetchFilterTaskInstanceId', async (req) => {

        //const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        var tenantData = req.data.tenants;
        var wfInstanceId = req.data.workflowInstanceId;
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("tenatsName" + tenantNames);

            let results = [];

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get(`/task-instances?workflowInstanceId=${wfInstanceId}`);
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });



    // this.on('analyzeAutomationLoad', async (req) => {
    //     // Get the instanceId and tenant parameters from the request
    //     const instanceData = req.data.instanceIds;  // Comma-separated instance IDs
    //     const tenantData = req.data.tenants;  // Comma-separated tenant names
    //     const daysToAnalyze = 10;
    //     const dateThreshold = new Date();
    //     dateThreshold.setDate(dateThreshold.getDate() - daysToAnalyze);
    
    //     try {
    //         // Convert instanceData and tenantData into arrays
    //         const instanceIds = instanceData.split(',').map(id => id.trim());
    //         const tenantNames = tenantData.split(',').map(name => name.trim());
    
    //         let totalExecutionTime = 0;
    //         let totalAutomationCount = 0;
    
    //         // Outer loop: Iterate over each tenant
    //         for (let tenant of tenantNames) {
    //             try {
    //                 console.log(`Connecting to tenant: ${tenant}`);
    //                 const workflowServices = await cds.connect.to(tenant);
    //                 console.log(`Connected to ${tenant}`);
    
    //                 // Inner loop: Iterate over each instanceId for the current tenant
    //                 for (let instanceId of instanceIds) {
    //                     try {
    //                         const logsResponse = await workflowServices.tx(req).get(`/workflow-instances/${instanceId}/execution-logs`);
    //                         const logs = logsResponse;
    
    //                         // Filter logs for events within the last 10 days
    //                         const recentLogs = logs.filter(log => new Date(log.timestamp) >= dateThreshold);
    
    //                         // Track pairs of CREATED and COMPLETED events by referenceInstanceId
    //                         const taskDurations = {};
    //                         recentLogs.forEach(log => {
    //                             const { type, timestamp, referenceInstanceId, activityId } = log;
    //                             const logDate = new Date(timestamp);
    
    //                             if (type === "AUTOMATIONTASK_CREATED") {
    //                                 // Store the creation time for each task by referenceInstanceId or activityId
    //                                 taskDurations[referenceInstanceId] = { startTime: logDate, activityId };
    //                             } else if (type === "AUTOMATIONTASK_COMPLETED" && taskDurations[referenceInstanceId]) {
    //                                 // Calculate duration if we have a matching CREATED event
    //                                 const startTime = taskDurations[referenceInstanceId].startTime;
    //                                 const duration = (logDate - startTime) / 1000; // Convert to seconds
    //                                 totalExecutionTime += duration;
    //                                 totalAutomationCount++;
    //                                 delete taskDurations[referenceInstanceId]; // Clear the entry after processing
    //                             }
    //                         });
    //                     } catch (error) {
    //                         console.log(`Error fetching logs for tenant ${tenant}, instance ${instanceId}: `, error.message);
    //                         continue; // Skip to the next instanceId
    //                     }
    //                 }
    //             } catch (error) {
    //                 console.log(`Error connecting to tenant ${tenant}: `, error.message);
    //                 continue; // Skip to the next tenant
    //             }
    //         }
    
    //         // Calculate Average Execution Time
    //         const averageExecutionTime = totalAutomationCount > 0 ? (totalExecutionTime / totalAutomationCount) : 0;
    //         const load = totalAutomationCount * averageExecutionTime;
    
    //         // Define a threshold for load to determine if an additional agent is needed
    //         const loadThreshold = 1000; // Example threshold, adjust as necessary
    
    //         const message = load > loadThreshold
    //             ? `Current load (${load}) exceeds the threshold (${loadThreshold}). Adding another agent is recommended.`
    //             : `Current load (${load}) is within limits. No additional agent is required.`;
    
    //         return message;
    
    //     } catch (error) {
    //         console.log(`Error analyzing automation load: `, error.message);
    //         return req.error(500, `Error analyzing automation load: ${error.message}`);
    //     }
    // });
  

    this.on('analyzeAutomationLoad', async (req) => {
        const instanceData = req.data.instanceIds;  // Comma-separated instance IDs
        const tenantData = req.data.tenants;  // Comma-separated tenant names
        const daysToAnalyze = 10;
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysToAnalyze);
    
        try {
            // Convert instanceData and tenantData into arrays
            const instanceIds = instanceData.split(',').map(id => id.trim());
            const tenantNames = tenantData.split(',').map(name => name.trim());
    
            const results = {};  // To hold cumulative results for each tenant
    
            // Outer loop: Iterate over each tenant
            for (let tenant of tenantNames) {
                let totalExecutionTime = 0;
                let totalAutomationCount = 0;
                let tenantError = null;
    
                try {
                    console.log(`Connecting to tenant: ${tenant}`);
                    const workflowServices = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);
    
                    // Inner loop: Iterate over each instanceId for the current tenant
                    for (let instanceId of instanceIds) {
                        try {
                            const logsResponse = await workflowServices.tx(req).get(`/workflow-instances/${instanceId}/execution-logs`);
                            const logs = logsResponse;
    
                            // Filter logs for events within the last 10 days
                            const recentLogs = logs.filter(log => new Date(log.timestamp) >= dateThreshold);
    
                            // Track pairs of CREATED and COMPLETED events by referenceInstanceId
                            const taskDurations = {};
    
                            recentLogs.forEach(log => {
                                const { type, timestamp, referenceInstanceId } = log;
                                const logDate = new Date(timestamp);
    
                                if (type === "AUTOMATIONTASK_CREATED") {
                                    // Store the creation time for each task by referenceInstanceId
                                    taskDurations[referenceInstanceId] = logDate;
                                } else if (type === "AUTOMATIONTASK_COMPLETED" && taskDurations[referenceInstanceId]) {
                                    // Calculate duration if we have a matching CREATED event
                                    const startTime = taskDurations[referenceInstanceId];
                                    const duration = (logDate - startTime) / 1000; // Convert to seconds
                                    totalExecutionTime += duration;
                                    totalAutomationCount++;
    
                                    delete taskDurations[referenceInstanceId]; // Clear the entry after processing
                                } else if (type === "AUTOMATIONTASK_FAILED" && taskDurations[referenceInstanceId]) {
                                    delete taskDurations[referenceInstanceId]; // Clear the entry after processing
                                }
                            });
    
                        } catch (error) {
                            console.warn(`Error fetching logs for tenant ${tenant}, instance ${instanceId}: `, error.message);
                            continue; // Exit instance loop if an error occurs
                        }
                    }
    
                    if (!tenantError) {
                        // Calculate the load based on execution time
                        const averageExecutionTime = totalAutomationCount > 0 ? (totalExecutionTime / totalAutomationCount) : 0;
                        const load = totalAutomationCount * averageExecutionTime;
    
                        // Define a threshold for load to determine if an additional agent is needed
                        const loadThreshold = 1000; // Example threshold, adjust as necessary
                        const needAdditionalAgent = load > loadThreshold;
                        const tenantMessage = needAdditionalAgent
                            ? `Current load (${load}) exceeds the threshold (${loadThreshold}). Adding another agent is recommended.`
                            : `Current load (${load}) is within limits. No additional agent is required.`;
    
                        // Store results for the current tenant
                        results[tenant] = {tenantMessage, needAdditionalAgent};
                    } else {
                        // Store error message for the current tenant
                        results[tenant] = tenantError;
                    }
    
                } catch (error) {
                    console.log(`Error connecting to tenant ${tenant}: `, error.message);
                    results[tenant] = `Error during request to remote service: ${error.message}`;
                }
            }
    
            // Format the results to include only tenant and message
            const formattedResults = Object.keys(results).map(tenant => ({
                tenant,
                message: results[tenant]
            }));
    
            // Return results for all tenants
            return {
                "@odata.context": "$metadata#Collection(Edm.String)",
                "value": formattedResults
            };
    
        } catch (error) {
            console.log(`Error analyzing automation load: `, error.message);
            return req.error(500, `Error analyzing automation load: ${error.message}`);
        }
    });

//=============================================================    

    this.on('fetchTaskinstances', async (req) => {

        //const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("tenatsName" + tenantNames);

            let results = [];

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/task-instances");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    this.on('fetchTaskinstancebyId', async (req) => {

        //const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            var instanceId = req.data.id
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("tenatsName" + tenantNames);

            let results = [];

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get(`/task-instances/${instanceId}`);
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    this.on('fetchWorkFlow', async (req) => {

        //const tenantNames = req.data.tenants //|| ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            //console.log("instanceId :::: ", instanceId);
            console.log("Tenant names: ", tenantNames);
            console.log("tenatsName" + tenantNames);


            let results = [];

            for (let tenant of tenantNames) {
                try {

                    const tenantName = tenant
                    console.log(tenantName);
                    const service = await cds.connect.to(tenantName);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/workflow-instances");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenantName,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

   
    this.on('fetchWorkFlowById', async (req) => {
        var tenantData = req.data.tenants;
        var tenantNames = [];
        var id = [];
        try {
            // Extract the workflow instance IDs from the request
            var ids = req.data.ids; // Expecting an array of IDs
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("Tenant names: ", tenantNames);
             id.push(ids);
             id = id[0].split(',');
            console.log("IDs: ", ids);
    
            let results = [];
    
            for (let tenant of tenantNames) {
                try {
                    const tenantName = tenant;
                    console.log(`Connecting to ${tenantName}...`);
                    const service = await cds.connect.to(tenantName);
                    console.log(`Connected to ${tenantName}`);
    
                    let tenantResults = [];
                    for (let instanceId of id) {
                        try {
                            // Fetch workflow instance data for each ID
                            const res = await service.tx(req).get(`/workflow-instances/${instanceId}`);
                            console.log(`Data for ID ${instanceId} from ${tenantName}:`, res);
    
                            tenantResults.push({
                                id: instanceId,
                                data: res
                            });
                        } catch (err) {
                            console.error(`Failed to fetch data for ID ${id} from ${tenantName}:`, err);
                            tenantResults.push({
                                id: instanceId,
                                error: err.message
                            });
                        }
                    }
    
                    results.push({
                        tenant: tenantName,
                        workflows: tenantResults
                    });
                } catch (err) {
                    console.error(`Failed to connect to ${tenant}:`, err);
                }
            }
    
            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Log the error to an entity
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    this.on('WorkflowDefinitions', async (req) => {

        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            //console.log("instanceId :::: ", instanceId);
            console.log("Tenant names: ", tenantNames);
            console.log("tenatsName" + tenantNames);

            let results = [];

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/workflow-definitions");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    //});

    //-----------------------------------newAdded---------------------------------------------------------------------------
    this.on('ExecutionLogs', async (req) => {
        var id = req.data.ids;
        var ids = []; // Expecting an array of IDs
        try {
            ids.push(id);
            ids = ids[0].split(',');
            // const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
            var tenantData = req.data.tenants
            var tenantNames = [];
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            //console.log("instanceId :::: ", instanceId);
            console.log("Tenant names: ", tenantNames);

            let allTenantLogs = [];

            // Outer loop: Connect to each tenant dynamically
            for (let tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant's workflow service
                    const workflowServices = await cds.connect.to(tenant);
                    console.log(`: : Connected to Workflow Service for ${tenant} : :`);

                    // Array to store logs for this tenant
                    let allLogs = [];

                    // Inner loop: Fetch logs for each workflow instance ID
                    for (const id of ids) {
                        try {
                            // Fetch instance details and logs for the current instance ID
                            const instanceDetails = await getWorkflowinstance(workflowServices, req, id);
                            const instanceLogs = await workflowServices.tx(req).get(`/workflow-instances/${id}/execution-logs`);

                            console.log(`Logs for instance ${id} in ${tenant}: `, instanceLogs);

                            // Call an asynchronous function to calculate the duration
                            const duration = await calculateDuration(instanceLogs);

                            // Store logs for this instance
                            allLogs.push({
                                instanceId: id,
                                instance: instanceDetails,
                                duration: duration,
                                logs: instanceLogs
                            });
                        } catch (error) {
                            // Handle errors for fetching logs of a particular instance
                            console.error(`Error fetching logs for instance ${id} in ${tenant}: `, error.message);
                            allLogs.push({
                                instanceId: id,
                                error: error.message
                            });
                        }
                    }

                    // After processing all IDs for this tenant, push logs to the result
                    allTenantLogs.push({
                        tenant: tenant,
                        logs: allLogs
                    });
                } catch (err) {
                    // Handle errors during tenant connection or log fetching
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                    allTenantLogs.push({
                        tenant: tenant,
                        error: err.message
                    });
                }
            }

            // Return the logs for all tenants and instances
            return allTenantLogs;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('changestatus', async (req) => {
        const { status } = req.data;

        var id = req.data.ids;
        var ids = []; // Expecting an array of IDs
        try {
            ids.push(id);
            ids = ids[0].split(',');
            // Validate the provided IDs
            if (!Array.isArray(ids) || ids.length === 0) {
                return req.error(400, 'No IDs provided');
            }
            var tenantData = req.data.tenants
            var tenantNames = [];
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');

            const allResults = [];

            // Outer loop: Iterate through each tenant and update the status
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the current tenant's service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    // Initialize an array to store the results for this tenant
                    let tenantResults = [];

                    // Inner loop: Iterate over each workflow instance ID to update its status
                    for (const id of ids) {
                        const url = `/workflow-instances/${id}`;
                        console.log(`Updating status for ${id} at URL: ${url}`);

                        try {
                            // Perform the status update for the current workflow instance
                            const response = await workflowService.tx(req).patch(url, { status });
                            console.log(`Updated instance ${id} for tenant ${tenant}: `, response);

                            // Store success result for this instance
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: status,
                                result: 'success'
                            });
                        } catch (error) {
                            console.error(`Error updating instance ${id} for tenant ${tenant}: `, error.message);

                            // Store failure result for this instance
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: status,
                                result: 'failed',
                                error: error.message
                            });
                        }
                    }

                    // Push tenant-specific results into the overall results array
                    allResults.push(...tenantResults);

                } catch (error) {
                    console.error(`Error connecting to tenant ${tenant}: `, error.message);

                    // If there's an error connecting to the tenant, add a failure result for all IDs
                    ids.forEach(id => {
                        allResults.push({
                            tenant: tenant,
                            id: id,
                            status: status,
                            result: 'failed',
                            error: `Connection failed: ${error.message}`
                        });
                    });
                }
            }

            // Return the results for all tenants and instances
            return allResults;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    //----------------------------------------------------------------------------------------------
    this.on('deleteinstanse', async (req) => {
        const { ids } = req.data; // Expecting an array of IDs
        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];

        console.log("Tenant names: ", tenantNames);
        console.log("Instance IDs to delete: ", ids);

        // Initialize an array to store the results
        let allTenantResults = [];
        try {

            // Outer loop: Iterate over each tenant and connect dynamically
            for (let tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant's workflow service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    // Initialize an array to store the results for this tenant
                    let tenantResults = [];

                    // Inner loop: Iterate over each ID and attempt to delete the instance
                    for (const id of ids) {
                        const instanceDetails = await getWorkflowinstance(workflowService, req, id);
                        const url = `/workflow-instances`; // API URL for deleting instances
                        const body = [
                            {
                                id: id,
                                deleted: true
                            }
                        ];

                        console.log(`Attempting to delete instance with ID: ${id} in ${tenant}`);

                        try {
                            // Attempt to delete the workflow instance
                            const response = await workflowService.tx(req).patch(url, body);
                            console.log(`Deleted instance with ID: ${id} in ${tenant}`);
                            await INSERT.into(DeletedInstances).entries({
                                instanceID: id,
                                status: "deleted",
                                subject: instanceDetails.subject
                            });
                            // Push success result into the tenant-specific results array
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: "deleted",
                                response: response
                            });
                        } catch (error) {
                            console.error(`Error deleting workflow instance with ID: ${id} in ${tenant}:`, error);
                            // await INSERT.into(DeletedInstances).entries({
                            //     instanceID: id,
                            //     status: "failed",
                            //     response: error.message
                            //   });
                            // Push failure result into the tenant-specific results array
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: "failed",
                                error: error.message
                            });
                        }
                    }

                    // After processing all IDs for this tenant, push the results to the main array
                    allTenantResults.push({
                        tenant: tenant,
                        results: tenantResults
                    });

                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);

                    // In case of tenant connection failure, push an error result
                    allTenantResults.push({
                        tenant: tenant,
                        error: err.message
                    });
                }
            }

            // Return the results for all tenants and all IDs
            return allTenantResults;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('automationDetails', async (req) => {
        // Get the instanceId and tenant parameters from the request
        const instanceData = req.data.instanceId;  // Comma-separated instance IDs
        const tenantData = req.data.tenants;  // Comma-separated tenant names
        const tenantColors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#e67e22", "#95a5a6", "#2c3e50"];
        try {
            // Convert instanceData and tenantData into arrays
            const instanceIds = instanceData.split(',').map(id => id.trim());
            const tenantNames = tenantData.split(',').map(name => name.trim());

            console.log("Instance IDs: ", instanceIds);
            console.log("Tenant names: ", tenantNames);

            let allTenantDetails = [];
            // Assign a color for each tenant based on the order they are received (up to 10)
            const tenantColorMap = {};
            tenantNames.forEach((tenant, index) => {
                tenantColorMap[tenant] = tenantColors[index % tenantColors.length];
            });

            // Outer loop: Iterate over each tenant
            for (let tenant of tenantNames) {
                try {
                    console.log(`Connecting to tenant: ${tenant}`);
                    const workflowServices = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    // Inner loop: Iterate over each instanceId for the current tenant
                    for (let instanceId of instanceIds) {
                        let automationDetails = [];

                        try {
                            // Fetch the execution logs for the workflow instance
                            const instanceDetails = await getWorkflowinstance(workflowServices, req, instanceId);
                            const logsResponse = await workflowServices.tx(req).get(`/workflow-instances/${instanceId}/execution-logs`);
                            console.log(`Logs response for tenant ${tenant}, instance ${instanceId}: `, logsResponse);

                            // Loop through the logs to extract automation task information
                            logsResponse.forEach(log => {
                                if (log.type === "AUTOMATIONTASK_CREATED") {
                                    automationDetails.push({
                                        processSubjectName: instanceDetails.subject,
                                        activityId: log.activityId,
                                        automationName: log.subject,
                                        startTime: new Date(log.timestamp),
                                        status: "In Progress",
                                        duration: null,
                                        errorMessage: null,
                                        color: tenantColorMap[tenant],
                                        tenant: tenant
                                    });
                                } else if (log.type === "AUTOMATIONTASK_COMPLETED") {
                                    const task = automationDetails.find(task => task.activityId === log.activityId && task.duration == null);
                                    if (task) {
                                        task.status = "Completed";
                                        const endTime = new Date(log.timestamp);
                                        task.duration = (endTime - task.startTime) / 1000;  // Duration in seconds
                                    }
                                } else if (log.type === "AUTOMATIONTASK_FAILED") {
                                    const task = automationDetails.find(task => task.activityId === log.activityId && task.duration == null);
                                    if (task) {
                                        task.status = "Failed";
                                        const endTime = new Date(log.timestamp);
                                        task.duration = (endTime - task.startTime) / 1000;  // Duration in seconds
                                        task.errorMessage = log.error.message;  // Capture the error message
                                    }
                                }
                            });

                            // Push the results for the current tenant and instanceId
                            allTenantDetails.push({
                                tenant: tenant,
                                instanceId: instanceId,
                                automationDetails: automationDetails
                            });

                        } catch (error) {
                            console.log(`Error fetching logs for tenant ${tenant}, instance ${instanceId}: `, error.message);
                            // allTenantDetails.push({
                            //     tenant: tenant,
                            //     instanceId: instanceId,
                            //     error: error.message
                            // });
                        }
                    }
                } catch (error) {
                    console.log(`Error connecting to tenant ${tenant}: `, error.message);
                    // allTenantDetails.push({
                    //     tenant: tenant,
                    //     error: error.message
                    // });
                }
            }

            // Return the results for all tenants and instances
            return allTenantDetails;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });
    //=============================================================
    // Define the event handler for automation details



    //=====================================================================================
    async function getWorkflowinstance(workflowServices, req, id) {
        var res = await workflowServices.tx(req).get(`/workflow-instances/${id}`);
        console.log("Result : : : : ", res);
        const result = {
            subject: res.subject,
            status: res.status,
            startedAt: res.startedAt
        }
        return result;
    }
    async function calculateDuration(logs) {
        // Find the WORKFLOW_STARTED event
        const workflowStarted = logs.find(log => log.type === 'WORKFLOW_STARTED');
        // Find the last event (assuming it's the last log entry)
        const workflowEnd = logs[logs.length - 1];

        if (!workflowStarted) {
            throw new Error('No WORKFLOW_STARTED event found in logs');
        }

        // Convert timestamps to Date objects
        const startTime = new Date(workflowStarted.timestamp);
        const endTime = new Date(workflowEnd.timestamp);

        // Calculate the duration in milliseconds
        const durationMs = endTime - startTime;

        // Convert duration to a human-readable format (hours, minutes, seconds)
        const duration = {
            hours: Math.floor(durationMs / (1000 * 60 * 60)),
            minutes: Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((durationMs % (1000 * 60)) / 1000)
        };

        // Return the formatted duration string
        return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
    }


    //========================================Dt:- 30-09-24 ====================================
    // this.on('fetchContext', async (req) => {
    //     const instanceIds = req.data.id;
    //     //const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Fetch tenant names from request or set default values
    //     var tenantData = req.data.tenants
    //     var tenantNames = [];
    //     try {
    //         tenantNames.push(tenantData);
    //         tenantNames = tenantNames[0].split(',');
    //         console.log("Fetching contexts for instance IDs: ", instanceIds);
    //         console.log("Tenants to connect: ", tenantNames);

    //         if (!instanceIds || tenantNames.length === 0) {
    //             return req.error(400, "Instance IDs and tenants are required.");
    //         }

    //         const allContexts = [];

    //         // Loop through each tenant to dynamically connect and fetch context
    //         for (const tenant of tenantNames) {
    //             try {
    //                 // Dynamically connect to the tenant-specific workflow service
    //                 const workflowService = await cds.connect.to(tenant);
    //                 console.log(`Connected to workflow service for tenant: ${tenant}`);

    //                 // Fetch context for the given workflow instance ID
    //                 const contexts = await workflowService.tx(req).get(`/workflow-instances/${instanceIds}/context`);
    //                 console.log(`Contexts for instance ${instanceIds} in tenant ${tenant}: `, contexts);

    //                 // Store the contexts along with tenant information
    //                 allContexts.push({
    //                     tenant: tenant,
    //                     instanceId: instanceIds,
    //                     context: contexts
    //                 });
    //             } catch (error) {
    //                 console.error(`Error fetching contexts for instance ${instanceIds} from tenant ${tenant}: `, error.message);

    //                 // Store error result for this tenant and instance ID
    //                 allContexts.push({
    //                     tenant: tenant,
    //                     instanceId: instanceIds,
    //                     context: null,
    //                     error: `Failed to fetch context: ${error.message}`
    //                 });
    //             }
    //         }

    //         // Return all the collected contexts for all tenants
    //         return { allContexts };
    //     } catch (error) {
    //         const statusCode = error.status || error.statusCode || 500;
    //         // Call the separate function to log the error
    //         return await logErrorToEntity(statusCode, error.message);
    //     }
    // });

    this.on('fetchContext', async (req) => {
        const instanceIds = req.data.id;
        var tenantData = req.data.tenants;
        var tenantNames = [];
    
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
    
            console.log("Fetching contexts for instance IDs: ", instanceIds);
            console.log("Tenants to connect: ", tenantNames);
    
            if (!instanceIds || tenantNames.length === 0) {
                return req.error(400, "Instance IDs and tenants are required.");
            }
    
            const allContexts = [];
    
            // Loop through each tenant to dynamically connect and fetch context
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);
    
                    // Fetch context for the given workflow instance ID
                    const contexts = await workflowService.tx(req).get(`/workflow-instances/${instanceIds}/context`);
                    console.log(`Contexts for instance ${instanceIds} in tenant ${tenant}: `, contexts);
    
                    // Store the contexts along with tenant information
                    allContexts.push({
                        tenant: tenant,
                        instanceId: instanceIds,
                        context: contexts
                    });
                } catch (error) {
                    console.error(`Error fetching contexts for instance ${instanceIds} from tenant ${tenant}: `, error.message);
    
                    // Store error result for this tenant and instance ID
                    allContexts.push({
                        tenant: tenant,
                        instanceId: instanceIds,
                        context: null,
                        error: `Failed to fetch context: ${error.message}`
                    });
                }
            }
    
            // Return the array directly without additional wrapping in a "value" key
            return allContexts;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });
    this.on('fetchError', async (req) => {
        const Ids = req.data.id;
        //const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Dynamically handle tenant names
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("Fetching error messages for instance IDs: ", Ids);
            console.log("Tenants to connect: ", tenantNames);

            if (!Ids || tenantNames.length === 0) {
                return req.error(400, "Instance IDs and tenants are required.");
            }

            const allErrors = [];

            // Loop through each tenant to dynamically connect and fetch error messages
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflow = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);

                    // Fetch error messages for the given workflow instance ID
                    const errors = await workflow.tx(req).get(`/workflow-instances/${Ids}/error-messages`);
                    console.log(`Errors for instance ${Ids} in tenant ${tenant}: `, errors);

                    // Store the errors along with tenant information
                    allErrors.push({
                        tenant: tenant,
                        instanceId: Ids,
                        errors: errors
                    });
                } catch (error) {
                    console.error(`Error fetching errors for instance ${Ids} from tenant ${tenant}: `, error.message);

                    // Store error result for this tenant and instance ID
                    allErrors.push({
                        tenant: tenant,
                        instanceId: Ids,
                        errors: null,
                        error: `Failed to fetch error messages: ${error.message}`
                    });
                }
            }

            // Return all the collected error messages for all tenants
            return { allErrors };
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('getRunningHold', async (req) => {
        const { id, status } = req.data;
        //const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Dynamically handle tenant names
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("Fetching status update for instance ID:", id);
            console.log("Tenants to connect: ", tenantNames);

            if (!id || tenantNames.length === 0) {
                return req.error(400, "Instance ID and tenants are required.");
            }

            const results = [];

            // Loop through each tenant to dynamically connect and update workflow instance
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);

                    const url = `/workflow-instances/${id}`;
                    console.log(`Update URL for tenant ${tenant}: ${url}`);

                    // Update the workflow instance with the provided status
                    const response = await workflowService.tx(req).patch(url, { status });
                    console.log(`Updated status for instance ${id} in tenant ${tenant}:`, response);

                    // Store the successful result
                    results.push({
                        tenant: tenant,
                        id: id,
                        status: status,
                        result: 'success'
                    });
                } catch (error) {
                    console.error(`Error updating workflow instance ${id} for tenant ${tenant}:`, error.message);

                    // Store the failure result for this tenant
                    results.push({
                        tenant: tenant,
                        id: id,
                        status: status,
                        result: 'failed',
                        error: `Failed to update instance: ${error.message}`
                    });
                }
            }

            // Return the results for all tenants
            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('getProcessor', async (req) => {
        const { id, processor } = req.data;  // Assuming tenants are passed in the request data
        //const tenantNames = tenants || ['Tenant1', 'Tenant2', 'Tenant3'];  // Default tenant names if not provided
        var tenantData = req.data.tenants
        var tenantNames = [];
        try {
            tenantNames.push(tenantData);
            tenantNames = tenantNames[0].split(',');
            console.log("Task ID:", id);
            console.log("Processor:", processor);
            console.log("Tenants to update:", tenantNames);

            if (!id || tenantNames.length === 0) {
                return req.error(400, "Task ID and tenants are required.");
            }

            const results = [];

            // Loop through each tenant and connect to its workflow service
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const taskService = await cds.connect.to(tenant);
                    console.log(`Connected to task service for tenant: ${tenant}`);

                    const url = `/task-instances/${id}`;
                    console.log(`Task URL for tenant ${tenant}: ${url}`);

                    // Update the processor for the task instance
                    const response = await taskService.tx(req).patch(url, { processor });
                    console.log(`Updated processor for task instance ${id} in tenant ${tenant}:`, response);

                    // Store the successful result
                    results.push({
                        tenant: tenant,
                        id: id,
                        processor: processor,
                        result: 'success'
                    });
                } catch (error) {
                    console.error(`Error updating task instance ${id} for tenant ${tenant}:`, error.message);

                    // Store the failure result for this tenant
                    results.push({
                        tenant: tenant,
                        id: id,
                        processor: processor,
                        result: 'failed',
                        error: `Failed to update task: ${error.message}`
                    });
                }
            }

            // Return the results for all tenants
            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    this.on('fetchCombinedData', async (req) => {
        var id = req.data.ids;
        var ids = []; // Expecting an array of IDs
        ids.push(id);
        ids = ids[0].split(',');

        var tenantData = req.data.tenants
        var tenantNames = [];
        tenantNames.push(tenantData);
        tenantNames = tenantNames[0].split(',');

        let combinedResults = [];

        try {
            // First, fetch task definitions for all tenants
            for (let tenant of tenantNames) {
                try {
                    const taskService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant} for Task Definitions`);

                    const taskDefinitions = await taskService.tx(req).get("/task-definitions");
                    console.log(`Task Definitions for ${tenant}:`, taskDefinitions);

                    // Push task definitions to the combined results
                    combinedResults.push({
                        tenant: tenant,
                        taskDefinitions: taskDefinitions // Keep it as an object
                    });
                } catch (err) {
                    console.error(`Failed to fetch task definitions from ${tenant}:`, err.message);
                    combinedResults.push({ tenant: tenant, error: `Task Definitions error: ${err.message}` });
                }
            }

            // Next, fetch execution logs for all tenants and ids
            for (let tenant of tenantNames) {
                try {
                    const logService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant} for Execution Logs`);

                    for (let id of ids) {
                        try {
                            const executionLogs = await logService.tx(req).get(`/workflow-instances/${id}/execution-logs`);
                            console.log(`Execution Logs for instance ${id} in ${tenant}:`, executionLogs);

                            // Push execution logs to the combined results
                            combinedResults.push({
                                tenant: tenant,
                                instanceId: id,
                                executionLogs: executionLogs // Keep it as an object
                            });
                        } catch (err) {
                            console.error(`Failed to fetch execution logs for ${id} in ${tenant}:`, err.message);
                            combinedResults.push({
                                tenant: tenant,
                                instanceId: id,
                                error: `Execution Logs error: ${err.message}`
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Failed to connect to ${tenant} for execution logs:`, err.message);
                    combinedResults.push({ tenant: tenant, error: `Connection error: ${err.message}` });
                }
            }

            // Return the combined results directly as structured JSON
            return combinedResults; // Return the structured objects directly
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });
//above is original
// this.on('fetchCombinedData', async (req) => {
//     var id = req.data.ids;
//     var ids = []; // Expecting an array of IDs
//     ids.push(id);
//     ids = ids[0].split(',');

//     var tenantData = req.data.tenants;
//     var tenantNames = [];
//     tenantNames.push(tenantData);
//     tenantNames = tenantNames[0].split(',');

//     let combinedResults = [];

//     try {
//         // Step 1: Fetch Task Definitions and Execution Logs for each tenant
//         for (let tenant of tenantNames) {
//             try {
//                 const taskService = await cds.connect.to(tenant);
//                 const logService = await cds.connect.to(tenant);
//                 console.log(`Connected to ${tenant}`);

//                 // Fetch Task Definitions
//                 const taskDefinitions = await taskService.tx(req).get("/task-definitions");
//                 console.log(`Task Definitions for ${tenant}:`, taskDefinitions);

//                 // Fetch Execution Logs for all IDs
//                 let executionLogs = [];
//                 for (let id of ids) {
//                     const logs = await logService.tx(req).get(`/workflow-instances/${id}/execution-logs`);
//                     executionLogs = executionLogs.concat(logs);
//                 }

//                 // Step 2: Combine and Sequence Data
//                 let combinedData = [];

//                 // Add logs and task definitions to the combinedData array
//                 combinedData = combinedData.concat(
//                     executionLogs.map(log => ({
//                         id: log.id,
//                         type: log.type,
//                         timestamp: log.timestamp,
//                         referenceInstanceId: log.referenceInstanceId,
//                         activityId: log.activityId,
//                         subject: log.subject,
//                         recipientUsers: log.recipientUsers,
//                         recipientGroups: log.recipientGroups,
//                         initiatorId: log.initiatorId,
//                         userId: log.userId,
//                         taskId: log.taskId
//                     }))
//                 );

//                 combinedData = combinedData.concat(
//                     taskDefinitions.map(task => ({
//                         id: task.id,
//                         name: task.name,
//                         createdAt: task.createdAt,
//                         // Include a timestamp derived from createdAt (if available) for proper sorting
//                         timestamp: task.createdAt || new Date(0).toISOString() // default if createdAt is missing
//                     }))
//                 );

//                 // Sort combinedData based on the timestamp property
//                 combinedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//                 // Push the final structured and sorted data into combined results
//                 combinedResults.push({
//                     tenant: tenant,
//                     combinedData: combinedData // Keep it as an array of logs and tasks
//                 });

//             } catch (err) {
//                 console.error(`Failed to fetch data for ${tenant}:`, err.message);
//                 combinedResults.push({ tenant: tenant, error: `Data fetch error: ${err.message}` });
//             }
//         }

//         // Return the final combined results with the structured data
//         return combinedResults;
//     } catch (error) {
//         const statusCode = error.status || error.statusCode || 500;
//         // Call the separate function to log the error
//         return await logErrorToEntity(statusCode, error.message);
//     }
// });
    // this.on('fetchCombinedData', async (req) => {
    //     var ids = req.data.ids.split(',');
    //     var tenantNames = req.data.tenants.split(',');
    
    //     let combinedResults = [];
    
    //     try {
    //         for (let tenant of tenantNames) {
    //             let tenantResult = {
    //                 tenant: tenant,
    //                 taskDefinitions: [],
    //                 executionLogs: []
    //             };
    
    //             try {
    //                 // Step 1: Fetch Task Definitions
    //                 const taskService = await cds.connect.to(tenant);
    //                 const taskDefinitions = await taskService.tx(req).get("/task-definitions");
    
    //                 // Store the fetched task definitions
    //                 tenantResult.taskDefinitions = taskDefinitions;
    
    //                 // Step 2: Fetch Execution Logs
    //                 const logService = await cds.connect.to(tenant);
    //                 let allLogs = [];
    
    //                 for (let id of ids) {
    //                     const executionLogs = await logService.tx(req).get(`/workflow-instances/${id}/execution-logs`);
    //                     allLogs.push(...executionLogs); // Flatten and merge all logs into one array
    //                 }
    
    //                 // Step 3: Sequence the Logs Based on Requirements
    //                 let sequencedLogs = [];
    //                 let remainingLogs = [...allLogs]; // Keep track of logs yet to be sequenced
    
    //                 // First, handle USERTASK_CREATED events and their corresponding task definitions
    //                 for (let log of allLogs) {
    //                     if (log.type === 'USERTASK_CREATED' && log.activityId) {
    //                         // Push the USERTASK_CREATED log first
    //                         sequencedLogs.push(log);
    
    //                         // Find and push the matching task definition by activityId
    //                         let matchingTask = taskDefinitions.find(task => task.id === log.activityId);
    //                         if (matchingTask) {
    //                             sequencedLogs.push(matchingTask);
    
    //                             // Find any related execution logs containing the activityId within their IDs
    //                             let relatedLogs = remainingLogs.filter(l => l.id.includes(log.activityId));
    //                             sequencedLogs.push(...relatedLogs);
    
    //                             // Remove these logs from the remaining logs to avoid duplication
    //                             remainingLogs = remainingLogs.filter(l => !relatedLogs.includes(l));
    //                         }
    //                     }
    //                 }
    
    //                 // Add any remaining logs that haven't been sequenced yet
    //                 sequencedLogs.push(...remainingLogs);
    
    //                 // Store the final sequenced logs in the tenant result
    //                 tenantResult.executionLogs = sequencedLogs;
    //             } catch (err) {
    //                 console.error(`Error processing tenant ${tenant}:`, err.message);
    //                 tenantResult.taskDefinitions = { error: `Error fetching data: ${err.message}` };
    //                 tenantResult.executionLogs = { error: `Error fetching data: ${err.message}` };
    //             }
    
    //             // Push the structured result for this tenant
    //             combinedResults.push(tenantResult);
    //         }
    
    //         // Return the final combined results
    //         return combinedResults;
    //     } catch (error) {
    //         const statusCode = error.status || error.statusCode || 500;
    //         console.error('Unexpected error:', error.message);
    //         return await logErrorToEntity(statusCode, error.message);
    //     }
    // });


    this.on('MyFunction', async (req) => {
        let result = {};
        if (req.data.category === 1) {
            result.category = 'Category 1';
            result.field1 = "Random Field Value";
            result.field2 = [{ "f1": "f1 Value1" }]
        } else {
            result.category = { "Info": "Category2" };
            result.field1 = "Random Field Value";
            result.field2 = [{ "f1": "f1 Value1" }, { "f1": "f1 Value2", "f2": "f2 Value2" }];
        }
        return result;
    })

    //|==================================================for Action=========================================================|
    //|dt:-09-10-24   Action Service Call                                                                                   |
    //|=====================================================================================================================|
    this.on('fetchWorkFlowAction', async (req) => {

        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        console.log("tenatsName" + tenantNames);

        let results = [];
        try {

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/workflow-instances");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('WorkflowDefinitionsAction', async (req) => {

        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        console.log("tenatsName" + tenantNames);

        let results = [];
        try {

            for (let tenant of tenantNames) {
                try {
                    const service = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    const res = await service.tx(req).get("/workflow-definitions");
                    console.log(`Data from ${tenant}:`, res);

                    results.push({
                        tenant: tenant,
                        data: res
                    });
                } catch (err) {
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                }
            }

            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });


    //});

    //-----------------------------------newAdded---------------------------------------------------------------------------
    this.on('ExecutionLogsAction', async (req) => {
        const ids = req.data.ids;  // Expecting an array of IDs
        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];

        console.log("Fetching logs for instance IDs: ", ids);
        console.log("Tenants to connect: ", tenantNames);

        let allTenantLogs = [];
        try {
            // Outer loop: Connect to each tenant dynamically
            for (let tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant's workflow service
                    const workflowServices = await cds.connect.to(tenant);
                    console.log(`: : Connected to Workflow Service for ${tenant} : :`);

                    // Array to store logs for this tenant
                    let allLogs = [];

                    // Inner loop: Fetch logs for each workflow instance ID
                    for (const id of ids) {
                        try {
                            // Fetch instance details and logs for the current instance ID
                            const instanceDetails = await getWorkflowinstance(workflowServices, req, id);
                            const instanceLogs = await workflowServices.tx(req).get(`/workflow-instances/${id}/execution-logs`);

                            console.log(`Logs for instance ${id} in ${tenant}: `, instanceLogs);

                            // Call an asynchronous function to calculate the duration
                            const duration = await calculateDuration(instanceLogs);

                            // Store logs for this instance
                            allLogs.push({
                                instanceId: id,
                                instance: instanceDetails,
                                duration: duration,
                                logs: instanceLogs
                            });
                        } catch (error) {
                            // Handle errors for fetching logs of a particular instance
                            console.error(`Error fetching logs for instance ${id} in ${tenant}: `, error.message);
                            allLogs.push({
                                instanceId: id,
                                error: error.message
                            });
                        }
                    }

                    // After processing all IDs for this tenant, push logs to the result
                    allTenantLogs.push({
                        tenant: tenant,
                        logs: allLogs
                    });
                } catch (err) {
                    // Handle errors during tenant connection or log fetching
                    console.error(`Failed to connect or fetch data from ${tenant}:`, err);
                    allTenantLogs.push({
                        tenant: tenant,
                        error: err.message
                    });
                }
            }

            // Return the logs for all tenants and instances
            return allTenantLogs;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('changestatusAction', async (req) => {
        const { ids, status, tenants } = req.data;

        // Validate the provided IDs
        if (!Array.isArray(ids) || ids.length === 0) {
            return req.error(400, 'No IDs provided');
        }

        // Get tenant names from the request or default to predefined tenants
        const tenantNames = tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        console.log("Tenants to connect: ", tenantNames);

        const allResults = [];
        try {

            // Outer loop: Iterate through each tenant and update the status
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the current tenant's service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    // Initialize an array to store the results for this tenant
                    let tenantResults = [];

                    // Inner loop: Iterate over each workflow instance ID to update its status
                    for (const id of ids) {
                        const url = `/workflow-instances/${id}`;
                        console.log(`Updating status for ${id} at URL: ${url}`);

                        try {
                            // Perform the status update for the current workflow instance
                            const response = await workflowService.tx(req).patch(url, { status });
                            console.log(`Updated instance ${id} for tenant ${tenant}: `, response);

                            // Store success result for this instance
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: status,
                                result: 'success'
                            });
                        } catch (error) {
                            console.error(`Error updating instance ${id} for tenant ${tenant}: `, error.message);

                            // Store failure result for this instance
                            tenantResults.push({
                                tenant: tenant,
                                id: id,
                                status: status,
                                result: 'failed',
                                error: error.message
                            });
                        }
                    }

                    // Push tenant-specific results into the overall results array
                    allResults.push(...tenantResults);

                } catch (error) {
                    console.error(`Error connecting to tenant ${tenant}: `, error.message);

                    // If there's an error connecting to the tenant, add a failure result for all IDs
                    ids.forEach(id => {
                        allResults.push({
                            tenant: tenant,
                            id: id,
                            status: status,
                            result: 'failed',
                            error: `Connection failed: ${error.message}`
                        });
                    });
                }
            }

            // Return the results for all tenants and instances
            return allResults;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    //----------------------------------------------------------------------------------------------
    // this.on('deleteinstanse', async (req) => {
    //     const { ids } = req.data; // Expecting an array of IDs
    //     const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];

    //     console.log("Tenant names: ", tenantNames);
    //     console.log("Instance IDs to delete: ", ids);

    //     // Initialize an array to store the results
    //     let allTenantResults = [];
    //     try {
    //         // Outer loop: Iterate over each tenant and connect dynamically
    //         for (let tenant of tenantNames) {
    //             try {
    //                 // Dynamically connect to the tenant's workflow service
    //                 const workflowService = await cds.connect.to(tenant);
    //                 console.log(`Connected to ${tenant}`);

    //                 // Initialize an array to store the results for this tenant
    //                 let tenantResults = [];

    //                 // Inner loop: Iterate over each ID and attempt to delete the instance
    //                 for (const id of ids) {
    //                     const instanceDetails = await getWorkflowinstance(workflowService, req, id);
    //                     const url = `/workflow-instances`; // API URL for deleting instances
    //                     const body = [
    //                         {
    //                             id: id,
    //                             deleted: true
    //                         }
    //                     ];

    //                     console.log(`Attempting to delete instance with ID: ${id} in ${tenant}`);

    //                     try {
    //                         // Attempt to delete the workflow instance
    //                         const response = await workflowService.tx(req).patch(url, body);
    //                         console.log(`Deleted instance with ID: ${id} in ${tenant}`);

    //                         // Push success result into the tenant-specific results array
    //                         tenantResults.push({
    //                             tenant: tenant,
    //                             id: id,
    //                             status: "deleted",
    //                             response: instanceDetails.subject
    //                         });
    //                     } catch (error) {
    //                         console.error(`Error deleting workflow instance with ID: ${id} in ${tenant}:`, error);

    //                         // Push failure result into the tenant-specific results array
    //                         tenantResults.push({
    //                             tenant: tenant,
    //                             id: id,
    //                             status: "failed",
    //                             error: error.message
    //                         });
    //                     }
    //                 }

    //                 // After processing all IDs for this tenant, push the results to the main array
    //                 allTenantResults.push({
    //                     tenant: tenant,
    //                     results: tenantResults
    //                 });

    //             } catch (err) {
    //                 console.error(`Failed to connect or fetch data from ${tenant}:`, err);

    //                 // In case of tenant connection failure, push an error result
    //                 allTenantResults.push({
    //                     tenant: tenant,
    //                     error: err.message
    //                 });
    //             }
    //         }

    //         // Return the results for all tenants and all IDs
    //         return allTenantResults;
    //     } catch (error) {
    //         const statusCode = error.status || error.statusCode || 500;
    //         // Call the separate function to log the error
    //         return await logErrorToEntity(statusCode, error.message);
    //     }
    // });

    // Calculating the duration time of each automation with dynamic tenant connection.
    this.on('automationDetailsAction', async (req) => {
        const instanceId = req.data.instanceId;
        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];

        console.log("instanceId :::: ", instanceId);
        console.log("Tenant names: ", tenantNames);

        let allTenantDetails = [];
        try {
            // Outer loop: Iterate over each tenant and connect dynamically
            for (let tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant's workflow service
                    const workflowServices = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant}`);

                    let automationDetails = [];


                    // Fetch the execution logs for the workflow instance
                    const logsResponse = await workflowServices.tx(req).get(`/workflow-instances/${instanceId}/execution-logs`);
                    console.log("logsResponse for tenant", tenant, ": ", logsResponse);

                    // Object to store automation task details for this tenant

                    // Loop through the logs to extract automation task information
                    logsResponse.forEach(log => {
                        if (log.type === "AUTOMATIONTASK_CREATED") {
                            // Create a new entry for each automation task
                            automationDetails.push({
                                activityId: log.activityId,
                                automationName: log.subject,
                                startTime: new Date(log.timestamp),
                                status: "In Progress",
                                duration: null,
                                errorMessage: null
                            });
                        } else if (log.type === "AUTOMATIONTASK_COMPLETED") {
                            // Update the corresponding entry with completion details
                            const task = automationDetails.find(task => task.activityId === log.activityId);
                            if (task) {
                                task.status = "Completed";
                                const endTime = new Date(log.timestamp);
                                task.duration = (endTime - task.startTime) / 1000; // Duration in seconds
                            }
                        } else if (log.type === "AUTOMATIONTASK_FAILED") {
                            // Update the corresponding entry with failure details
                            const task = automationDetails.find(task => task.activityId === log.activityId);
                            if (task) {
                                task.status = "Failed";
                                const endTime = new Date(log.timestamp);
                                task.duration = (endTime - task.startTime) / 1000; // Duration in seconds
                                task.errorMessage = log.error.message; // Capture the error message
                            }
                        }
                    });

                    // After processing the logs for this tenant, push the results to the main array
                    allTenantDetails.push({
                        tenant: tenant,
                        instanceId: instanceId,
                        automationDetails: automationDetails
                    });

                } catch (error) {
                    console.log(`Error fetching logs for tenant ${tenant}, instance ${instanceId}: `, error.message);
                    // Push an error result for the tenant if something goes wrong
                    allTenantDetails.push({
                        tenant: tenant,
                        instanceId: instanceId,
                        error: error.message
                    });
                }
            }

            // Return the results for all tenants
            return allTenantDetails;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });
    async function getWorkflowinstance(workflowServices, req, id) {
        var res = await workflowServices.tx(req).get(`/workflow-instances/${id}`);
        console.log("Result : : : : ", res);
        const result = {
            subject: res.subject,
            status: res.status,
            startedAt: res.startedAt
        }
        return result;
    }
    async function calculateDuration(logs) {
        // Find the WORKFLOW_STARTED event
        const workflowStarted = logs.find(log => log.type === 'WORKFLOW_STARTED');
        // Find the last event (assuming it's the last log entry)
        const workflowEnd = logs[logs.length - 1];

        if (!workflowStarted) {
            throw new Error('No WORKFLOW_STARTED event found in logs');
        }

        // Convert timestamps to Date objects
        const startTime = new Date(workflowStarted.timestamp);
        const endTime = new Date(workflowEnd.timestamp);

        // Calculate the duration in milliseconds
        const durationMs = endTime - startTime;

        // Convert duration to a human-readable format (hours, minutes, seconds)
        const duration = {
            hours: Math.floor(durationMs / (1000 * 60 * 60)),
            minutes: Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((durationMs % (1000 * 60)) / 1000)
        };

        // Return the formatted duration string
        return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
    }


    //========================================Dt:- 30-09-24 ====================================
    this.on('fetchContextAction', async (req) => {
        const instanceIds = req.data.id;
        const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Fetch tenant names from request or set default values
        console.log("Fetching contexts for instance IDs: ", instanceIds);
        console.log("Tenants to connect: ", tenantNames);

        if (!instanceIds || tenantNames.length === 0) {
            return req.error(400, "Instance IDs and tenants are required.");
        }

        const allContexts = [];
        try {

            // Loop through each tenant to dynamically connect and fetch context
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);

                    // Fetch context for the given workflow instance ID
                    const contexts = await workflowService.tx(req).get(`/workflow-instances/${instanceIds}/context`);
                    console.log(`Contexts for instance ${instanceIds} in tenant ${tenant}: `, contexts);

                    // Store the contexts along with tenant information
                    allContexts.push({
                        tenant: tenant,
                        instanceId: instanceIds,
                        context: contexts
                    });
                } catch (error) {
                    console.error(`Error fetching contexts for instance ${instanceIds} from tenant ${tenant}: `, error.message);

                    // Store error result for this tenant and instance ID
                    allContexts.push({
                        tenant: tenant,
                        instanceId: instanceIds,
                        context: null,
                        error: `Failed to fetch context: ${error.message}`
                    });
                }
            }

            // Return all the collected contexts for all tenants
            return { allContexts };
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('fetchErrorAction', async (req) => {
        const Ids = req.data.id;
        const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Dynamically handle tenant names
        console.log("Fetching error messages for instance IDs: ", Ids);
        console.log("Tenants to connect: ", tenantNames);

        if (!Ids || tenantNames.length === 0) {
            return req.error(400, "Instance IDs and tenants are required.");
        }

        const allErrors = [];
        try {

            // Loop through each tenant to dynamically connect and fetch error messages
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflow = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);

                    // Fetch error messages for the given workflow instance ID
                    const errors = await workflow.tx(req).get(`/workflow-instances/${Ids}/error-messages`);
                    console.log(`Errors for instance ${Ids} in tenant ${tenant}: `, errors);

                    // Store the errors along with tenant information
                    allErrors.push({
                        tenant: tenant,
                        instanceId: Ids,
                        errors: errors
                    });
                } catch (error) {
                    console.error(`Error fetching errors for instance ${Ids} from tenant ${tenant}: `, error.message);

                    // Store error result for this tenant and instance ID
                    allErrors.push({
                        tenant: tenant,
                        instanceId: Ids,
                        errors: null,
                        error: `Failed to fetch error messages: ${error.message}`
                    });
                }
            }

            // Return all the collected error messages for all tenants
            return { allErrors };
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('getRunningHoldAction', async (req) => {
        const { id, status } = req.data;
        const tenantNames = req.data.tenants || ['Tenant1', 'Tenant2', 'Tenant3']; // Dynamically handle tenant names
        console.log("Fetching status update for instance ID:", id);
        console.log("Tenants to connect: ", tenantNames);

        if (!id || tenantNames.length === 0) {
            return req.error(400, "Instance ID and tenants are required.");
        }

        const results = [];
        try {

            // Loop through each tenant to dynamically connect and update workflow instance
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const workflowService = await cds.connect.to(tenant);
                    console.log(`Connected to workflow service for tenant: ${tenant}`);

                    const url = `/workflow-instances/${id}`;
                    console.log(`Update URL for tenant ${tenant}: ${url}`);

                    // Update the workflow instance with the provided status
                    const response = await workflowService.tx(req).patch(url, { status });
                    console.log(`Updated status for instance ${id} in tenant ${tenant}:`, response);

                    // Store the successful result
                    results.push({
                        tenant: tenant,
                        id: id,
                        status: status,
                        result: 'success'
                    });
                } catch (error) {
                    console.error(`Error updating workflow instance ${id} for tenant ${tenant}:`, error.message);

                    // Store the failure result for this tenant
                    results.push({
                        tenant: tenant,
                        id: id,
                        status: status,
                        result: 'failed',
                        error: `Failed to update instance: ${error.message}`
                    });
                }
            }

            // Return the results for all tenants
            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('getProcessorAction', async (req) => {
        const { id, processor, tenants } = req.data;  // Assuming tenants are passed in the request data
        const tenantNames = tenants || ['Tenant1', 'Tenant2', 'Tenant3'];  // Default tenant names if not provided
        console.log("Task ID:", id);
        console.log("Processor:", processor);
        console.log("Tenants to update:", tenantNames);

        if (!id || tenantNames.length === 0) {
            return req.error(400, "Task ID and tenants are required.");
        }

        const results = [];
        try {

            // Loop through each tenant and connect to its workflow service
            for (const tenant of tenantNames) {
                try {
                    // Dynamically connect to the tenant-specific workflow service
                    const taskService = await cds.connect.to(tenant);
                    console.log(`Connected to task service for tenant: ${tenant}`);

                    const url = `/task-instances/${id}`;
                    console.log(`Task URL for tenant ${tenant}: ${url}`);

                    // Update the processor for the task instance
                    const response = await taskService.tx(req).patch(url, { processor });
                    console.log(`Updated processor for task instance ${id} in tenant ${tenant}:`, response);

                    // Store the successful result
                    results.push({
                        tenant: tenant,
                        id: id,
                        processor: processor,
                        result: 'success'
                    });
                } catch (error) {
                    console.error(`Error updating task instance ${id} for tenant ${tenant}:`, error.message);

                    // Store the failure result for this tenant
                    results.push({
                        tenant: tenant,
                        id: id,
                        processor: processor,
                        result: 'failed',
                        error: `Failed to update task: ${error.message}`
                    });
                }
            }

            // Return the results for all tenants
            return results;
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    this.on('fetchCombinedDataAction', async (req) => {
        const tenantNames = req.data.tenants || ['SBPATenant1', 'SBPATenant2', 'SBPATenant3'];
        const ids = req.data.ids || [];

        let combinedResults = [];

        try {
            // First, fetch task definitions for all tenants
            for (let tenant of tenantNames) {
                try {
                    const taskService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant} for Task Definitions`);

                    const taskDefinitions = await taskService.tx(req).get("/task-definitions");
                    console.log(`Task Definitions for ${tenant}:`, taskDefinitions);

                    // Push task definitions to the combined results
                    combinedResults.push({
                        tenant: tenant,
                        taskDefinitions: taskDefinitions // Keep it as an object
                    });
                } catch (err) {
                    console.error(`Failed to fetch task definitions from ${tenant}:`, err.message);
                    combinedResults.push({ tenant: tenant, error: `Task Definitions error: ${err.message}` });
                }
            }

            // Next, fetch execution logs for all tenants and ids
            for (let tenant of tenantNames) {
                try {
                    const logService = await cds.connect.to(tenant);
                    console.log(`Connected to ${tenant} for Execution Logs`);

                    for (let id of ids) {
                        try {
                            const executionLogs = await logService.tx(req).get(`/workflow-instances/${id}/execution-logs`);
                            console.log(`Execution Logs for instance ${id} in ${tenant}:`, executionLogs);

                            // Push execution logs to the combined results
                            combinedResults.push({
                                tenant: tenant,
                                instanceId: id,
                                executionLogs: executionLogs // Keep it as an object
                            });
                        } catch (err) {
                            console.error(`Failed to fetch execution logs for ${id} in ${tenant}:`, err.message);
                            combinedResults.push({
                                tenant: tenant,
                                instanceId: id,
                                error: `Execution Logs error: ${err.message}`
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Failed to connect to ${tenant} for execution logs:`, err.message);
                    combinedResults.push({ tenant: tenant, error: `Connection error: ${err.message}` });
                }
            }

            // Return the combined results directly as structured JSON
            return combinedResults; // Return the structured objects directly
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });
    //============================================================================================================================
    //For Destination API
    //=============================================================================================================================
    async function getNextID(req) {
        // Start a transaction for the request
        const tx = cds.tx(req);
        try {
            // Fetch the maximum ID from the Destinations table
            const latestDestination = await tx.run(
                SELECT.one.from(Destinations).columns('ID').orderBy({ ID: 'desc' })
            );

            // Determine the next ID
            let newID = 1; // Default to 1 if no records found
            if (latestDestination) {
                newID = latestDestination.ID + 1; // Increment the latest ID
            }

            return newID; // Return the new ID
        } catch (error) {
            console.error('Error fetching the latest ID:', error);
            req.error(500, 'Failed to retrieve the next ID');
        }
    }

    async function createDestinationInBTP(req, payload) {
        // Start a transaction for the request
        const service = await cds.connect.to('DestinationService');
        console.log("Connected to DestinationService");

        try {
            // POST request to create the destination
            const response = await service.tx(req).post("/subaccountDestinations", payload);
            console.log('Destination created:', response);


            // const insertResponse = await INSERT.into(Tenants).entries(tenantData);
            // console.log('Tenant data inserted:', insertResponse);

            return response; // Return both the created destination and the stored tenant data
        } catch (error) {
            console.error('Error creating destination or storing tenant data:', error);
            throw new Error('Error creating destination or storing tenant data');
        }
    }

    this.on('CreateDestination', async (req) => {
        try {
            // Get the relevant data from the request payload (excluding ID)
            const { dest_url, client_ID, client_secret, token_srv_url } = req.data;

            // Get the next ID
            const newID = await getNextID(req);
            const destName = "SBPATenant" + newID;

            const createPayload = {
                Type: "HTTP",
                clientId: client_ID,
                HTML5DynamicDestination: true,
                Authentication: "OAuth2ClientCredentials",
                Name: destName,
                WebIDEEnabled: true,
                tokenServiceURL: token_srv_url,
                ProxyType: "Internet",
                URL: dest_url,
                tokenServiceURLType: "Dedicated",
                clientSecret: client_secret
            }

            // Extract the tokenServiceURL from the response (or if part of the original payload)
            const tokenServiceURL = token_srv_url;
            if (!tokenServiceURL) {
                throw new Error('tokenServiceURL is missing in the response or payload');
            }

            // Extract tenant name from tokenServiceURL
            const tenantName = tokenServiceURL.split('.')[0].replace('https://', ''); // Extract "acdea487trial"
            console.log('Extracted tenantName:', tenantName);
            // Insert the new record with the new ID
            const result = await INSERT.into(Destinations).entries({
                ID: newID,
                display_Name: tenantName,
                dest_name: destName,
                dest_url,
                client_ID,
                client_secret,
                token_srv_url
            });

            await createDestinationInBTP(req, createPayload);

            // Return the result or confirmation message
            return {
                message: 'Destination created successfully',
                newID: newID // Return just the new ID
            };
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    // Action to update destinations
    // Action handler for UpdateDestination
    // Action handler for UpdateDestination
    // this.on('UpdateDestination', async (req) => {
    //     try {
    //         const { ID } = req.data; // Extract the selected tenant IDs from the request payload

    //         if (!ID || ID.length === 0) {
    //             req.error(400, "No tenant IDs provided");
    //             return;
    //         }

    //         // Fetch all destination data based on the provided IDs
    //         const selectedDestinations = await SELECT.from(Destinations).where({ ID: { in: ID } });

    //         if (selectedDestinations.length === 0) {
    //             req.error(404, "No matching destinations found for the provided IDs");
    //             return;
    //         }

    //         // Fetch all BTP destinations starting with "SBPATenant"
    //         const existingBTPDestinations = await getBTPDestinationsStartingWithSBPATenant(req);

    //         // Prepare an array to hold update promises
    //         const updatePromises = [];

    //         // Loop through the selected destinations and corresponding BTP destinations
    //         for (let i = 0; i < existingBTPDestinations.length && i < selectedDestinations.length; i++) {
    //             const btDestination = existingBTPDestinations[i];
    //             const entityDestination = selectedDestinations[i];

    //             // Prepare the payload to update BTP destination details
    //             const updatePayload = {
    //                 Type: "HTTP",
    //                 clientId: entityDestination.client_ID,
    //                 HTML5DynamicDestination: true,
    //                 Authentication: "OAuth2ClientCredentials",
    //                 Name: btDestination.Name, // Keep the existing name (e.g., SBPATenant1)
    //                 WebIDEEnabled: true,
    //                 tokenServiceURL: entityDestination.token_srv_url,
    //                 ProxyType: "Internet",
    //                 URL: entityDestination.dest_url,
    //                 tokenServiceURLType: "Dedicated",
    //                 clientSecret: entityDestination.client_secret
    //                 // Add any additional fields that are needed
    //             };

    //             // Log the payload for debugging
    //             console.log('Updating BTP destination with payload:', updatePayload);

    //             // Perform the PATCH request to update the BTP destination
    //             const updatePromise = updateBTPDestination(req, updatePayload);
    //             updatePromises.push(updatePromise);
    //         }

    //         // Wait for all update promises to resolve
    //         await Promise.all(updatePromises);

    //         // Return a success message
    //         return {
    //             message: 'Destinations updated successfully'
    //         };

    //     } catch (error) {
    //         const statusCode = error.status || error.statusCode || 500;
    //         // Call the separate function to log the error
    //         return await logErrorToEntity(statusCode, error.message);
    //     }
    // });

    this.on('UpdateDestination', async (req) => {
        try {
            const { ID } = req.data; // Extract the selected tenant IDs from the request payload
    
            if (!ID || ID.length === 0) {
                req.error(400, "No tenant IDs provided");
                return;
            }
    
            const service = await cds.connect.to('DestinationService'); // Connect to BTP destination service
    
            // Prepare an array to hold update promises for each destination
            const updatePromises = [];
    
            // Loop through each ID to process one at a time
            for (const tenantId of ID) {
                // Fetch destination data for the current ID
                const entityDestination = await SELECT.one.from(Destinations).where({ ID: tenantId });
    
                if (!entityDestination) {
                    console.log(`No destination found for ID: ${tenantId}`);
                    continue;
                }
    
                // Prepare the payload with the fetched data
                const updatePayload = {
                    Type: "HTTP",
                    clientId: entityDestination.client_ID,
                    HTML5DynamicDestination: true,
                    Authentication: "OAuth2ClientCredentials",
                    Name: entityDestination.dest_name, // Use the existing name (e.g., SBPATenant1)
                    WebIDEEnabled: true,
                    tokenServiceURL: entityDestination.token_srv_url,
                    ProxyType: "Internet",
                    URL: entityDestination.dest_url,
                    tokenServiceURLType: "Dedicated",
                    clientSecret: entityDestination.client_secret
                    // Additional fields if needed
                };
    
                console.log(`Updating BTP destination for ID: ${tenantId} with payload:`, updatePayload);
    
                // Perform the PATCH request to update the BTP destination
                const updatePromise = service.tx(req).put(`/subaccountDestinations`, updatePayload);
                updatePromises.push(updatePromise);
            }
    
            // Wait for all update promises to resolve
            await Promise.all(updatePromises);
    
            // Return a success message
            return {
                message: 'Destinations updated successfully'
            };
    
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            console.error('Error updating destinations:', error.message);
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
            // return error;
        }
    });

    // Function to fetch all BTP destinations starting with "SBPATenant"
    // async function getBTPDestinationsStartingWithSBPATenant(req) {
    //     const service = await cds.connect.to('DestinationService');

    //     try {
    //         // GET request to fetch all destinations from the BTP subaccount
    //         const btpDestinations = await service.tx(req).get('/subaccountDestinations');

    //         // Filter destinations starting with "SBPATenant"
    //         return btpDestinations.filter(destination => destination.Name.startsWith("SBPATenant"));
    //     } catch (error) {
    //         console.error('Error fetching BTP destinations:', error);
    //         req.error(500, 'Failed to retrieve BTP destinations');
    //     }
    // }

    // Function to update BTP destination details using PATCH call
    // async function updateBTPDestination(req, payload) {
    //     const service = await cds.connect.to('DestinationService');
    //     console.log("Connected to DestinationService");
    //     // Construct request to UPDATE data using PATCH
    //     try {
    //         // The destination name will be part of the payload, so no need for URL adjustments
    //         const response = await service.tx(req).put(`/subaccountDestinations`, payload);
    //         console.log('Destination updated:', response);
    //         return response;
    //     } catch (error) {
    //         console.error('Error updating destination:', error);
    //         throw new Error('Error updating destination');
    //     }
    // }


    this.on('UpdateEntityDestination', async (req) => {
        const { ID, dest_name, display_Name, dest_url, client_ID, client_secret, token_srv_url } = req.data;

        // Build the update payload
        const updateData = {
            dest_name,
            display_Name,
            dest_url,
            client_ID,
            client_secret,
            token_srv_url
        };

        try {
            // Execute the update using the CAP framework
            const result = await UPDATE(Destinations).set(updateData).where({ ID: ID });

            // Check if the update affected any rows (if no rows were updated, the ID might be invalid)
            if (result === 0) {
                return req.error(404, `Destination with ID ${ID} not found.`);
            }

            return { message: `Destination with ID ${ID} updated successfully.` };
        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    //newly Added Dt:-15-10-2024============================================================================
    this.on('getfilteration', async (req) => {
        console.log("Request Data ::", req.data);

        const queryParams = req.data;
        console.log("Received Status ::", queryParams.status);

        // Handle status filter
        let statusFilterArray = queryParams.status ? queryParams.status.split(',') : [];
        const urlParams = new URLSearchParams({
            containsText: queryParams.containsText || '',
            definitionId: queryParams.definitionId || '',
            startedBy: queryParams.startedBy || '',
            startedFrom: queryParams.startedFrom || '',
            startedUpTo: queryParams.startedUpTo || '',
            completedFrom: queryParams.completedFrom || '',
            completedUpTo: queryParams.completedUpTo || '',
            projectId: queryParams.projectId || '',
            id: queryParams.id || '',
        });
        statusFilterArray.forEach(status => {
            urlParams.append('status', status.trim());
        });

        console.log("Passed Data ::", urlParams);

        try {
            const url = `/workflow-instances?${urlParams}`;
            console.log("Final URL ::", url);

            // Retrieve tenants from the request
            const tenantData = req.data.tenants;
            let tenantNames = Array.isArray(tenantData) ? tenantData : tenantData.split(',');

            let allData = [];
            for (let tenant of tenantNames) {
                try {
                    // Call readwfInstance with each tenant
                    const data = await readwfInstance(req, url, tenant);
                    console.log(`Instance Result from ${tenant}:: `, data);
                    // Add the tenant name to each item in the data array
                   const updatedData = data.map(item => ({
                    ...item,
                     tenant: tenant
            }));

                    // Aggregate data from each tenant
                    allData.push({
                        tenant: tenant,
                        data: updatedData
                    });
                } catch (error) {
                    console.error(`Error fetching data from tenant ${tenant} ::`, error);
                }
            }

            return allData;

        } catch (error) {
            const statusCode = error.status || error.statusCode || 500;
            // Call the separate function to log the error
            return await logErrorToEntity(statusCode, error.message);
        }
    });

    async function readwfInstance(req, url, tenant) {
        try {
            // Connect to the tenant dynamically
            const workflowService = await cds.connect.to(tenant);
            console.log(`Connected to ${tenant}`);

            console.log("URLDest", url);

            // Fetch data for the given URL
            const response = await workflowService.tx(req).get(url);
            console.log(`Instance Data from ${tenant} : : : : `, response);
            return response;

        } catch (error) {
            console.error(`Error fetching data from ${tenant} : : : : `, error);
            req.error(error);
            return [];
        }
    }


    //  :::::::::::::::::::::::::::::::::::::::::: Error Logs Function :::::::::::::::::::::::::::::::::::::::::::::::::::::

    async function logErrorToEntity(statusCode, errorMessage) {
        // Insert the error details into the ErrorLogs entity
        await cds.run(INSERT.into(ErrorLogs).entries({
            ID: cds.utils.uuid(), // Generate a unique ID
            statusCode: statusCode, // Use the status code from the error object
            errorMessage: errorMessage,
            timestamp: new Date() // Current timestamp
        }));
    }

});

