import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb';
import Instance from '../../../models/Instance';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

const REGIONS = [
  'us-east-1', 'us-east-2'
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

  console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
  console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);

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

export async function GET(req: NextRequest) {
  const currentTime = Date.now();

  if (currentTime - lastUpdateTimestamp < 1000) {
    // Less than 30 seconds since the last update
    console.log('Returning cached data');
    try {
      await connectMongo();
      const instances = await Instance.find().sort({ updatedAt: -1 }).limit(100);
      return NextResponse.json(instances, { status: 200 });
    } catch (error) {
      console.error('Error fetching instances from MongoDB:', error);
      return NextResponse.json({ error: 'Failed to fetch EC2 instances' }, { status: 500 });
    }
  }

  lastUpdateTimestamp = currentTime;

  try {
    await fetchAndStoreEC2Instances();
    const instances = await Instance.find().sort({ updatedAt: -1 }).limit(100);
    return NextResponse.json(instances, { status: 200 });
  } catch (error) {
    console.error('Error fetching instances from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch EC2 instances' }, { status: 500 });
  }
}
