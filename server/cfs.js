/*
 * accessKeyId: "account or IAM key", //required if environment variables are not set
 * secretAccessKey: "account or IAM secret", //required if environment variables are not set
 */
var webshotStore = new FS.Store.S3("webshots", {
  region: "eu-west-1",
  bucket: "doingthiswith",
  ACL: 'public'
});

Webshots = new FS.Collection("webshots", {
  stores: [ webshotStore ]
});
