import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '../../../lib/mongodb';
import Instance from '../../../models/Instance';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    const instances = await Instance.find().sort({ updatedAt: -1 }).limit(100); // Fetch the most recent 100 instances
    return NextResponse.json(instances, { status: 200 });
  } catch (error) {
    console.error('Error fetching instances from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch EC2 instances' }, { status: 500 });
  }
}
