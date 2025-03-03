import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateAccountRequest,
  UpdateAccountRequest,
  GetAccountRequest,
  GetAllAccountsRequest,
  DeleteAccountRequest,
} from '../types/account';
import { DatabaseError } from '../db/client';

/**
 * Creates a new account
 */
export async function createAccount(
  request: FastifyRequest<CreateAccountRequest>,
  reply: FastifyReply
) {
  try {
    const account = await request.server.accountService.create(request.body);
    return reply.code(201).send(account);
  } catch (error) {
    request.log.error(error, 'Failed to create account');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while creating the account',
    });
  }
}

/**
 * Updates an existing account
 */
export async function updateAccount(
  request: FastifyRequest<UpdateAccountRequest>,
  reply: FastifyReply
) {
  try {
    const account = await request.server.accountService.update(
      request.params.id,
      request.body
    );
    return reply.code(200).send(account);
  } catch (error) {
    request.log.error(error, 'Failed to update account');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating the account',
    });
  }
}

/**
 * Gets an account by ID
 */
export async function getAccount(
  request: FastifyRequest<GetAccountRequest>,
  reply: FastifyReply
) {
  try {
    const account = await request.server.accountService.getById(request.params.id);
    return reply.code(200).send(account);
  } catch (error) {
    request.log.error(error, 'Failed to get account');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving the account',
    });
  }
}

/**
 * Gets all accounts with optional filtering
 */
export async function getAllAccounts(
  request: FastifyRequest<GetAllAccountsRequest>,
  reply: FastifyReply
) {
  try {
    const { limit, offset, user_id, item_id } = request.query;
    
    const accounts = await request.server.accountService.getAll({
      limit,
      offset,
      userId: user_id,
      itemId: item_id,
    });
    
    return reply.code(200).send(accounts);
  } catch (error) {
    request.log.error(error, 'Failed to get accounts');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving accounts',
    });
  }
}

/**
 * Deletes an account
 */
export async function deleteAccount(
  request: FastifyRequest<DeleteAccountRequest>,
  reply: FastifyReply
) {
  try {
    await request.server.accountService.delete(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error, 'Failed to delete account');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the account',
    });
  }
} 