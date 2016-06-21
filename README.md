# node-gce-scale-up-down

Simple Cloud Function that can be used to set the minimum replicas in a GCE instance group
(or GKE cluster).

The function is triggered via HTTP.

To deploy:

gcloud alpha functions deploy scaleUpDown --region [REGION] --trigger-http --bucket [BUCKET TO DEPLOY SRC CODE]

To call:

curl -X POST https://us-east1.<project_id>.cloudfunctions.net/scaleUpDown --data '{"instance-group":"<YOUR_INSTANCE_GROUP>","scale-to":2}'

OR

call from App Script:

      Logger.log("Instance group: " + ign + ". Scaling to: " + num + ".");
      
      var payload = 
          {
            "instance-group" : ign,
            "scale-to" : num
          };
    
      Logger.log("Payload: " + JSON.stringify(payload));

      var options =
        {
          "method" : "post",
          "contentType" : "application/json",
          "payload" : JSON.stringify(payload)
        };
      
      Logger.log(JSON.stringify(options));

      var response = UrlFetchApp.fetch("https://us-east1.<project_id>.cloudfunctions.net/scaleUpDown", options);
    
      Logger.log("Response: " + response);
