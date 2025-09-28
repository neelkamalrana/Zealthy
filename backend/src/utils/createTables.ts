import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, ScalarAttributeType, KeyType, BillingMode } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createTables() {
  const tables = [
    {
      TableName: 'ZealthyUsers',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' as KeyType }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType }
      ],
      BillingMode: 'PAY_PER_REQUEST' as BillingMode
    },
    {
      TableName: 'ZealthyProviders',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' as KeyType }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType }
      ],
      BillingMode: 'PAY_PER_REQUEST' as BillingMode
    },
    {
      TableName: 'ZealthyMedications',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' as KeyType }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' as ScalarAttributeType }
      ],
      BillingMode: 'PAY_PER_REQUEST' as BillingMode
    }
  ];

  for (const table of tables) {
    try {
      // Check if table exists
      await dynamoDBClient.send(new DescribeTableCommand({ TableName: table.TableName }));
      console.log(`✅ Table ${table.TableName} already exists`);
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        try {
          await dynamoDBClient.send(new CreateTableCommand(table));
          console.log(`✅ Created table ${table.TableName}`);
        } catch (createError) {
          console.error(`❌ Error creating table ${table.TableName}:`, createError);
        }
      } else {
        console.error(`❌ Error checking table ${table.TableName}:`, error);
      }
    }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createTables().then(() => {
    console.log('✅ Table creation process completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Error in table creation:', error);
    process.exit(1);
  });
}
