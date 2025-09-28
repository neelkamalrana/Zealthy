import { docClient } from '../config/dynamodb';
import { 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand,
  QueryCommand 
} from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  appointments?: Appointment[];
  prescriptions?: Prescription[];
}

export interface Appointment {
  id: string;
  provider: string;
  datetime: string;
  repeat: 'weekly' | 'monthly' | 'none';
  isActive: boolean;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate: string;
  refill_schedule?: string;
  isActive: boolean;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  isActive: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosages: string[];
  isActive: boolean;
}

export class UserService {
  private static readonly TABLE_NAME = 'ZealthyUsers';

  static async create(user: User): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = { ...user, password: hashedPassword };
    const command = new PutCommand({
      TableName: this.TABLE_NAME,
      Item: newUser,
    });
    await docClient.send(command);
    return newUser;
  }

  static async createSeed(user: User): Promise<User> {
    // For seeding, assume password is already hashed
    const command = new PutCommand({
      TableName: this.TABLE_NAME,
      Item: user,
    });
    await docClient.send(command);
    return user;
  }

  static async getById(id: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: this.TABLE_NAME,
      Key: { id },
    });
    const result = await docClient.send(command);
    return result.Item as User || null;
  }

  static async getByEmail(email: string): Promise<User | null> {
    const command = new ScanCommand({
      TableName: this.TABLE_NAME,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });
    const result = await docClient.send(command);
    return result.Items?.[0] as User || null;
  }

  static async getAll(): Promise<User[]> {
    const command = new ScanCommand({
      TableName: this.TABLE_NAME,
    });
    const result = await docClient.send(command);
    return result.Items as User[] || [];
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    // Handle reserved keywords by using ExpressionAttributeNames
    const reservedKeywords = ['name', 'date', 'type'];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    const updateExpression = Object.keys(updates)
      .map(key => {
        if (reservedKeywords.includes(key)) {
          const attributeName = `#${key}`;
          expressionAttributeNames[attributeName] = key;
          return `${attributeName} = :${key}`;
        }
        return `${key} = :${key}`;
      })
      .join(', ');
    
    Object.keys(updates).forEach(key => {
      expressionAttributeValues[`:${key}`] = updates[key as keyof User];
    });

    const command = new UpdateCommand({
      TableName: this.TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    
    const result = await docClient.send(command);
    return result.Attributes as User;
  }

  static async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.TABLE_NAME,
      Key: { id },
    });
    await docClient.send(command);
  }
}

export class ProviderService {
  private static readonly TABLE_NAME = 'ZealthyProviders';

  static async create(provider: Provider): Promise<Provider> {
    const command = new PutCommand({
      TableName: this.TABLE_NAME,
      Item: provider,
    });
    await docClient.send(command);
    return provider;
  }

  static async getAll(): Promise<Provider[]> {
    const command = new ScanCommand({
      TableName: this.TABLE_NAME,
    });
    const result = await docClient.send(command);
    return result.Items as Provider[] || [];
  }

  static async getById(id: string): Promise<Provider | null> {
    const command = new GetCommand({
      TableName: this.TABLE_NAME,
      Key: { id },
    });
    const result = await docClient.send(command);
    return result.Item as Provider || null;
  }

  static async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.TABLE_NAME,
      Key: { id },
    });
    await docClient.send(command);
  }
}

export class MedicationService {
  private static readonly TABLE_NAME = 'ZealthyMedications';

  static async create(medication: Medication): Promise<Medication> {
    const command = new PutCommand({
      TableName: this.TABLE_NAME,
      Item: medication,
    });
    await docClient.send(command);
    return medication;
  }

  static async getAll(): Promise<Medication[]> {
    const command = new ScanCommand({
      TableName: this.TABLE_NAME,
    });
    const result = await docClient.send(command);
    return result.Items as Medication[] || [];
  }
}
