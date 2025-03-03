import { useEffect, useState, useRef } from 'react';
import { useSocketIO } from '../hooks/useSocketIO';

interface Transaction {
  id: string;
  name: string;
  amount: number;
}

interface NewTransactionsData {
  itemId: string;
}

interface TransactionsListProps {
  itemId: string;
}

export default function TransactionsList({ itemId }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const prevItemIdRef = useRef(itemId);
  
  // Listen for transaction updates
  const { data: newTransactionsData } = useSocketIO<NewTransactionsData>('NEW_TRANSACTIONS_DATA');
  const newDataRef = useRef(newTransactionsData);
  
  // Fetch transactions when component mounts or itemId changes
  useEffect(() => {
    fetchTransactions();
    prevItemIdRef.current = itemId;
  }, [itemId]);
  
  // Handle socket notifications separately
  useEffect(() => {
    if (newTransactionsData && 
        newTransactionsData !== newDataRef.current && 
        newTransactionsData.itemId === itemId) {
      fetchTransactions();
      newDataRef.current = newTransactionsData;
    }
  }, [newTransactionsData, itemId]);
  
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/items/${itemId}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  return (
    <div>
      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <ul>
          {transactions.map(transaction => (
            <li key={transaction.id}>
              {transaction.name}: ${transaction.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 