var gcloud = require('gcloud');

module.exports = {
  scaleUpDown: function(context, data) {
    var instanceGroup = data['instance-group'];
    var scaleTo = data['scale-to'];
    
    if (!instanceGroup) {
      context.failure(
        'Instance group not provided. Make sure you have a \'instance-grouo\' property in ' +
        'your request');
      return;
    }
    if (!scaleTo) {
      context.failure(
        'Scale index not provided. Make sure you have a \'scale-to\' property in ' +
        'your request');
      return;
    }
    console.log('instance-group:' + instanceGroup);
    console.log('scale-to:' + scaleTo);
    
    // Create a gce client.
    var gce = gcloud.compute({
      // We're using the API from the same project as the Cloud Function.
      projectId: process.env.GCP_PROJECT,
    });
    
    //get a zone object
    var zone = gce.zone('us-east1-b');
    
    //get all the autoscalers
    zone.getAutoscalers(function(err, autoscalers) {
      // autoscalers is an array of `Autoscaler` objects
      if (!err){
        for (var i=0; i < autoscalers.length; i++){
          var target = autoscalers[i].metadata['target'];
          console.log('value of target = ' + target);
          if (target.indexOf(instanceGroup) > -1){
            console.log('Found it!!!');
            //set min instances to scaleTo value
            var oldValue = autoscalers[i].metadata.autoscalingPolicy['minNumReplicas'];
            console.log('old value = ' + oldValue);
            autoscalers[i].metadata.autoscalingPolicy['minNumReplicas'] = scaleTo;
            if (oldValue != scaleTo) {
              console.log('new value = ' + autoscalers[i].metadata.autoscalingPolicy['minNumReplicas']);
              autoscalers[i].setMetadata(autoscalers[i].metadata, function(err, operation, apiResponse) {
                // `operation` is an Operation object that can be used to check the status
                // of the request.
                operation.on('complete', function(metadata) {
                  // The operation is complete.
                  console.log('Modified metadata set!');
                  context.success('Success! Instance group scaled to minimum of ' + scaleTo + '. [Original value was ' + oldValue + '.]')
                });
                operation.on('error', function(err) {
                  // An error occurred during the operation.
                  console.log('error: ' + err);
                  context.failure('An error occured. Scaling not set.');
                });
              });
            }else{
              console.log('ScaleTo matched existing minReplicas. No need to set.');
              context.success('Success! ScaleTo value already set on instance group.');
            };
          };
          //console.log('Autoscaler [' + i + ']');
          //console.log('name = ' + autoscalers[i].name);
          //console.log('target = ' + autoscalers[i].metadata['target']);
          //console.log('metadata = ' + Object.keys(autoscalers[i].metadata));
          //console.log('policy = ' + Object.keys(autoscalers[i].metadata.autoscalingPolicy));
        }
      }else{
        context.failure('No autoscalers found in us-east1-b zone!');
      }
    });
  },
};
