namespace my.bookshop;
using { cuid, managed } from '@sap/cds/common';
entity Destinations {
    key ID          : Integer;
    dest_name       : String(250);
    display_Name    : String(250);
    dest_url        : String(250);
    client_ID       : String(250);
    client_secret   : String(250);
    token_srv_url   : String(250);
}
entity WorkflowInstances {
            key id               : String;
                definitionId         : String;
                definitionVersion    : String;
                subject              : String;
                status               : String;
                businessKey          : String;
                parentInstanceId     : String;
                rootInstanceId       : String;
                applicationScope     : String;
                projectId            : String;
                projectVersion       : String;
                environmentId        : String;
                startedBy            : String;
                completedAt          : DateTime;
                startedAt            : DateTime;
                cascade              : Boolean;

            }
entity ErrorLogs {
    key ID          : UUID;
    statusCode  : Integer;
    errorMessage: String;
    timestamp   : DateTime;
}  
entity DeletedInstances : managed {
    key ID              : UUID;
    instanceID          : String;
    status              : String;
    subject             : String;
}          