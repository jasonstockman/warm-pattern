import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateAssetRequest,
  UpdateAssetRequest,
  GetAssetRequest,
  GetAllAssetsRequest,
  DeleteAssetRequest,
} from '../types/asset';
import { DatabaseError } from '../db/client';

/**
 * Creates a new asset
 */
export async function createAsset(
  request: FastifyRequest<CreateAssetRequest>,
  reply: FastifyReply
) {
  try {
    const asset = await request.server.assetService.create(request.body);
    return reply.code(201).send(asset);
  } catch (error) {
    request.log.error(error, 'Failed to create asset');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while creating the asset',
    });
  }
}

/**
 * Updates an existing asset
 */
export async function updateAsset(
  request: FastifyRequest<UpdateAssetRequest>,
  reply: FastifyReply
) {
  try {
    const asset = await request.server.assetService.update(
      request.params.id,
      request.body
    );
    return reply.code(200).send(asset);
  } catch (error) {
    request.log.error(error, 'Failed to update asset');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating the asset',
    });
  }
}

/**
 * Gets an asset by ID
 */
export async function getAsset(
  request: FastifyRequest<GetAssetRequest>,
  reply: FastifyReply
) {
  try {
    const asset = await request.server.assetService.getById(request.params.id);
    return reply.code(200).send(asset);
  } catch (error) {
    request.log.error(error, 'Failed to get asset');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving the asset',
    });
  }
}

/**
 * Gets all assets with optional filtering
 */
export async function getAllAssets(
  request: FastifyRequest<GetAllAssetsRequest>,
  reply: FastifyReply
) {
  try {
    const { limit, offset, user_id, type } = request.query;
    
    const assets = await request.server.assetService.getAll({
      limit,
      offset,
      userId: user_id,
      type,
    });
    
    return reply.code(200).send(assets);
  } catch (error) {
    request.log.error(error, 'Failed to get assets');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving assets',
    });
  }
}

/**
 * Deletes an asset
 */
export async function deleteAsset(
  request: FastifyRequest<DeleteAssetRequest>,
  reply: FastifyReply
) {
  try {
    await request.server.assetService.delete(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error, 'Failed to delete asset');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the asset',
    });
  }
} 