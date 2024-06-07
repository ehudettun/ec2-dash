//This cron was a nice try, but we are moving to refresh with throttling within the api route 
const cron = require('node-cron');
require('dotenv').config(); // Load environment variables
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const connectMongo = require('./lib/mongodb');
const Instance = require('./models/Instance');

const REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-1',
  'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1',
  'ap-southeast-2', 'ca-central-1', 'eu-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'me-south-1', 'sa-east-1'
];

const fetchAndStoreEC2Instances = async () => {
  //console.log("MONGODBURI:"+process.env.MONGODB_URI)
  try {
    await connectMongo();

    for (const region of REGIONS) {
      const ec2Client = new EC2Client({
        region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new DescribeInstancesCommand({});
      const data = await ec2Client.send(command);

      const instances = data.Reservations?.flatMap((reservation) =>
        reservation.Instances?.map((instance) => ({
          name: instance.Tags?.find((tag) => tag.Key === 'Name')?.Value || 'N/A',
          id: instance.InstanceId,
          type: instance.InstanceType,
          state: instance.State?.Name,
          az: instance.Placement?.AvailabilityZone,
          publicIp: instance.PublicIpAddress || 'N/A',
          privateIp: instance.PrivateIpAddress || 'N/A',
          region,
        }))
      );

      // Upsert each instance in MongoDB
      for (const instance of instances) {
        await Instance.findOneAndUpdate(
          { id: instance.id },
          { $set: instance },
          { upsert: true }
        );
      }
    }

    console.log('EC2 instances updated');
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
  }
};

// Schedule the job to run every minute
cron.schedule('* * * * *', fetchAndStoreEC2Instances);
