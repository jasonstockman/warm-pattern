import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateItemRequest,
  UpdateItemRequest,
  GetItemRequest,
  GetAllItemsRequest,
  DeleteItemRequest,
  Item
} from '../types/item';
import { DatabaseError } from '../db/client';

// Helper function to create a safe item response (without access token)
function createSafeItemResponse(item: Item) {
  // Extract all properties except plaid_access_token
  const { plaid_access_token, ...safeItem } = item;
  return safeItem;
}

/**
 * Creates a new item
 */
export async function createItem(
  request: FastifyRequest<CreateItemRequest>,
  reply: FastifyReply
) {
  try {
    const item = await request.server.itemService.create(request.body);
    // Remove sensitive access token before returning
    const safeItem = createSafeItemResponse(item);
    return reply.code(201).send(safeItem);
  } catch (error) {
    request.log.error(error, 'Failed to create item');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while creating the item',
    });
  }
}

/**
 * Updates an existing item
 */
export async function updateItem(
  request: FastifyRequest<UpdateItemRequest>,
  reply: FastifyReply
) {
  try {
    const item = await request.server.itemService.update(
      request.params.id,
      request.body
    );
    // Remove sensitive access token before returning
    const safeItem = createSafeItemResponse(item);
    return reply.code(200).send(safeItem);
  } catch (error) {
    request.log.error(error, 'Failed to update item');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating the item',
    });
  }
}

/**
 * Gets an item by ID
 */
export async function getItem(
  request: FastifyRequest<GetItemRequest>,
  reply: FastifyReply
) {
  try {
    const item = await request.server.itemService.getById(request.params.id);
    // Remove sensitive access token before returning
    const safeItem = createSafeItemResponse(item);
    return reply.code(200).send(safeItem);
  } catch (error) {
    request.log.error(error, 'Failed to get item');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving the item',
    });
  }
}

/**
 * Gets all items with optional filtering
 */
export async function getAllItems(
  request: FastifyRequest<GetAllItemsRequest>,
  reply: FastifyReply
) {
  try {
    const { limit, offset, user_id, status } = request.query;
    
    const items = await request.server.itemService.getAll({
      limit,
      offset,
      userId: user_id,
      status,
    });
    
    // Remove sensitive access tokens before returning
    const safeItems = items.map(item => createSafeItemResponse(item));
    
    return reply.code(200).send(safeItems);
  } catch (error) {
    request.log.error(error, 'Failed to get items');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving items',
    });
  }
}

/**
 * Deletes an item
 */
export async function deleteItem(
  request: FastifyRequest<DeleteItemRequest>,
  reply: FastifyReply
) {
  try {
    await request.server.itemService.delete(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error, 'Failed to delete item');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the item',
    });
  }
} 