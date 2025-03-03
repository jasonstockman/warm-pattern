import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  GetTransactionRequest,
  GetAllTransactionsRequest,
  DeleteTransactionRequest,
} from '../types/transaction';
import { DatabaseError } from '../db/client';

/**
 * Creates a new transaction
 */
export async function createTransaction(
  request: FastifyRequest<CreateTransactionRequest>,
  reply: FastifyReply
) {
  try {
    const transaction = await request.server.transactionService.create(request.body);
    return reply.code(201).send(transaction);
  } catch (error) {
    request.log.error(error, 'Failed to create transaction');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while creating the transaction',
    });
  }
}

/**
 * Updates an existing transaction
 */
export async function updateTransaction(
  request: FastifyRequest<UpdateTransactionRequest>,
  reply: FastifyReply
) {
  try {
    const transaction = await request.server.transactionService.update(
      request.params.id,
      request.body
    );
    return reply.code(200).send(transaction);
  } catch (error) {
    request.log.error(error, 'Failed to update transaction');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating the transaction',
    });
  }
}

/**
 * Gets a transaction by ID
 */
export async function getTransaction(
  request: FastifyRequest<GetTransactionRequest>,
  reply: FastifyReply
) {
  try {
    const transaction = await request.server.transactionService.getById(request.params.id);
    return reply.code(200).send(transaction);
  } catch (error) {
    request.log.error(error, 'Failed to get transaction');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving the transaction',
    });
  }
}

/**
 * Gets all transactions with optional filtering
 */
export async function getAllTransactions(
  request: FastifyRequest<GetAllTransactionsRequest>,
  reply: FastifyReply
) {
  try {
    const { limit, offset, user_id, account_id, start_date, end_date, category } = request.query;
    
    const transactions = await request.server.transactionService.getAll({
      limit,
      offset,
      userId: user_id,
      accountId: account_id,
      startDate: start_date,
      endDate: end_date,
      category,
    });
    
    return reply.code(200).send(transactions);
  } catch (error) {
    request.log.error(error, 'Failed to get transactions');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving transactions',
    });
  }
}

/**
 * Deletes a transaction by ID
 */
export async function deleteTransaction(
  request: FastifyRequest<DeleteTransactionRequest>,
  reply: FastifyReply
) {
  try {
    await request.server.transactionService.delete(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    request.log.error(error, 'Failed to delete transaction');
    if (error instanceof DatabaseError) {
      return reply.code(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }
    return reply.code(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while deleting the transaction',
    });
  }
} 