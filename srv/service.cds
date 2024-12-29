using my.bookshop as my from '../db/schema';


service ExternalService {
   entity Destinations as projection on my.Destinations;
   entity WorkflowInstances as projection on my.WorkflowInstances;
   entity ErrorLogs as projection on my.ErrorLogs;
   entity DeletedInstances as projection on my.DeletedInstances;
   
   
      
  // }
   action getDestination() returns array of String;
   //action fetchTaskDefinitions(tenants:array of String) returns array of String;

  action fetchCombinedDataAction(tenants: array of String, ids: array of String) returns array of String;

   //|------------------------------------------------------------------------------|
                //Action  API           
   //|------------------------------------------------------------------------------|
    action fetchWorkFlowAction(tenants:array of String) returns array of String;
    action WorkflowDefinitionsAction(tenants:array of String) returns array of String;
    //action fetchWorkFlow(tenants:array of String) returns array of String;
   
    action ExecutionLogsAction(ids: array of String,tenants:array of String)    returns array of String;
    action changestatusAction(ids: array of String, status:String,tenants:array of String)  returns array of String;
    action deleteinstanse(ids: array of String,tenants:array of String)   returns array of String;
    action automationDetailsAction(instanceId:array of String,tenants:array of String)   returns array of String;
    
    function sum (x:Integer, y:Integer) returns Integer;
    function testFunction(instanceId: array of String, tenants: array of String) returns String;
    //Dt:- 30-09-24
    
     action fetchContextAction(id:String,tenants:array of String) returns String;
     action fetchErrorAction(id:String,tenants:array of String) returns String;
     action getRunningHoldAction(id: String, status:String,tenants:array of String) returns array of String;
     action getProcessorAction(id: String, processor: String, status:String,tenants:array of String) returns array of String;
     //date:-15-10-25
   //   function getfilteration(status: String,containsText:String,definitionId:String,startedBy:String,startedFrom:String,startedUpTo:String,completedFrom:String,completedUpTo:String,projectId:String,id: String,tenants:array of String) returns array of String;
   function getfilteration(status: String,tenants: String) returns array of String;

    //============================================================================================================================
       //for Destination Api
    //============================================================================================================================
    action CreateDestination(dest_url: String(250), client_ID: String(250), client_secret: String(250), token_srv_url: String(250))                                                          returns String;
    action UpdateDestination(ID: array of Integer)                                                          returns String;
    action UpdateEntityDestination(ID: Integer, dest_name: String(250), display_Name: String(250), dest_url: String(250), client_ID: String(250), client_secret: String(250), token_srv_url: String(250))                                                          returns String;
    //==================================================================================================
                      //Function API
    //==================================================================================================
      function fetchWorkFlow(tenants:String(500)) returns array of String;
      function fetchWorkFlowById (tenants:String(500),ids:String) returns array of String;
      function automationDetails(instanceId:String,tenants:String)   returns array of String;
      function WorkflowDefinitions(tenants:String(500)) returns array of String;
      function ExecutionLogs(ids:String(500),tenants: String(500))    returns array of String;
      function changestatus(ids:String(500), status:String(500),tenants:String(500))  returns array of String;
      function fetchContext(id:String,tenants:String(500)) returns String;
      function fetchError(id:String,tenants:String(500)) returns String;
      function getRunningHold(id: String, status:String,tenants:String(500)) returns array of String;
      function getProcessor(id: String, processor: String, status:String,tenants:String) returns array of String;
      function fetchTaskDefinitions(tenants: String) returns array of String;
      function fetchTaskinstances(tenants: String) returns array of String;
      function fetchTaskinstancebyId(tenants: String,id:String) returns array of String;
      
      function fetchCombinedData(tenants:String(500), ids: String(500)) returns array of String;
      function fetchFilterTaskInstanceId(tenants: String,workflowInstanceId:String) returns array of String;
      function analyzeAutomationLoad(tenants: String,instanceIds: String)  returns array of String;


    function MyFunction(category : Integer) returns array of String



    
}