'use server';

import dbConnect from '@/lib/db';
import Card, { ICard } from '@/models/Card';
import { getSession } from '@/lib/auth';

export type CardData = {
  uuid: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  preference: string;
  content?: string;
  createdAt?: string;
};

export type CardResponse = {
  success: boolean;
  data?: CardData;
  error?: string;
};

export type AllCardsResponse = {
  success: boolean;
  data?: CardData[];
  error?: string;
};

export async function getCardByUuid(uuid: string): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!uuid) {
    return { success: false, error: 'UUID is required' };
  }

  try {
    await dbConnect();
    // Using lean() for better performance
    const card = await Card.findOne({ uuid }).lean() as unknown as ICard;

    if (!card) {
      return { success: false, error: 'Card not found' };
    }

    return {
      success: true,
      data: {
        uuid: card.uuid,
        firstName: card.firstName,
        lastName: card.lastName,
        phone: card.phone,
        address: card.address,
        preference: card.preference,
        content: card.content,
        createdAt: card.createdAt?.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching card:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function createCard(data: CardData): Promise<CardResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!data.uuid || !data.firstName || !data.lastName) {
    return { success: false, error: 'Missing required fields' };
  }

  try {
    await dbConnect();
    // Check if exists first
    const existing = await Card.findOne({ uuid: data.uuid });
    if (existing) {
        return { success: false, error: 'Card already exists' };
    }

    const newCard = await Card.create({
        ...data,
        content: data.content || `${data.firstName} ${data.lastName}`
    });
    
    // Explicitly return plain object to avoid serialization errors
    return {
      success: true,
      data: {
          uuid: newCard.uuid,
          firstName: newCard.firstName,
          lastName: newCard.lastName,
          phone: newCard.phone,
          address: newCard.address,
          preference: newCard.preference,
          content: newCard.content,
          createdAt: newCard.createdAt?.toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating card:', error);
    return { success: false, error: 'Failed to register card' };
  }
}

export async function updateCard(data: CardData): Promise<CardResponse> {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.uuid) {
        return { success: false, error: 'UUID is required' };
    }

    try {
        await dbConnect();
        
        const updatedCard = await Card.findOneAndUpdate(
            { uuid: data.uuid },
            { 
                ...data,
                content: data.content || `${data.firstName} ${data.lastName}`
             },
            { new: true, runValidators: true, lean: true }
        ) as unknown as ICard;

        if (!updatedCard) {
            return { success: false, error: 'Card not found' };
        }

        return {
            success: true,
            data: {
                uuid: updatedCard.uuid,
                firstName: updatedCard.firstName,
                lastName: updatedCard.lastName,
                phone: updatedCard.phone,
                address: updatedCard.address,
                preference: updatedCard.preference,
                content: updatedCard.content,
                createdAt: updatedCard.createdAt?.toISOString()
            }
        };

    } catch (error) {
        console.error('Error updating card:', error);
        return { success: false, error: 'Failed to update card' };
    }
}

export async function getAllCards(): Promise<AllCardsResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    await dbConnect();
    
    const cards = await Card.find({})
      .sort({ createdAt: -1 })
      .lean() as unknown as ICard[];

    return {
      success: true,
      data: cards.map(card => ({
        uuid: card.uuid,
        firstName: card.firstName,
        lastName: card.lastName,
        phone: card.phone,
        address: card.address,
        preference: card.preference,
        content: card.content,
        createdAt: card.createdAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching cards:', error);
    return { success: false, error: 'Failed to fetch cards' };
  }
}
