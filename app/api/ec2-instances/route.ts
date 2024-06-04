import { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '../../../lib/mongodb';
import Instance from '../../../models/Instance';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

const REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'af-south-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-1',
  'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1',
  'ap-southeast-2', 'ca-central-1', 'eu-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'me-south-1', 'sa-east-1'
];

let lastUpdateTimestamp = 0;

interface InstanceType {
  name: string;
  id: string;
  type: string;
  state: string;
  az: string;
  publicIp: string;
  privateIp: string;
  region: string;
}

const fetchAndStoreEC2Instances = async () => {
  await connectMongo();

  for (const region of REGIONS) {
    const ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new DescribeInstancesCommand({});
    const data = await ec2Client.send(command);

    const instances: InstanceType[] = data.Reservations?.flatMap((reservation) =>
      reservation.Instances?.map((instance) => ({
        name: instance.Tags?.find((tag) => tag.Key === 'Name')?.Value || 'N/A',
        id: instance.InstanceId || 'N/A',
        type: instance.InstanceType || 'N/A',
        state: instance.State?.Name || 'N/A',
        az: instance.Placement?.AvailabilityZone || 'N/A',
        publicIp: instance.PublicIpAddress || 'N/A',
        privateIp: instance.PrivateIpAddress || 'N/A',
        region,
      })) || []
    ) || [];

    // Upsert each instance in MongoDB
    for (const instance of instances) {
      await Instance.findOneAndUpdate(
        { id: instance.id },
        { $set: instance },
        { upsert: true }
      );
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const currentTime = Date.now();

  if (currentTime - lastUpdateTimestamp < 30000) {
    // Less than 30 seconds since the last update
    console.log('Returning cached data');
    try {
      await connectMongo();
      const instances = await Instance.find().sort({ updatedAt: -1 }).limit(100);
      return res.status(200).json(instances);
    } catch (error) {
      console.error('Error fetching instances from MongoDB:', error);
      return res.status(500).json({ error: 'Failed to fetch EC2 instances' });
    }
  }

  lastUpdateTimestamp = currentTime;

  try {
    await fetchAndStoreEC2Instances();
    const instances = await Instance.find().sort({ updatedAt: -1 }).limit(100);
    return res.status(200).json(instances);
  } catch (error) {
    console.error('Error fetching instances from MongoDB:', error);
    return res.status(500).json({ error: 'Failed to fetch EC2 instances' });
  }
};

export default handler;
