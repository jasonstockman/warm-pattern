import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateProfileRequest,
  UpdateProfileRequest,
  GetProfileRequest,
  GetAllProfilesRequest,
  DeleteProfileRequest,
} from '../types/profile';
import { DatabaseError } from '../db/client';

/**
 * Creates a new profile
 */
export async function createProfile(
  request: FastifyRequest<CreateProfileRequest>,
  reply: FastifyReply
) {
  try {
    const profile = await request.server.profileService.create(request.body);
    return reply.code(201).send(profile);
  } catch (error) {
    request.log.error(error, 'Failed to create profile');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while creating the profile',
    });
  }
}

/**
 * Updates an existing profile
 */
export async function updateProfile(
  request: FastifyRequest<UpdateProfileRequest>,
  reply: FastifyReply
) {
  try {
    const profile = await request.server.profileService.update(
      request.params.id,
      request.body
    );
    return reply.code(200).send(profile);
  } catch (error) {
    request.log.error(error, `Failed to update profile ${request.params.id}`);
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating the profile',
    });
  }
}

/**
 * Gets a profile by ID
 */
export async function getProfile(
  request: FastifyRequest<GetProfileRequest>,
  reply: FastifyReply
) {
  try {
    const profile = await request.server.profileService.getById(request.params.id);
    return reply.code(200).send(profile);
  } catch (error) {
    request.log.error(error, `Failed to get profile ${request.params.id}`);
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving the profile',
    });
  }
}

/**
 * Gets all profiles with pagination
 */
export async function getAllProfiles(
  request: FastifyRequest<GetAllProfilesRequest>,
  reply: FastifyReply
) {
  try {
    const { limit, offset, user_id } = request.query;
    const profiles = await request.server.profileService.getAll({
      limit,
      offset,
      userId: user_id,
    });
    return reply.code(200).send(profiles);
  } catch (error) {
    request.log.error(error, 'Failed to get profiles');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving profiles',
    });
  }
}

/**
 * Deletes a profile
 */
export async function deleteProfile(
  request: FastifyRequest<DeleteProfileRequest>,
  reply: FastifyReply
) {
  try {
    await request.server.profileService.delete(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error, `Failed to delete profile ${request.params.id}`);
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the profile',
    });
  }
} 